import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-json-dialog',
  imports: [
    NgxJsonViewerModule
  ],
  templateUrl: './json-dialog.component.html',
  styleUrl: './json-dialog.component.scss'
})
export class JsonDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {json: any},
    public dialogRef: MatDialogRef<JsonDialogComponent>,
  ) {

  }

  ngOnInit(): void {
    
    
  }

}
