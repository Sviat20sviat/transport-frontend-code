import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersComponent } from '../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import { DriverInfoComponent } from '../driver-info/driver-info.component';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddressInComponent } from '../address-in/address-in.component';
import { AddressOutComponent } from '../address-out/address-out.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { DocumentsComponent } from '../documents/documents.component';
import { MutualSettlementsComponent } from '../mutual-settlements/mutual-settlements.component';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';
import { WarehouseComponent } from '../warehouse/warehouse.component';
import { WarehousesComponent } from '../warehouses/warehouses.component';
import { PriceListService } from '../../services/api/pricelist.service';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { StateService } from '../../services/state.service';
import { filter, finalize, firstValueFrom, take } from 'rxjs';
import {
  AuditFilterData,
  AuditLogActions,
  AuditLogService,
} from '../../services/api/audit-log.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'audit',
  imports: [
    CommonModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    ProfileDetailsComponent,
    MatTabsModule,
    PostsTableComponent,
    DriverInfoComponent,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    DocumentsComponent,
    MatTooltipModule,
    InputFieldComponent,
    MatMenuModule,
    SelectFieldComponent,
    MatDatepickerModule,
    NgxJsonViewerModule
  ],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss',
})
export class AuditComponent implements OnInit, OnDestroy {
  currentUser;
  loaderId = 'audit';
  categoryForm;
  auditLog = [];
  filterForm: FormGroup;
  users: any[];
  actions = [
    {
      name: 'Создание',
      value: AuditLogActions.CREATE,
    },
    {
      name: 'Изменение',
      value: AuditLogActions.UPDATE,
    },
    {
      name: 'Удаление',
      value: AuditLogActions.DELETE,
    },
    {
      name: 'Логин Пользователя',
      value: AuditLogActions.LOGIN,
    },
  ];
  tableNames = [
    {
      name: 'Докумет',
      value: 'Document'
    },
    {
      name: 'Изображение',
      value: 'image'
    },
    {
      name: 'Заказ Пользователя',
      value: 'Post'
    },
    {
      name: 'Категория Прайс Листа',
      value: 'PriceCategory'
    },
    {
      name: 'Элемент Прайс Листа',
      value: 'PriceListItem'
    },
    {
      name: 'Пользователь',
      value: 'User'
    },
    {
      name: 'Логин',
      value: 'login'
    },
  ]
  constructor(
    private auditLogService: AuditLogService,
    private fb: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService,
    private stateService: StateService
  ) {
    this.initFilterForm();
    this.setFilterFormDefaultValues();
  }

  async ngOnInit(): Promise<void> {
    this.currentUser = await firstValueFrom(
      this.stateService.currentUser$.pipe(
        filter((user) => user !== null && user !== undefined),
        take(1)
      )
    );
    this.users = await firstValueFrom(
      this.stateService.users$.pipe(
        filter((users) => users !== null && users !== undefined),
        take(1)
      )
    );
    console.log('users', this.users);
  }
  ngOnDestroy(): void {}

  openLog(item) {}

  initFilterForm() {
    this.filterForm = this.fb.group({
      userId: [null],
      action: [null],
      tableName: [null],
      createdTime: this.fb.group({
        fromTime: [null],
        toTime: [null],
      }),
    });
  }

  filterUpdated() {
    this.ngxService.startLoader(this.loaderId);
    const value = this.filterForm.value;
    let fromTime = moment(value?.createdTime.fromTime).startOf('day').unix();
    let toTime = moment(value?.createdTime.toTime).endOf('day').unix();
    // if(!fromTime || !toTime) {
    //   fromTime = moment().startOf('day').unix();
    //   toTime = moment().endOf('day').unix();
    // };
    const createdAt = { fromTime: fromTime * 1000, toTime: toTime * 1000 };
    const data: AuditFilterData = {
      userId: value.userId,
      action: value.action,
      tableName: value.tableName,
      createdAt,
    };
    this.auditLogService
      .getFiltered(data)
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((res) => {
        this.auditLog = (res as any);
        console.log('res', res);
      });
  }

  clearFilter() {
    this.filterForm.reset();
  }

  get range(): FormGroup {
    return this.filterForm.get('createdTime') as FormGroup;
  }

  setFilterFormDefaultValues() {
    this.filterForm.patchValue({
      createdTime: {
        fromTime: new Date(moment().startOf('day').unix() * 1000),
        toTime: new Date(moment().endOf('day').unix() * 1000),
      },
    });
  }

  getAuditAction(action): string {
    switch (action) {
      case 'create':
        return 'Создание';
      case 'update':
        return 'Изменение';
      case 'delete':
        return 'Удаление';
      case 'login':
        return 'Логин Пользователя';
      default:
        return 'Создание';
    }
  }

  getTableName(name: string): string {
    switch (name) {
      case 'Document':
        return 'Докумет';
      case 'image':
        return 'Изображение';
      case 'Post':
        return 'Заказ Пользователя';
      case 'PriceCategory':
        return 'Категория Прайс Листа';
      case 'PriceListItem':
        return 'Элемент Прайс Листа';
      case 'User':
        return 'Пользователь';
      case 'login':
        return 'Логин';
      default:
        return 'Логин';
    } 
  }

  openJsonDialog(data) {
    if(!data?.afterData)  {
      return;
    };

    this.dialogsManager.openJsonViewerDialog(data, data?.afterData, data?.beforeData);
  }

  async openUserDialog(data) {
    const users = await firstValueFrom(this.stateService.users$.pipe(filter(users => !!users)));
    const user = users?.find(u => u.id === data?.userData?.id);
    if(!user) {
      return;
    };
    this.dialogsManager.openUserDialog(user);
  }
}
