import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { StateService } from '../../services/state.service';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { WarehousesService } from '../../services/api/warehouses.service';
import { Subject, finalize, take, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CargoStatusesEnum } from '../dialogs/post-dialog/post-dialog.component';
import { PostFilter, PostsService } from '../../services/api/posts.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';
import moment from 'moment';

@Component({
  selector: 'warehouses',
  imports: [
    CommonModule,
    NgxUiLoaderModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatMenuModule,
    SelectFieldComponent,
  ],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.scss'
})
export class WarehousesComponent implements OnInit, OnDestroy {
  warehouses = [];
  loaderId = 'warehouses';
  unsubscribeAll$: Subject<any> = new Subject();
  selectedWarehouse;
  warehousePosts;
  filterForm: FormGroup;
  statuses = [];
  cargoStatuses = [];
  
  constructor(
    private stateService: StateService,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService,
    private warehousesService: WarehousesService,
    private postService: PostsService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [null],
      cargoStatus: [null],
      range: this.fb.group({
        fromTime: '',
        toTime: ''
      }),
    });
    this.statuses = this.stateService.statuses;
    this.cargoStatuses = this.stateService.cargoStatuses;
   }

  ngOnInit(): void {
    this.filterUpdated();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  filterUpdated() {
    this.ngxService.startLoader(this.loaderId);
    this.warehousesService.getAll().pipe(takeUntil(this.unsubscribeAll$), finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res: any) => {
      this.warehouses = res;
    });
  }


  createWarehouse() {
    this.dialogsManager.openWarehouseDialog();
  }

  openUserDialog(user) {

  }

  openWarehousePostDialog(warehouse) {
    this.selectedWarehouse = warehouse;
    this.getData();
    console.log('this.selectedWarehouse',this.selectedWarehouse);
  }

  clearSelected() {
    this.selectedWarehouse = null;
  }

  deleteWarehouse(warehouse) {
    this.dialogsManager.openInfoMessageDialog("Вы уверены что хотите удалить склад?", true).afterClosed().pipe(take(1)).subscribe((res) => {
      if(res) {
        this.warehousesService.delete(warehouse.id).subscribe((res) => {
          this.filterUpdated();
        });
      }
    });
  }
  editWarehouse(warehouse) {
    this.dialogsManager.openWarehouseDialog(warehouse);
  }

  getPostExecutingStatus(status) {
    return this.stateService.getPostExecutingStatus(status);
  }

  getCargoStatus(cargoStatus: CargoStatusesEnum): string {
    return this.stateService.getCargoStatus(cargoStatus);
  }

  openPostDialog(post) {
    this.dialogsManager.openPostDialog(post);
  }

  confirmCargoInPost(post) {
    const message = `Вы подтверждаете, что Заказ №${post.id} доставлен на Склад?`;
    this.dialogsManager.openInfoMessageDialog(message, true).afterClosed().subscribe((confirmed: boolean) => {
      if(confirmed) {
        this.ngxService.startLoader(this.loaderId);
        const data = {
          id: post.id,
          cargoStatus: CargoStatusesEnum.WaitInWarehouse
        };
        this.postService.updatePost(data).subscribe((post) => {
          this.getData();
        });
      }
    });
  }

  confirmOrderIssue(post) {
    const message = `Вы подтверждаете, что Заказ №${post.id} Выдан Заказчику?`;
    this.dialogsManager.openInfoMessageDialog(message, true).afterClosed().subscribe((confirmed: boolean) => {
      if(confirmed) {
        this.ngxService.startLoader(this.loaderId);
        const data = {
          id: post.id,
          cargoStatus: CargoStatusesEnum.Issued
        };
        this.postService.updatePost(data).subscribe((post) => {
          this.getData();
        });
      }
    });
  }

  getData() {
    this.ngxService.startLoader(this.loaderId);
    let arrivedAtWarehouseRange = null;
    const values = this.filterForm.value;
    if(values?.range?.fromTime && values?.range?.toTime) {
      arrivedAtWarehouseRange = {
        fromTime: moment(values?.range?.fromTime).unix(),
        toTime: moment(values?.range?.toTime).endOf('day').unix(),
      };
    };
    const data: PostFilter = {
      warehouseId: this.selectedWarehouse.id,
      onlyForWarehouse: false,
      status: values.status,
      cargoStatus: values.cargoStatus,
      arrivedAtWarehouseRange
    };
    this.postService.getFilteredPosts(data).subscribe((posts) => {
      this.warehousePosts = posts;
      this.ngxService.stopLoader(this.loaderId);
    });
  }

  get range(): FormGroup {
    return (this.filterForm.get('range') as FormGroup);
  }

  clearFilter() {
    this.filterForm.reset();
  }
}
