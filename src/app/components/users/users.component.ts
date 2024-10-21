import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/api/user.service';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoMessageComponent } from '../shared/info-message/info-message.component';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'users',
  standalone: true,
  imports: [
    CommonModule,
    NgxUiLoaderModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy {
  users;
  unsubscribeAll$: Subject<any> = new Subject();
  loaderId: string = 'user-component';
  constructor(
    private userService: UserService,
    private dialogsManager: DialogsManagerService,
    private ngxService: NgxUiLoaderService,
  ) {

  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngOnDestroy(): void {
  }

  getAllUsers() {
    this.ngxService.startLoader(this.loaderId);
    this.userService.getUsers().pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((users) => {
      console.log('users!',users);
      this.users = users;
    });
  }

  openConfirmDialog(message): MatDialogRef<InfoMessageComponent> {
    return this.dialogsManager.openInfoMessageDialog(message, true);
  }

  deleteUser(user) {

    console.log('deleteUser!',user);
    const dialog = this.openConfirmDialog("Вы действительно хотите удалить пользователя?");

    dialog.afterClosed().pipe(takeUntil(this.unsubscribeAll$)).subscribe((confirmed: boolean) => {
      if (confirmed && user?.id) {
        this.ngxService.startLoader(this.loaderId);
        console.log('confirmed!',);
        this.userService.deleteUser(user).subscribe((res) => {
          console.log('CONSOLE!',res);
          this.getAllUsers();
        })
        return;
      }
      console.log('not Cconfirmed',);
    })
  }

  editUser(user) {
    console.log('editUser!',user);
    const dialog = this.dialogsManager.openEditUserDialog(user);
    dialog.afterClosed().subscribe((res) => {
      
    })
  }
}
