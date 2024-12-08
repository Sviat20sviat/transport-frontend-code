import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { DocumentsService } from '../../services/api/documents.service';

@Component({
  selector: 'documents',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent {
  documents = [
    {
      id: 3743,
      createdAt: 1731261051000,
      addressFrom: 'Болгария',
      addressTo: 'Сухум',
      clientId: 31233,
      recipientId: 4322,
      postBasisId: 1,
      documentBasisId: 1,
      comment: 'Комментарий',
      docType: 1,
      sum: 2200,
      updatedAt: 1731261062000,
      isSystem: false,
    },
  ];
  loaderId = 'document-component';
  constructor(
    private dialogsManager: DialogsManagerService,
    private documentsService: DocumentsService
  ) {
    this.getAllDocuments();
  }

  openDocumentDilaog(doc?) {
    console.log('openDocumentDilaog');
    this.dialogsManager.openDocumentDialog(doc);
  }

  getAllDocuments() {
    this.documentsService.getAllDocuments().subscribe((res) => {
      console.log('console', res);
      if (res) {
        this.documents = res;
      }
    });
  }

  getDocType(index: documentType): string {
    switch (index) {
      case documentType.UserPayment:
        return 'Спасание со счета Пользователя';

      case documentType.UserWriteOff:
        return 'Пополнение счета Пользователя';
      default:
        return '---';
    }
  }
}

export enum documentType {
  UserPayment = 1,
  UserWriteOff = 2,
}
