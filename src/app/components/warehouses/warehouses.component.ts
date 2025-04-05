import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { StateService } from '../../services/state.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { WarehousesService } from '../../services/api/warehouses.service';
import { Subject, finalize, take, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule
  ],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.scss'
})
export class WarehousesComponent implements OnInit, OnDestroy {
  warehouses = [];
  loaderId = 'warehouses';
  unsubscribeAll$: Subject<any> = new Subject();
  constructor(
    private stateService: StateService,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService,
    private warehousesService: WarehousesService,
  ) { }

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

}
