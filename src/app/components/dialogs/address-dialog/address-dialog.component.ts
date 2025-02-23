import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DatepickerFieldComponent } from '../../shared/datepicker-field/datepicker-field.component';
import { SelectFieldComponent } from '../../shared/select-field/select-field.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddressesService } from '../../../services/api/addresses.service';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';

@Component({
    selector: 'address-dialog',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UsersComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        InputFieldComponent,
        MatInputModule,
        MatIconModule,
        DatepickerFieldComponent,
        SelectFieldComponent,
        MatCheckboxModule,
        MatExpansionModule,
    ],
    templateUrl: './address-dialog.component.html',
    styleUrl: './address-dialog.component.scss'
})
export class AddressDialogComponent {

  address: any;
  form: FormGroup;
  loaderId = 'address-dialog';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { address, addressType },
    private fb: FormBuilder,
    private addressesService: AddressesService,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService,
    private dialogRef: MatDialogRef<AddressDialogComponent>,
  ) {
    this.form = this.fb.group({
      organization: ['', Validators.required],
      district: ['', Validators.required],
      name: ['', Validators.required],
      address: ['', Validators.required],
      // build: ['', Validators.required],
      coordinates: ['', Validators.required],
      phone: [''],
      // addressStatus: ['', Validators.required],
      comment: ['', Validators.required],
      location: ['', Validators.required],
      addressStatusId: ['', Validators.required],
    });

    if(data?.address) {
      this.form.patchValue(data?.address);
      this.address = data?.address;
    };
  }

  edit() {
    const values = this.form.value;
    this.addressesService.updateAddress(this.address.id, values).subscribe(res => {
      if(!res) {
        this.dialogsManager.openInfoMessageDialog('НЕ УДАЛОСЬ ОБНОВИТЬ АДРЕС!').afterClosed().subscribe(() => {
          this.ngxService.stopLoader(this.loaderId);
        });
      }
      this.dialogsManager.openInfoMessageDialog('АДРЕС ОБНОВЛЕН!').afterClosed().subscribe(() => {
        this.ngxService.stopLoader(this.loaderId);
        this.dialogRef.close(res);
      });
      console.log('updateAddress',res);
    })

  }

  create() {
    const values = this.form.value;
    values.coordinates = [3733, 557558];
    values.addressType = this.data.addressType;
    console.log('console',values);
    this.ngxService.startLoader(this.loaderId);
    this.addressesService.createAddress(values).subscribe((res) => {
      console.log('createAddress',res);
      this.dialogsManager.openInfoMessageDialog('УСПЕШНО СОЗДАН НОВЫЙ АДРЕС!').afterClosed().subscribe(() => {
        this.ngxService.stopLoader(this.loaderId);
        this.dialogRef.close(res);
      });
    });
  }

  getAll() {
    this.addressesService.getAddresses().subscribe(res => {
      console.log('console',res);
    })
  }

}
