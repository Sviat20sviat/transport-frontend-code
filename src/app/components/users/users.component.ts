import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/api/user.service';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoMessageComponent } from '../shared/info-message/info-message.component';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { StateService } from '../../services/state.service';
import { UserRolesEnum } from '../../services/api/roles.service';

@Component({
    selector: 'users',
    imports: [
        CommonModule,
        NgxUiLoaderModule,
        InputFieldComponent,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
    ],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy {
  users = [];
  unsubscribeAll$: Subject<any> = new Subject();
  loaderId: string = 'user-component';
  selectedUseTypeTabIndex = 1;
  searchControl: FormControl;
  constructor(
    private userService: UserService,
    private dialogsManager: DialogsManagerService,
    private ngxService: NgxUiLoaderService,
    private fb: FormBuilder,
    private stateService: StateService
  ) {
    this.searchControl = fb.control('');
  }

  ngOnInit(): void {
    this.getFilteredUsers(this.selectedUseTypeTabIndex);

    // this.searchControl.valueChanges
    //   .pipe(debounceTime(800), takeUntil(this.unsubscribeAll$))
    //   .subscribe((value: string) => {
    //     console.log('valueChanges', value);
    //   });
    this.stateService.roles$.subscribe((roles) => {
      console.log('roles', roles);
    });
    this.stateService.usersUpdatesSignal.pipe(takeUntil(this.unsubscribeAll$)).subscribe(() => {
      this.getFilteredUsers();
    });
  }

  ngOnDestroy(): void {}

  getAllUsers() {
    this.ngxService.startLoader(this.loaderId);
    this.userService
      .getUsers()
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((users) => {
        this.users = users;
      });
  }

  getFilteredUsers(roleId?: UserRolesEnum, status?) {
    if (!roleId) {
      this.getAllUsers();
      return;
    }
    this.ngxService.startLoader(this.loaderId);
    this.userService
      .getFilteredUsers(roleId)
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((res: any[]) => {
        if (!(res as any)?.length) {
          this.users = [];
          return;
        }
        this.users = res;
      });
  }

  openConfirmDialog(message): MatDialogRef<InfoMessageComponent> {
    return this.dialogsManager.openInfoMessageDialog(message, true);
  }

  deleteUser(user) {
    const dialog = this.openConfirmDialog(
      'Вы действительно хотите удалить пользователя?'
    );

    dialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((confirmed: boolean) => {
        if (confirmed && user?.id) {
          this.ngxService.startLoader(this.loaderId);
          this.userService.deleteUser(user).subscribe((res) => {
            this.getAllUsers();
          });
          return;
        };
      });
  }

  editUser(user) {
    const dialog = this.dialogsManager.openUserDialog(user);
    dialog.afterClosed().subscribe((res) => {
      if(res) {
        this.getUsersByType();
      }
    });
  }

  addUser() {
    const dialog = this.dialogsManager.openUserDialog();
    dialog.afterClosed().subscribe((res) => {
      if(res) {
        this.getUsersByType();
      };
    });
  }

  selectUserTypeTab(index: number) {
    this.selectedUseTypeTabIndex = index;
    this.getUsersByType();
  }

  searchUsers() {
    const value = this.searchControl.value;
    this.ngxService.startLoader(this.loaderId);
    this.selectedUseTypeTabIndex = 4;
    this.userService
      .getUsersBySearch(value)
      .pipe(
        takeUntil(this.unsubscribeAll$),
        finalize(() => this.ngxService.stopLoader(this.loaderId))
      )
      .subscribe((res: any[] | null) => {
        if (!(res as any)?.length) {
          this.users = [];
          return;
        }
        this.users = res;
      });
  }

  getUsersByType() {
    switch (this.selectedUseTypeTabIndex) {
      case 1:
        this.getFilteredUsers(UserRolesEnum.Admin);
        break;
      case 0:
        this.getFilteredUsers(UserRolesEnum.User);
        break;
      case 2:
        this.getFilteredUsers(UserRolesEnum.Driver);
        break;
      case 3:
        this.getFilteredUsers(UserRolesEnum.Operator);
        break;
      case 4:
        this.getFilteredUsers();
        break;
      default:
        this.getFilteredUsers();
        break;
    }
  }
}
