import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { DocumentsService } from '../../services/api/documents.service';
import { StateService } from '../../services/state.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';

@Component({
    selector: 'documents',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        SelectFieldComponent,
        MatDatepickerModule,
    ],
    templateUrl: './documents.component.html',
    styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit, OnDestroy {
  documents = [];
  loaderId = 'document-component';
  unsubscribeAll$: Subject<any> = new Subject();
  filterForm: FormGroup;
  saleChannels = [
    {
      id: null,
      name:"Все",
    },
    {
      id: 1,
      name:"Наличные",
    },
    {
      id: 2,
      name:"Банковским переводом",
    },
  ];
  usersUsers = [];
  constructor(
    private dialogsManager: DialogsManagerService,
    private documentsService: DocumentsService,
    private stateService: StateService,
    private ngxService: NgxUiLoaderService,
    private fb: FormBuilder
  ) {
    this.filterForm = fb.group({
      user: ['', []],
      salesChannel: ['', []],
      range: fb.group({
        fromTime: ['', []],
        toTime: ['', []],
      }),
    });
    this.getAllDocuments();
    this.stateService.clients$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res) => {
      this.usersUsers = res;
    });
  }

  ngOnInit(): void {
    this.stateService.documentsUpdatesSignal.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res) => {
      if (res) {
        this.getAllDocuments();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  openDocumentDialog(doc?) {
    console.log('openDocumentDilaog');
    this.dialogsManager.openDocumentDialog(doc).afterClosed().subscribe(res => {
      if(res) {
        this.getAllDocuments();
      };
    });
  }

  getAllDocuments() {
    const values = this.filterForm.value;
    this.ngxService.startLoader(this.loaderId);
    const fromTime = moment(values?.range.fromTime).startOf('day').unix();
    const toTime = moment(values?.range.toTime).endOf('day').unix();

    const createdAt = { fromTime: fromTime, toTime: toTime };
    const userId = values.user;
    this.ngxService.startLoader(this.loaderId);
    this.documentsService.getAllDocuments({createdAt, userId, salesChannel: values.salesChannel}).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      if (!res) {
        return;
      };
      this.documents = res;
    });
    // this.stateService.documents$.pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)),takeUntil(this.unsubscribeAll$)).subscribe((data) => {
    //   console.log('documents', data);
    //   this.ngxService.stopLoader(this.loaderId)
    //   if (data) {
    //     this.documents = data;
    //   };
    // })
  }

  getDocType(index: documentType): string {
    switch (index) {
      case documentType.UserPayment:
        return 'Спасание со счета Пользователя';

      case documentType.UserWriteOff:
        return 'Пополнение счета Пользователя';
      default:
        return '---';
    }
  }

  getDocStatus(index): string {
    switch (index) {
      case 1:
        return 'Проведен';

      case 2:
        return 'Отменен';
      default:
        return 'Проведен';
    }
  }

  openUser(userId) {
    if(!userId) {
      return;
    };
    this.stateService.users$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((users) => {
      const user = users.find(user => user.id === userId);
      this.dialogsManager.openUserDialog(user);
    });
  }

  openPost(postId) {
    if(!postId) {
      return;
    };
    this.stateService.posts$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((posts) => {
      const post = posts.find(post => post.id === postId);
      this.dialogsManager.openPostDialog(post);
    });
  }

  clearFilter() {
    this.filterForm.reset();
    // this.setData();
  }

  get range(): FormGroup {
    return (this.filterForm.get('range') as FormGroup);
  }
}

export enum documentType {
  UserPayment = 1,
  UserWriteOff = 2,
}
