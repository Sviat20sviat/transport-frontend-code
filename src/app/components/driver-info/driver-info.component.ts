import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import { PostsService } from '../../services/api/posts.service';
import { StateService } from '../../services/state.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { CargoStatusesEnum, PostStatusesEnum } from '../dialogs/post-dialog/post-dialog.component';

@Component({
    selector: 'driver-info',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        PostsTableComponent,
    ],
    templateUrl: './driver-info.component.html',
    styleUrl: './driver-info.component.scss'
})
export class DriverInfoComponent implements OnInit, OnDestroy {
  posts = [];
  loaderId = 'driver-info';
  currentUser;
  unsubscribeAll$: Subject<any> = new Subject();
  selectedPostTypeTabIndex = 2;

  constructor(
    private postsService: PostsService,
    private stateService: StateService,
    private ngxService: NgxUiLoaderService,
    private dialogsManager: DialogsManagerService
  ) {}

  ngOnInit(): void {
    this.stateService.currentUser$
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((user) => {
        this.currentUser = user;
        if (this.currentUser) {
          this.getDriverPosts();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  getDriverPosts() {
    this.ngxService.startLoader(this.loaderId);
    this.postsService
      .getFilteredPosts({ driverId: this.currentUser.id, status: this.selectedPostTypeTabIndex })
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((res) => {
        if (res) {
          this.posts = res as any;
        }
      });
  }

  getPostExecutingStatus(status: number): string {
    switch (status) {
      case 0:
        return 'Не одобрено';
      case 1:
        return 'Одобрено';
      case 2:
        return 'В работе';
      case 3:
        return 'Выполено';
      case 4:
        return 'Отменено';
      case 5:
        return 'ЧП';
      default:
        return 'Не одобрено';
    }
  }

  setDoneByDriver(post) {
    this.dialogsManager
      .openInfoMessageDialog(
        'Вы действительно хотите завершить работу с объявлением? После нажатия ДА вы подтверждаете что доставили товар в место назначения.',
        true
      )
      .afterClosed()
      .subscribe((confirm) => {
        if (!confirm) {
          return;
        }
        this.ngxService.startLoader(this.loaderId);
        this.postsService
          .updatePost({
            driverId: this.currentUser.id,
            status: PostStatusesEnum.Done,
            id: post.id,
          })
          .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
          .subscribe((res) => {
            console.log('res', res);
            this.dialogsManager.openInfoMessageDialog(
              'Вы успешно Выполнили объявление объявление!'
            );
            this.getDriverPosts();
          });
      });
  }
  
  setCargoStatus(post) {
    this.dialogsManager
    .openInfoMessageDialog(
      'Вы действительно забрали товар?',
      true
    )
    .afterClosed()
    .subscribe((confirm) => {
      if (!confirm) {
        return;
      }
      this.ngxService.startLoader(this.loaderId);
      this.postsService
        .updatePost({
          driverId: this.currentUser.id,
          cargoStatus: CargoStatusesEnum.OnTheWayOnOurDelivery,
          id: post.id,
        })
        .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
        .subscribe((res) => {
          console.log('res', res);
          this.dialogsManager.openInfoMessageDialog(
            'Успешно!'
          );
          this.getDriverPosts();
        });
    });
  }

  setCancelByDriver(post) {
    this.dialogsManager
    .openInfoMessageDialog(
      'Вы действительно хотите завершить работу с объявлением? После нажатия ДА с Вы отменяете работу с объявлением.',
      true
    )
    .afterClosed()
    .subscribe((confirm) => {
      if (!confirm) {
        return;
      }
      this.ngxService.startLoader(this.loaderId);
      this.postsService
        .updatePost({
          driverId: this.currentUser.id,
          status: PostStatusesEnum.Rejected,
          id: post.id,
        })
        .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
        .subscribe((res) => {
          console.log('res', res);
          this.dialogsManager.openInfoMessageDialog(
            'Вы успешно отказались от объявления!'
          );
          this.getDriverPosts();
        });
    });
  }

  setSosDriver(post) {
    this.dialogsManager
    .openInfoMessageDialog(
      'Вы действительно хотите завершить работу с объявлением? После нажатия ДА с Вами свяжется оператор для уточнения деталей.',
      true
    )
    .afterClosed()
    .subscribe((confirm) => {
      if (!confirm) {
        return;
      }
      this.ngxService.startLoader(this.loaderId);
      this.postsService
        .updatePost({
          driverId: this.currentUser.id,
          status: PostStatusesEnum.SOS,
          id: post.id,
        })
        .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
        .subscribe((res) => {
          console.log('res', res);
          this.dialogsManager.openInfoMessageDialog(
            'Успешно заявлена помощь!'
          );
          this.getDriverPosts();
        });
    });


  }
  openPostDialog(post) {
    if (!post) {
      return;
    }
    this.dialogsManager.openPostDialog(post);
  }

  selectPostTypeTab(index: number) {
    this.selectedPostTypeTabIndex = index;
    this.getDriverPosts();
  }
}
