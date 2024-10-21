import { Injectable } from '@angular/core';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { InfoMessageComponent } from '../components/shared/info-message/info-message.component';
import { CreatePostDialogComponent } from '../components/dialogs/create-post-dialog/create-post-dialog.component';
import { EditUserDialogComponent } from '../components/dialogs/edit-user-dialog/edit-user-dialog.component';
import { PostDialogComponent } from '../components/dialogs/post-dialog/post-dialog.component';
import { SetUserInTelegramComponent } from '../components/login/set-user-in-telegram/set-user-in-telegram.component';

@Injectable({
  providedIn: 'root'
})
export class DialogsManagerService {

  constructor(
    private dialogRef: MatDialog
  ) { }

  openInfoMessageDialog(message: string, isConfirm?: boolean): MatDialogRef<InfoMessageComponent> {
    return this.dialogRef.open(InfoMessageComponent, {
      data: {
        message,
        isConfirm
      }
    })
  }

  openCreatePostDialog(): MatDialogRef<CreatePostDialogComponent> {
    return this.dialogRef.open(CreatePostDialogComponent, {
      data: {},
      maxHeight: "90vh"
    });
  }

  openEditUserDialog(user): MatDialogRef<EditUserDialogComponent> {
    return this.dialogRef.open(EditUserDialogComponent, {
      data: {user}
    });
  }

  openPostDialog(post): MatDialogRef<PostDialogComponent> {
    return this.dialogRef.open(PostDialogComponent, {
      data: {post},
      maxHeight: "90vh" 
    });
  }

  openSetUserToTelegramDialog(user): MatDialogRef<SetUserInTelegramComponent> {
    return this.dialogRef.open(SetUserInTelegramComponent, {
      data: {user}
    });
  }
}
