import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { AddressesService } from '../../services/api/addresses.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'address-out',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        MatInputModule, FormsModule, MatButtonModule, MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './address-out.component.html',
    styleUrl: './address-out.component.scss'
})
export class AddressOutComponent {
  
  addresses = [];
  loaderId = 'address-component';

  constructor(
    private dialogsManager: DialogsManagerService,
    private addressesService: AddressesService
  ) {
    this.getAll();
  }

  createAddress() {
    this.dialogsManager.openAddressDialog(null, AddressTypes.OutAddress);
  }

  openAddressDialog(address) {
    this.dialogsManager.openAddressDialog(address);
  }

  getAll() {
    this.addressesService.getFilteredAddress({addressType: AddressTypes.OutAddress}).subscribe((res: any) => {
      console.log('console',res);
      this.addresses = res;
    })
  }
}

export enum AddressTypes {
  InAddress = 1,
  OutAddress = 2
}