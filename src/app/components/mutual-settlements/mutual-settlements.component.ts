import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
@Component({
  selector: 'mutual-settlements',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    MatInputModule, FormsModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, FormsModule, ReactiveFormsModule, JsonPipe,
    MatTooltipModule
  ],
  templateUrl: './mutual-settlements.component.html',
  styleUrl: './mutual-settlements.component.scss'
})
export class MutualSettlementsComponent implements OnInit, OnDestroy {

  loaderId = 'mutual-settlements';
  unsubscribeAll$: Subject<any> = new Subject();

  mutualSettlements = [];
  selectedTabIndex = 1;
  range: FormGroup;

  usersUsers = [];
  documents = [];
  constructor(
    private fb: FormBuilder,
    private stateService: StateService,
    private documentsService: DocumentsService,
    private ngxService: NgxUiLoaderService,
  ) {
    this.range = fb.group({
      fromTime: ['', [Validators.required]],
      toTime: ['', [Validators.required]],
    });
    combineLatest({
      clients: this.stateService.clients$,
      documents: this.stateService.documents$
    })
    .pipe(takeUntil(this.unsubscribeAll$))
    .subscribe(({ clients, documents }) => {
      this.usersUsers = clients;
      this.documents = documents?.filter(d => d.userBalanseAfter);
      this.setData();
    });


  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  createSettlement() {
    const values = this.range.value;
    console.log('values',values);
    if(!values.fromTime ||!values.toTime) {
      return;
    };
    this.ngxService.startLoader(this.loaderId);
    const fromTime = moment(values.fromTime).startOf('day').unix();
    const toTime = moment(values.toTime).endOf('day').unix();
    console.log('fromTime',fromTime);
    console.log('toTime',toTime);
  
    const createdAt ={fromTime: fromTime, toTime: toTime};
    this.documentsService.getAllDocuments(createdAt).pipe(takeUntil(this.unsubscribeAll$), finalize(()=> this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      if(!res) {
        return;
      };
      this.mutualSettlements = [];
      this.documents = res;
      this.setData();
    });
  }

  openSettlementDialog(settlement) {

  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
  }

  setData() {
    console.log('usersUsers',this.usersUsers);
    console.log('document',this.documents);
    let index = 1;
    this.usersUsers = this.usersUsers.map(user => {
      user.documents = this.documents.filter(document => document.clientId == user.id);
      user?.documents?.forEach((document) => {
        let settlement = {
          user: user,
          document,
          index
        };

        this.mutualSettlements.push(settlement);
        index++;
      })
      return user;
    });
    console.log('this.usersUsers MAPPED',this.usersUsers);
    console.log('this.mutualSettlements',this.mutualSettlements);
  }

  calcUserDataLength(userId): number {
    const allWithUser = this.mutualSettlements.filter(settlement => settlement.user.id == userId);
    if(!allWithUser?.length) {
      return 1;
    };
    return allWithUser?.length;
  }

  openDocument() {

  }

  openUser() {
    
  }
}
