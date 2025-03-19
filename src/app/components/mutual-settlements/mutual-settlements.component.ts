import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import {
  Form,
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
  loaderId = 'mutual-settlements1';
  unsubscribeAll$: Subject<any> = new Subject();

  mutualSettlements = [];
  mutualSettlementsForDrivers = [];
  selectedTabIndex = 1;
  filterForm: FormGroup;

  usersUsers = [];
  usersDrivers = [];
  documents = [];
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
  constructor(
    private fb: FormBuilder,
    private stateService: StateService,
    private documentsService: DocumentsService,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService
  ) {
    this.filterForm = fb.group({
      userId: [null, []],
      salesChannel: [null, []],
      range: fb.group({
        fromTime: [null, []],
        toTime: [null, []],
      }),
    });
    this.getSettlements();
  }

  ngOnInit(): void {
    this.stateService.documentsUpdatesSignal.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res) => {
      if (res) {
        this.getSettlements();
      }
    });
    this.setFilterFormDefaultValues();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  getSettlements() {
    console.log('loadData',);
    const values = this.filterForm.value;

    let fromTime = moment(values?.range.fromTime).startOf('day').unix();
    let toTime = moment(values?.range.toTime).endOf('day').unix();
    console.log('fromTimetoTime',fromTime,toTime);
    if(!fromTime || !toTime) {
      fromTime = moment().startOf('month').unix();
      toTime = moment().endOf('month').unix();
    };
    const createdAt = { fromTime: fromTime, toTime: toTime };

    const data = {
      userId: values?.userId,
      createdAt,
      salesChannelId: values?.salesChannel,
    }

    this.ngxService.startLoader(this.loaderId);
    combineLatest({
      clients: this.stateService.clients$,
      documents: this.documentsService.getAllDocuments(data),
    })
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(({ clients, documents }) => {
        this.usersUsers = clients;
        this.usersDrivers =  Array.from(this.stateService.driversMap.values());
        console.log('this.usersDrivers',this.usersDrivers);
        this.mutualSettlements = [];
        this.documents = documents?.filter((d) => d.userBalanseAfter || d.userBalanseAfter === 0 );
        this.setData();
        this.ngxService.stopLoader(this.loaderId);
      });
  }

  // createSettlement() {
  //   console.log('createSettlement',);
  //   const values = this.filterForm.value;
  //   this.ngxService.startLoader(this.loaderId);
  //   const fromTime = moment(values?.range.fromTime).startOf('day').unix();
  //   const toTime = moment(values?.range.toTime).endOf('day').unix();

  //   const createdAt = { fromTime: fromTime, toTime: toTime };
  //   const userId = values.user;
  //   this.documentsService
  //     .getAllDocuments({createdAt, userId, salesChannel: values.salesChannel})
  //     .pipe(takeUntil(this.unsubscribeAll$))
  //     .subscribe({
  //       next: (res) => {
  //         if (!res) {
  //           return;
  //         }
  //         this.mutualSettlements = [];
  //         this.documents = res;
  //         this.setData();
  //         this.ngxService.stopLoader(this.loaderId);
  //       },
  //       error: (err) => {
  //         this.ngxService.stopLoader(this.loaderId);
  //         console.error('err', err);
  //       }
  //     });
  // }

  openSettlementDialog(settlement) {}

  selectTab(index: number) {
    this.selectedTabIndex = index;
    if (index == 1) {
      this.mutualSettlements = [];
      this.setData();
    } else if(index == 2) {
      this.mutualSettlements = [];
      this.mutualSettlementsForDrivers = [];
      this.setDataForDrivers();
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
          user,
          document,
          post: document?.postBasisId ? this.stateService.postsMap.get(document?.postBasisId) : null,
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

  setDataForDrivers() {
    console.log('usersDrivers', this.usersDrivers);
    console.log('document', this.documents);
    let index = 1;
    this.mutualSettlementsForDrivers = [];
    this.usersDrivers = this.usersDrivers.map((user) => {
      user.documents = this.documents.filter(
        (document) => document.status === 1 && document.clientId == user.id
      );
      user?.selectedByDriverPosts?.forEach((post) => {
        let settlement = {
          user,
          document,
          post: post,
          index,
        };

        this.mutualSettlementsForDrivers.push(settlement);
        index++;
      });
      return user;
    });
    console.log('this.usersUsers MAPPED', this.usersUsers);
    console.log('this.mutualSettlementsForDrivers', this.mutualSettlementsForDrivers);
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

  calcDriverDataLength (userId): number {
    const allWithUser = this.mutualSettlementsForDrivers.filter(
      (settlement) => settlement.user.id == userId
    );
    console.log('allWithUser',allWithUser?.length);
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
    const user = this.usersUsers.find((user) => user.id == id) || this.usersDrivers.find((user) => user.id == id);
    if (!user) {
      this.dialogsManager.openInfoMessageDialog('Пользователь не найден');
      return;
    };
    this.dialogsManager.openUserDialog(user);
  }

  openPostDialog(id) {
    const post = this.stateService.postsMap.get(id);
    if (!post) {
      this.dialogsManager.openInfoMessageDialog('Пост не найден');
      return;
    };
    this.dialogsManager.openPostDialog(post);
  }

  clearFilter() {
    this.filterForm.reset();
    // this.setData();
  }

  getAfterDebtSaldo(user) {
    return user?.documents[0]?.userBalanseAfter;
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

  get range(): FormGroup {
    return (this.filterForm.get('range') as FormGroup);
  }

  setFilterFormDefaultValues() {
    console.log('setFilterFormDefaultValues',);
    this.filterForm.patchValue({
      range: {
        fromTime: new Date(moment().startOf('month').unix()*1000),
        toTime: new Date(moment().endOf('month').unix()*1000),
      },
    });
    console.log('this.filterForm',this.filterForm?.value);
  }

  getDriverSum(user): number {
    let sum = 0;
    this.mutualSettlementsForDrivers.filter(m => m.user.id == user.id).forEach(m => {
      console.log('m',m);
      sum += Number(m.post?.commission);
    });
    return sum;
  }
}