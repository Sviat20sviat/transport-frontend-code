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
import { AddressTypes } from '../address-out/address-out.component';
import { AddressesService } from '../../services/api/addresses.service';

@Component({
  selector: 'address-in',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    MatInputModule, FormsModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './address-in.component.html',
  styleUrl: './address-in.component.scss'
})
export class AddressInComponent {

  addresses = [];
  loaderId = 'address-component';

  constructor(
    private dialogsManager: DialogsManagerService,
    private addressesService: AddressesService
  ) {
    this.getAll()
  }

  createAddress() {
    this.dialogsManager.openAddressDialog(null, AddressTypes.OutAddress);
  }

  openAddressDialog(address) {
    console.log('console',address);
    this.dialogsManager.openAddressDialog(address);
  }

  getAll() {
    this.addressesService.getFilteredAddress({addressType: AddressTypes.InAddress}).subscribe((res: any) => {
      console.log('console',res);
      this.addresses = res;
    })
  }

}
