import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersComponent } from '../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { StateService } from '../../services/state.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import { PostsService } from '../../services/api/posts.service';
import { PostStatusesEnum } from '../dialogs/post-dialog/post-dialog.component';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService, updateUserDto } from '../../services/api/user.service';
import { DialogsManagerService } from '../../services/dialogs-manager.service';

@Component({
    selector: 'profile-details',
    imports: [
        CommonModule,
        // UsersComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        NgxUiLoaderModule,
        MatTabsModule,
        PostsTableComponent,
        InputFieldComponent,
        FormsModule,
        ReactiveFormsModule,
        MatTooltipModule
    ],
    templateUrl: './profile-details.component.html',
    styleUrl: './profile-details.component.scss'
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  unsubscribeAll$: Subject<any> = new Subject();
  currentUser;
  selectedMainTabIndex = 1;
  selectedTabIndex = 1;
  posts;
  loaderId = 'user-details';
  form: FormGroup;
  addressControl: FormControl;
  constructor(
    private stateService: StateService,
    private postService: PostsService,
    private ngxService: NgxUiLoaderService,
    private fb: FormBuilder,
    private userService: UserService,
    private dialogsManager: DialogsManagerService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
      lastName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
      email: ['', [Validators.required, Validators.email]],
      id: [''],
      phoneNumber: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
      phoneNumberSecond: [''],
      balance: [0],
      nickname: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
    });
    this.addressControl = this.fb.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(46)]);
  }

  ngOnInit(): void {
    this.stateService.currentUser$
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((user) => {
        this.currentUser = user;
        console.log('this.currentUser', this.currentUser);
        this.form.patchValue(this.currentUser);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
    switch (index) {
      case 0:
        this.getPosts(PostStatusesEnum.InProgress);
        break;
      case 1:
        this.getPosts(PostStatusesEnum.Allowed);
        break;
      case 2:
        this.getPosts(PostStatusesEnum.NotAllowed);
        break;
      case 3:
        this.getPosts(PostStatusesEnum.Done);
        break;
      case 4:
        this.getPosts(PostStatusesEnum.Rejected);
        break;
      case 5:
        this.getPosts(PostStatusesEnum.SOS);
        break;

      default:
        this.getPosts(PostStatusesEnum.Allowed);
        break;
    }
  }

  getPosts(status: number) {
    this.ngxService.startLoader(this.loaderId);
    this.postService
      .getFilteredPosts({ customerId: this.currentUser?.id, status: status })
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((res) => {
        this.posts = res;
      });
  }

  selectMainTab(index) {
    this.selectedMainTabIndex = index;
  }

  deleteAddress(i: number) {

    this.dialogsManager.openInfoMessageDialog('Вы действительно хотите удалить адрес из избранного?', true).afterClosed().subscribe((confirmed: boolean) => {
      if(!confirmed) {
        return;
      };
      this.ngxService.startLoader(this.loaderId);

      this.currentUser.favoriteAddresses.splice(i, 1);
      console.log('this.currentUser.favoriteAddresses',this.currentUser.favoriteAddresses);
      this.userService.setUserFavoriteAddress(this.currentUser?.id, this.currentUser.favoriteAddresses).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
        if(!res) {
          return;
        };
        this.currentUser = res;
        this.dialogsManager.openInfoMessageDialog("Успешно!");
      });
    });


  }

  addAddress() {
    const address = this.addressControl.value;
    if(!address) {
      return;
    };
    if(this.currentUser.favoriteAddresses?.some(i => i.toLowerCase() == address.toLowerCase())) {
      this.dialogsManager.openInfoMessageDialog("Адрес уже существует!");
      return;
    };
    this.ngxService.startLoader(this.loaderId);

    if(!this.currentUser.favoriteAddresses?.length) {
      this.currentUser.favoriteAddresses = [];
    };

    this.currentUser.favoriteAddresses.push(address);

    this.userService.setUserFavoriteAddress(this.currentUser?.id, this.currentUser.favoriteAddresses).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      if(!res) {
        return;
      };
      this.currentUser = res;
      this.dialogsManager.openInfoMessageDialog("Успешно!");
      this.addressControl.reset();
    });
  }

  saveUserData() {
    console.log('saveUserData',);
    const value = this.form.value;
    const data: updateUserDto = {
      id: this.currentUser.id,
      nickname: value.nickname,
      phoneNumber: value.phoneNumber,
      email: value.email
    };
    if(value?.phoneNumberSecond) {
      data.phoneNumberSecond = value?.phoneNumberSecond;
    };
    if(value?.firstName) {
      data.firstName = value?.firstName;
    };
    if(value?.lastName) {
      data.lastName = value?.lastName;
    };
    this.ngxService.startLoader(this.loaderId);
    this.userService.updateUser(data).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      if(!res) {
        return;
      };

      this.dialogsManager.openInfoMessageDialog("Ваш профиль успешно обновлен!");
    });
  }
  isDriver() {
    return this.currentUser?.roles?.some((role) => role.value == 'Driver');
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
  openPostDialog(post: any) {
    this.dialogsManager.openPostDialog(post);
  }
}
