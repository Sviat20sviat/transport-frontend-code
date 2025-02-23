import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { AddressTypes } from '../address-out/address-out.component';
import { AddressFilterData, AddressesService } from '../../services/api/addresses.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';

@Component({
    selector: 'address-in',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        MatInputModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule,
        MatMenuModule,
        FormsModule,
        ReactiveFormsModule,
        InputFieldComponent,
        MatDatepickerModule,
        MatMenuModule,
        SelectFieldComponent,
    ],
    templateUrl: './address-in.component.html',
    styleUrl: './address-in.component.scss'
})
export class AddressInComponent {

  addresses = [];
  loaderId = 'address-in-component';
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

  createAddress() {
    this.dialogsManager.openAddressDialog(null, AddressTypes.InAddress).afterClosed().subscribe((res) => {
      if (res) {
        this.addresses.unshift(res);
      };
    });
  }

  openAddressDialog(address) {
    console.log('console',address);
    this.dialogsManager.openAddressDialog(address).afterClosed
  }

  getAll() {
    this.ngx.startLoader(this.loaderId);
    const values = this.filterForm?.value;
    const data: AddressFilterData = {
      addressType: AddressTypes.InAddress,
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
            this.dialogsManager.openInfoMessageDialog("Не удалось удалить Адрес, возможно он используется в объявлениях");
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
