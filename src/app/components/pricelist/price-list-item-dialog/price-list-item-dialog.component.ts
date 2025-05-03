import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ProfileDetailsComponent } from '../../profile-details/profile-details.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DriverInfoComponent } from '../../driver-info/driver-info.component';
import { PostsTableComponent } from '../../posts-table/posts-table.component';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DocumentsComponent } from '../../documents/documents.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddressInComponent } from '../../address-in/address-in.component';
import { AddressOutComponent } from '../../address-out/address-out.component';
import { MutualSettlementsComponent } from '../../mutual-settlements/mutual-settlements.component';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { ContactsComponent } from '../../contacts/contacts.component';
import { MatMenuModule } from '@angular/material/menu';
import { WarehousesComponent } from '../../warehouses/warehouses.component';
import { WarehouseComponent } from '../../warehouse/warehouse.component';
import { SelectFieldComponent } from '../../shared/select-field/select-field.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreatePriceCategoryItemDto, PriceListService, UpdatePriceCategoryItemDto } from '../../../services/api/pricelist.service';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';

@Component({
  selector: 'app-price-list-item-dialog',
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
    // YMapComponent, YMapDefaultSchemeLayerDirective,
    MatTooltipModule,
    AddressInComponent,
    AddressOutComponent,
    MutualSettlementsComponent,
    InputFieldComponent,
    ContactsComponent,
    MatMenuModule,
    WarehousesComponent,
    WarehouseComponent,
    SelectFieldComponent,
  ],
  templateUrl: './price-list-item-dialog.component.html',
  styleUrl: './price-list-item-dialog.component.scss'
})
export class PriceListItemDialogComponent implements OnInit {
  item;
  form: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { category, priceItem },
    public dialogRef: MatDialogRef<PriceListItemDialogComponent>,
    private fb: FormBuilder,
    private priceListService: PriceListService,
    private dialogsManager: DialogsManagerService
  ) {
    if(data?.priceItem) {
      this.item = data.priceItem;
    };
  }
  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      commission: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      sum: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    });
    if(this.item) {
      this.form.patchValue(this.item);
    };
  }

  create() {
    const values = this.form.value;
    const data: CreatePriceCategoryItemDto = {
      name: values.name,
      commission: values.commission,
      sum:  values.sum,
      categoryId: this.data.category.id
    };
    this.priceListService.createItem(data).subscribe((res) => {
      console.log('res',res);
      if(res) {
        this.dialogsManager.openInfoMessageDialog("Успешно!").afterClosed().subscribe(() => {
          this.dialogRef.close(res);
        });

      }
    })
  }

  edit() {
    const values = this.form.value;

    const data: UpdatePriceCategoryItemDto = {
      id: this.item.id,
      name: values.name,
      commission: values.commission,
      sum:  values.sum,
      categoryId: this.data.category.id
    };
    this.priceListService.updateItem(data).subscribe((res) => {
      if(res) {
        this.dialogsManager.openInfoMessageDialog("Успешно Обновлено!").afterClosed().subscribe(() => {
          this.dialogRef.close(res);
        });
      };
    })
  }

}
