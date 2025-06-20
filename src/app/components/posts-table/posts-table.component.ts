import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PostsService } from '../../services/api/posts.service';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoMessageComponent } from '../shared/info-message/info-message.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { MatInputModule } from '@angular/material/input';
import { Form, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StateService } from '../../services/state.service';
import { CargoStatusesEnum } from '../dialogs/post-dialog/post-dialog.component';

@Component({
    selector: 'posts-table',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        InputFieldComponent,
        MatTooltipModule
    ],
    templateUrl: './posts-table.component.html',
    styleUrl: './posts-table.component.scss'
})
export class PostsTableComponent implements OnInit, OnDestroy {
  @Input() posts: Array<any>;
  @Input() currentUser;
  @Input() isShowTitle: boolean = true;
  @Input() title: string = 'Заказы пользователей';
  @Input() isDashboard: boolean = false;
  @Output() postsUpdated$ = new EventEmitter<any>();
  unsubscribeAll$: Subject<any> = new Subject();
  loaderId = 'post-table';
  searchControl: FormControl;
  users = [];
  deliveryTypes = [];
  addressesTo = [];
  addressesFrom = [];

  constructor(
    private dialogsManager: DialogsManagerService,
    private postsService: PostsService,
    private fb: FormBuilder,
    private stateService: StateService
  ) {
    this.searchControl = this.fb.control('');
    this.stateService.users$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((users) => {
      this.users = users;
    });
    this.deliveryTypes = this.stateService.deliveryTypes;
  }


  ngOnInit(): void {
    this.stateService.addresesIn$.subscribe((addresses) => {
      this.addressesTo = addresses;
    });
    this.stateService.addressesOut$.subscribe((addresses) => {
      this.addressesFrom = addresses;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete()
  }

  createPost() {
    console.log('createPost!',);
    const dialog = this.dialogsManager.openPostDialog();
    dialog.afterClosed().subscribe((res) => {
      console.log('console',res);
    })
  }

  openPostDialog(post) {
    console.log('CONSOLE!', post);
    const dialog = this.dialogsManager.openPostDialog(post);
    dialog.afterClosed().subscribe((res) => {
      if(res) {
        this.postsUpdated$.next(res);
      }
    })
  }


  getPostExecutingStatus(status: number): string {
    return this.stateService.getPostExecutingStatus(status);
  }

  deletePost(post: any) {
    const dialog = this.openConfirmDialog("Вы действительно хотите удалить Заказ?");
    console.log('post!', post);
    dialog.afterClosed().pipe(takeUntil(this.unsubscribeAll$)).subscribe((confirmed: boolean) => {
      if (confirmed && post?.id) {
        console.log('confirmed!',);
        this.postsService.deletePost(post.id).subscribe((res) => {
          console.log('CONSOLE!', res);
          if (res?.deleted) {
            const index = this.posts.findIndex(p => p.id === post.id);
            this.posts.splice(index, 1);
          }
        });
        return;
      }
      console.log('not Cconfirmed',);
    })
  }

  openConfirmDialog(message): MatDialogRef<InfoMessageComponent> {
    return this.dialogsManager.openInfoMessageDialog(message, true);
  }

  searchPosts() {
    // this.ngxSe
  }

  openUserDialog(user) {
    console.log('openUserDialog!', user);
    if(!user?.id) {
      return;
    };
    let showedUser = this.users.find(u => u.id === user.id);
    if(showedUser) {
      const dialog = this.dialogsManager.openUserDialog(showedUser);
      dialog.afterClosed().subscribe((res) => {
        console.log('afterClosed!', res);
      });
    };

  }

  getCargoStatus(cargoStatus: CargoStatusesEnum): string {
    return this.stateService.getCargoStatus(cargoStatus);
  }

  getDeliveryType(id: number) {
    return this.deliveryTypes.find(dt => dt.id === id)?.name;
  }

  getAddressTo(id): string {
    const address = this.addressesTo.find(a => a.id === id);
    if(address) {
      return `${address?.name} ${address.address}`;
    };
    return '--';
  }

  getAddressFrom(id): string {
    const address = this.addressesFrom.find(a => a.id === id);
    if(address) {
      return `${address?.name} ${address.address}`;
    };
    return '--';
  }
}
