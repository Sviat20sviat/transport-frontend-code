import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { AddressFilterData, AddressesService } from '../../services/api/addresses.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, finalize } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';
import { InputFieldComponent } from '../shared/input-field/input-field.component';

@Component({
    selector: 'address-out',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        MatInputModule, FormsModule,
        MatTooltipModule,
        MatIconModule,
        MatDatepickerModule,
        MatMenuModule,
        SelectFieldComponent,
        InputFieldComponent
    ],
    templateUrl: './address-out.component.html',
    styleUrl: './address-out.component.scss'
})
export class AddressOutComponent implements OnDestroy{
  
  addresses = [];
  loaderId = 'address-component';
  unsubscribeAll$: Subject<any> = new Subject();

  addressStatuses = [
    {
      id: 1,
      name: 'Активный'
    },
    {
      id: 2,
      name: 'Неактивный'
    },
    {
      id: 3,
      name: 'Популярный'
    },
    {
      id: 4,
      name: 'Непопулярный'
    },
    {
      id: 5,
      name: 'Новый'
    },
    {
      id: 6,
      name: 'Временный'
    },
    {
      id: 7,
      name: 'Постоянный'
    },
  ];
  located = [
    {
      id: 1,
      name: 'В здании'
    },
    {
      id: 2,
      name: 'Обособлено'
    },
  ];
  filterForm: FormGroup;

  constructor(
    private dialogsManager: DialogsManagerService,
    private addressesService: AddressesService,
    private ngx: NgxUiLoaderService,
    private fb: FormBuilder
  ) {
    this.getAll();
    this.filterForm = fb.group({
      organization: ['', []],
      district: ['', []],
      name: ['', []],
      address: ['', []],
      phone: ['', []],
      addressStatusId: [null, []],
      location: [null, []],
      createdAt: fb.group({
        fromTime: [null, []],
        toTime: [null, []],
      }),
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  createAddress() {
    this.dialogsManager.openAddressDialog(null, AddressTypes.OutAddress).afterClosed().subscribe((res) => {
      if (res) {
        this.addresses.unshift(res);
      };
    });
  }

  openAddressDialog(address) {
    this.dialogsManager.openAddressDialog(address).afterClosed().subscribe((res) => {
      if (res) {
        this.addresses[this.addresses.findIndex(item => item.id === address.id)] = res;
      };
    });
  }

  getAll() {
    this.ngx.startLoader(this.loaderId);
    const values = this.filterForm?.value;
    const data: AddressFilterData = {
      addressType: AddressTypes.OutAddress,
      ...values
    };
    this.addressesService.getFilteredAddress(data).pipe(finalize(() => this.ngx.stopLoader(this.loaderId))).subscribe((res: any) => {
      console.log('console',res);
      this.addresses = res;
    });
  }

  delete(address, index) {

    this.dialogsManager.openInfoMessageDialog("Удалить адрес?", true).afterClosed().subscribe((res) => {
      if(res) {
        this.ngx.startLoader(this.loaderId);
        this.addressesService.deleteAddress(address.id).pipe(finalize(() => this.ngx.stopLoader(this.loaderId))).subscribe({
          next: () => {
            this.addresses.splice(index, 1);
            this.dialogsManager.openInfoMessageDialog("Адрес успешно удален!");
          },
          error: (err) => {
            console.error('err',err);
            this.dialogsManager.openInfoMessageDialog("Не удалось удалить Адрес, возможно он используется в заказах");
          }
        });
      };
    });
  }

  clearFilter() {
    this.filterForm.reset();
  }

  getLocationById(id) {
    return this.located.find(item => item.id === id)?.name || '--';
  }

  getAddressStatusById(id) {
    return this.addressStatuses.find(item => item.id === id)?.name || '--';
  }

  
  get range(): FormGroup {
    return (this.filterForm.get('createdAt') as FormGroup);
  }
}

export enum AddressTypes {
  InAddress = 1,
  OutAddress = 2
}