import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { StateService } from '../../../services/state.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'set-user-in-telegram',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './set-user-in-telegram.component.html',
    styleUrl: './set-user-in-telegram.component.scss'
})
export class SetUserInTelegramComponent {
  currentUser;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {user},
    public dialogRef: MatDialogRef<SetUserInTelegramComponent>,
    private stateService: StateService
  ){
    console.log('MAT_DIALOG_DATA!',data);
    this.currentUser = data.user;
  }

  assignToTg() {
    window.open('https://t.me/transport_messages_bot', "_blank");
    this.dialogRef.close(true);
  }
}
