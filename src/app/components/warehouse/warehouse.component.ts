import { Component, Input, OnDestroy, OnInit, input } from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { StateService } from '../../services/state.service';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { WarehousesService } from '../../services/api/warehouses.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PostsService } from '../../services/api/posts.service';
import { CargoStatusesEnum } from '../dialogs/post-dialog/post-dialog.component';

@Component({
  selector: 'warehouse',
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
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss'
})
export class WarehouseComponent implements OnInit, OnDestroy {
  
  warehouse;
  loaderId = 'warehouse';
  unsubscribeAll$: Subject<any> = new Subject();
  warehousePosts = [];
  constructor(
    private stateService: StateService,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService,
    private warehousesService: WarehousesService,
    private postService: PostsService,
  ) { }

  ngOnInit(): void {
    // this.filterUpdated();
    this.ngxService.startLoader(this.loaderId);
    combineLatest({currentUser: this.stateService.currentUser$, warehouses: this.stateService.warehouses$}).pipe(takeUntil(this.unsubscribeAll$)).subscribe(({currentUser, warehouses}) => {
      this.ngxService.stopLoader(this.loaderId);
      console.log('currentUser',currentUser);
      console.log('warehouses',warehouses);
      this.warehouse = this.getYourWarehouse(warehouses, currentUser);
      if(this.warehouse?.id) {
        this.getData();
      }
      console.log('this.warehouse',this.warehouse);
    });
    this.stateService.currentUser$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((user) => {
      console.log('currentUser',user);

    });
    this.stateService.warehouses$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((warehouses) => {
      console.log('warehouses',warehouses);
    });

    this.stateService.postsUpdatesSignal.pipe(takeUntil(this.unsubscribeAll$)).subscribe((signal) => {
      console.log('signal',signal);
      if(signal) {
        this.getData();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  getData() {
    this.ngxService.startLoader(this.loaderId);
    const data = {
      warehouseId: this.warehouse.id,
      onlyForWarehouse: true
    };
    this.postService.getFilteredPosts(data).subscribe((posts) => {
      this.warehousePosts = posts;
      this.ngxService.stopLoader(this.loaderId);
    });
  }

  getYourWarehouse(warehouses: any[], currentUser): any {
    let warehouse = warehouses?.find(warehouse => warehouse?.supervisorId === currentUser?.id);
    if(!warehouse) {
      warehouse = warehouses?.find(warehouse => warehouse?.workerIds.some(workerId => workerId === currentUser?.id));
    };
    return warehouse;
  }

  getPostExecutingStatus(status) {
    return this.stateService.getPostExecutingStatus(status);
  }

  getCargoStatus(cargoStatus: CargoStatusesEnum): string {
    return this.stateService.getCargoStatus(cargoStatus);
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

  openPostDialog(post) {
    this.dialogsManager.openPostDialog(post);
  }
}
