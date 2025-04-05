
import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { StateService } from '../../../services/state.service';
import {
  CreatePostData,
  PostsService,
} from '../../../services/api/posts.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DatepickerFieldComponent } from '../../shared/datepicker-field/datepicker-field.component';
import { SelectFieldComponent } from '../../shared/select-field/select-field.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UserService as UserApiServie } from '../../../services/api/user.service';
import { BehaviorSubject, Subject, combineLatest, takeUntil } from 'rxjs';
import { PhotoSelectComponent } from '../../shared/photo-select/photo-select.component';
import { Warehouse, WarehousesService } from '../../../services/api/warehouses.service';
@Component({
  selector: 'app-warehouse-dialog',
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
    PhotoSelectComponent,
  ],
  templateUrl: './warehouse-dialog.component.html',
  styleUrl: './warehouse-dialog.component.scss'
})
export class WarehouseDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  warehouse: Warehouse | null = null;
  loaderId = 'warehouse-loader';
  users = [];
  warehouseWorkers = [];
  unsubscribeAll$: Subject<void> = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WarehouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { warehouse: Warehouse },
    private warehousesService: WarehousesService,
    private stateService: StateService,
    
  ) {
    this.warehouse = data?.warehouse || null;
  }


  ngOnInit(): void {
    this.initForm();
    if (this.warehouse) {
      this.populateForm(this.warehouse);
    }
    this.stateService.users$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((users) => {
      this.users = users.filter(user => user.roles.some(role => role.value === 'Admin' || role.value === 'Operator'));
      this.warehouseWorkers = users.filter(user => user.roles.some(role => role.value === 'Warehouse Worker'));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  /** Инициализация формы */
  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      lat: [''],
      lng: [''],
      phoneNumber: [''],
      supervisorId: [null, Validators.required],
      status: [''],
      workerIds: [],
    });
  }

  /** Заполнение формы данными существующего склада */
  private populateForm(warehouse: Warehouse): void {
    this.form.patchValue({
      name: warehouse.name,
      address: warehouse.address,
      lat: warehouse.coordinates?.lat || '',
      lng: warehouse.coordinates?.lng || '',
      phoneNumber: warehouse.phoneNumber || '',
      supervisorId: warehouse.supervisorId || '',
      status: warehouse.status || '',
      workerIds: warehouse.workerIds,
    });
  }

  /** Создание нового склада */
  create(): void {
    console.log('create',this.form.value);
    if (this.form.invalid) return;

    const data = this.prepareData();
    this.warehousesService.create(data).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  /** Обновление существующего склада */
  update(): void {
    if (this.form.invalid || !this.warehouse?.id) return;

    const data = { ...this.prepareData(), id: this.warehouse.id };
    this.warehousesService.update(this.warehouse.id, data).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  /** Подготовка данных для отправки на сервер */
  private prepareData(): any {
    const formValue = this.form.value;
    return {
      name: formValue.name,
      address: formValue.address,
      coordinates: {
        lat: parseFloat(formValue.lat),
        lng: parseFloat(formValue.lng),
      },
      phoneNumber: formValue.phoneNumber,
      supervisorId: formValue.supervisorId ? parseInt(formValue.supervisorId, 10) : null,
      status: formValue.status,
      workerIds: formValue.workerIds || []
    };
  }

  /** Закрытие диалога */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
