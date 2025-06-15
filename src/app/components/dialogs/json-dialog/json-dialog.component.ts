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
    @Inject(MAT_DIALOG_DATA) public data: {data: any, json: any, prewJson?: any},
    public dialogRef: MatDialogRef<JsonDialogComponent>,
  ) {

  }

  ngOnInit(): void {
    
    
  }

  getTableName(name: string): string {
    switch (name) {
      case 'Document':
        return 'Докумет';
      case 'image':
        return 'Изображение';
      case 'Post':
        return 'Заказ Пользователя';
      case 'PriceCategory':
        return 'Категория Прайс Листа';
      case 'PriceListItem':
        return 'Элемент Прайс Листа';
      case 'User':
        return 'Пользователь';
      default:
        return 'Логин';
    } 
  }
  
  getAuditAction(action): string {
    switch (action) {
      case 'create':
        return 'Создание';
      case 'update':
        return 'Изменение';
      case 'delete':
        return 'Удаление';
      case 'login':
        return 'Логин Пользователя';
      default:
        return 'Создание';
    }
  }
}
