import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
@Component({
    selector: 'app-info-message',
    imports: [CommonModule, MatButtonModule],
    templateUrl: './info-message.component.html',
    styleUrl: './info-message.component.scss'
})
export class InfoMessageComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {message: string, isConfirm: boolean},
    public dialogRef: MatDialogRef<InfoMessageComponent>,
  ) {

  }

}
