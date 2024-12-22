import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DatepickerFieldComponent } from '../../shared/datepicker-field/datepicker-field.component';
import { SelectFieldComponent } from '../../shared/select-field/select-field.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DocumentsService } from '../../../services/api/documents.service';
import { StateService } from '../../../services/state.service';
import { Subject, takeUntil } from 'rxjs';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
@Component({
  selector: 'document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    InputFieldComponent,
    MatInputModule, MatIconModule,
    DatepickerFieldComponent,
    SelectFieldComponent,
    MatCheckboxModule
  ],
  templateUrl: './document-dialog.component.html',
  styleUrl: './document-dialog.component.scss'
})
export class DocumentDialogComponent implements OnDestroy {

  document;
  loaderId = 'document-dialog';
  form: FormGroup;
  doctypes = [
    {
      id: 1,
      name: "Списание со счета Пользователя"
    },
    {
      id: 2,
      name: "Пополнение счета Пользователя"
    }
  ];
  unsubscribeAll$: Subject<any> = new Subject();
  clients = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {document},
    public dialogRef: MatDialogRef<DocumentDialogComponent>,
    private fb: FormBuilder,
    private documentsService: DocumentsService,
    private stateService: StateService,
    private dialogsManager: DialogsManagerService
  ) {
    console.log('console',data);
    this.form = fb.group({
      docType: [null, Validators.required],
      sum: [0, [Validators.required, Validators.pattern('[0-9]*')]],
      addresFrom: [null, Validators.required],
      addresTo: [null, Validators.required],
      clientId: [null, Validators.required],
      // recipient: [null, Validators.required],
      // stutus: [null, Validators.required],
      comment: ['', ],
      
    });
    this.stateService.clients$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((value) => {
      this.clients = value;
    });
    this.form.patchValue(data?.document);
    this.document = data.document;
  }
  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  createDocument() {
    const values = this.form.value;
    // const req = {
    //   "addressFrom": "-",
    //   "addressTo": "-",
    //   "comment": "Комментарий",
    //   "docType": 1,
    //   "sum": 2200,
    //   "isSystem": false,
    //   "clientId": 1,
    //   "recipientId": 2,
    //   "postBasisId": 1,
    //   "documentBasisId": null
    // }

    const req = {
      "addressFrom": values?.addressFrom,
      "addressTo": values?.addressTo,
      "comment": values?.comment,
      "docType": values?.docType,
      "sum": values?.sum,
      "isSystem": false,
      "clientId": values?.clientId,
      "recipientId": values?.clientId,
      "postBasisId": values?.postBasisId,
      "documentBasisId": values?.documentBasisId
    }

    this.documentsService.createDocument(req).subscribe(res => {
      console.log('console',res);
      if(!res) {
        this.dialogsManager.openInfoMessageDialog("Ошибка при содании документа!");
        return;
      };
      this.dialogsManager.openInfoMessageDialog("Документ создан успешно!").afterClosed().subscribe(() => {
        this.dialogRef.close(res);
      })
    });
  }
}
