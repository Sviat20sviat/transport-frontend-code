import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { AddressesService } from '../../services/api/addresses.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { StateService } from '../../services/state.service';
import { Subject, combineLatest, finalize, forkJoin, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';
import { DocumentsService } from '../../services/api/documents.service';
import { MatMenuModule } from '@angular/material/menu';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';
@Component({
  selector: 'mutual-settlements',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    MatTooltipModule,
    MatMenuModule,
    SelectFieldComponent,
  ],
  templateUrl: './mutual-settlements.component.html',
  styleUrl: './mutual-settlements.component.scss',
})
export class MutualSettlementsComponent implements OnInit, OnDestroy {
  loaderId = 'mutual-settlements';
  unsubscribeAll$: Subject<any> = new Subject();

  mutualSettlements = [];
  selectedTabIndex = 1;
  range: FormGroup;
  filterForm: FormGroup;

  usersUsers = [];
  documents = [];
  constructor(
    private fb: FormBuilder,
    private stateService: StateService,
    private documentsService: DocumentsService,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService
  ) {
    this.range = fb.group({
      fromTime: ['', [Validators.required]],
      toTime: ['', [Validators.required]],
    });
    this.filterForm = fb.group({
      user: ['', [Validators.required]],
      range: fb.group({
        fromTime: ['', [Validators.required]],
        toTime: ['', [Validators.required]],
      }),
    });
    this.loadData();
  }

  ngOnInit(): void {
    this.stateService.documentsUpdatesSignal.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res) => {
      if (res) {
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  loadData() {
    this.ngxService.startLoader(this.loaderId);
    combineLatest({
      clients: this.stateService.clients$,
      documents: this.documentsService.getAllDocuments(),
    })
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(({ clients, documents }) => {
        this.usersUsers = clients;
        this.documents = documents?.filter((d) => d.userBalanseAfter);
        this.setData();
        this.ngxService.stopLoader(this.loaderId);
      });
  }

  createSettlement() {
    const values = this.range.value;
    console.log('values', values);
    if (!values.fromTime || !values.toTime) {
      return;
    }
    this.ngxService.startLoader(this.loaderId);
    const fromTime = moment(values.fromTime).startOf('day').unix();
    const toTime = moment(values.toTime).endOf('day').unix();
    console.log('fromTime', fromTime);
    console.log('toTime', toTime);

    const createdAt = { fromTime: fromTime, toTime: toTime };
    this.documentsService
      .getAllDocuments()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res) => {
          if (!res) {
            return;
          }
          this.mutualSettlements = [];
          this.documents = res;
          this.setData();
          this.ngxService.stopLoader(this.loaderId);
        },
        error: (err) => {
          this.ngxService.stopLoader(this.loaderId);
          console.error('err', err);
        }
      });
  }

  openSettlementDialog(settlement) {}

  selectTab(index: number) {
    this.selectedTabIndex = index;
    if (index == 1) {
      this.mutualSettlements = [];
      this.setData();
    } else {
      this.mutualSettlements = [];
    }
  }

  setData() {
    console.log('usersUsers', this.usersUsers);
    console.log('document', this.documents);
    let index = 1;
    this.usersUsers = this.usersUsers.map((user) => {
      user.documents = this.documents.filter(
        (document) => document.status === 1 && document.clientId == user.id
      );
      user?.documents?.forEach((document) => {
        let settlement = {
          user: user,
          document,
          index,
        };

        this.mutualSettlements.push(settlement);
        index++;
      });
      return user;
    });
    console.log('this.usersUsers MAPPED', this.usersUsers);
    console.log('this.mutualSettlements', this.mutualSettlements);
  }

  calcUserDataLength(userId): number {
    const allWithUser = this.mutualSettlements.filter(
      (settlement) => settlement.user.id == userId
    );
    if (!allWithUser?.length) {
      return 1;
    }
    return allWithUser?.length;
  }

  openDocument(id) {
    const document = this.documents.find((d) => d.id == id);
    if (!document) {
      this.dialogsManager.openInfoMessageDialog('Документ не найден');
      return;
    };
    this.dialogsManager.openDocumentDialog(document);
  }

  openUser(id) {
    const user = this.usersUsers.find((user) => user.id == id);
    if (!user) {
      this.dialogsManager.openInfoMessageDialog('Пользователь не найден');
      return;
    };
    this.dialogsManager.openUserDialog(user);
  }

  clearFilter() {
    this.filterForm.reset();
    this.range.reset();
    // this.setData();
  }

  getAfterDebtSaldo(user) {
    let credit = 0;
    let debt = 0;

    user?.documents.forEach((document) => {
      if (document.docType === 1) {
        credit += (+document.sum);
      } else {
        debt += (+document.sum);
      };
    });

    return debt - credit;


    console.log('getAfterSaldo',user);
    if(user?.documents[0]?.status === 1) {
      return user?.documents[0]?.userBalanseAfter;

    } else {
      console.log('else',);
      let findDocumentSaldo;
      for (const document of user?.documents || []) {
        if (document.status === 1) {
          findDocumentSaldo = document.userBalanseAfter;
          console.log('findDocumentSaldo', document, findDocumentSaldo);
          break;
        }
      }
      if(!findDocumentSaldo) {
        return 0;
      } else {
        return findDocumentSaldo;
      }
    };
  }
}
