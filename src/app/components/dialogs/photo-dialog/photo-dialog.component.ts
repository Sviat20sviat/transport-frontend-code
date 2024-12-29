import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-photo-dialog',
  imports: [
    CommonModule
  ],
  templateUrl: './photo-dialog.component.html',
  styleUrl: './photo-dialog.component.scss'
})
export class PhotoDialogComponent {
  @Input() imageUrl: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl },
    public dialogRef: MatDialogRef<PhotoDialogComponent>,
  ) { 

  }
}
