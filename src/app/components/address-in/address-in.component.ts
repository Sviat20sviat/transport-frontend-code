import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { AddressTypes } from '../address-out/address-out.component';
import { AddressesService } from '../../services/api/addresses.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'address-in',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        MatInputModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule,
        MatMenuModule
    ],
    templateUrl: './address-in.component.html',
    styleUrl: './address-in.component.scss'
})
export class AddressInComponent {

  addresses = [];
  loaderId = 'address-in-component';

  constructor(
    private dialogsManager: DialogsManagerService,
    private addressesService: AddressesService,
    private ngx: NgxUiLoaderService
  ) {
    this.getAll();
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
    this.addressesService.getFilteredAddress({addressType: AddressTypes.InAddress}).pipe(finalize(() => this.ngx.stopLoader(this.loaderId))).subscribe((res: any) => {
      console.log('console',res);
      this.addresses = res;
    })
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
