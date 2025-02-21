import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { AddressesService } from '../../services/api/addresses.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, finalize } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';

@Component({
    selector: 'address-out',
    imports: [
        CommonModule,
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
    ],
    templateUrl: './address-out.component.html',
    styleUrl: './address-out.component.scss'
})
export class AddressOutComponent implements OnDestroy{
  
  addresses = [];
  loaderId = 'address-component';
  unsubscribeAll$: Subject<any> = new Subject();

  constructor(
    private dialogsManager: DialogsManagerService,
    private addressesService: AddressesService,
    private ngx: NgxUiLoaderService
  ) {
    this.getAll();
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
    this.dialogsManager.openAddressDialog(address);
  }

  getAll() {
    this.ngx.startLoader(this.loaderId);
    this.addressesService.getFilteredAddress({addressType: AddressTypes.OutAddress}).pipe(finalize(() => this.ngx.stopLoader(this.loaderId))).subscribe((res: any) => {
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

  }

  getFiltered() {
    
  }
}

export enum AddressTypes {
  InAddress = 1,
  OutAddress = 2
}