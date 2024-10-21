import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostsService } from '../../../services/api/posts.service';
import { StateService } from '../../../services/state.service';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'create-post-dialog',
  standalone: true,
  imports: [
    CommonModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  templateUrl: './create-post-dialog.component.html',
  styleUrl: './create-post-dialog.component.scss'
})
export class CreatePostDialogComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private postsService: PostsService,
    private stateService: StateService,
    private dialogsManager: DialogsManagerService,
    public dialogRef: MatDialogRef<CreatePostDialogComponent>,
    private ngxService: NgxUiLoaderService,
  ) {
    this.form = fb.group({
      title: this.fb.control('', [Validators.required, Validators.maxLength(254)]),
      content: this.fb.control('', [Validators.required, Validators.maxLength(800)]),
      addressFrom: this.fb.control('', [Validators.required, Validators.maxLength(500)]),
      addressTo: this.fb.control('', [Validators.required, Validators.maxLength(500)]),
      postNaming: this.fb.control('', [Validators.required, Validators.maxLength(254)]),
      warehouse: this.fb.control('', [Validators.maxLength(254)]),
    })
  }

  createPost() {
    const values = this.form.value;
    console.log('CONSOLE!',values);
    const user = this.stateService.currentUser$.value;
    console.log('values!',values);
    this.postsService.createPost(values,user).subscribe((res) => {
      console.log('res!',res);
      if((res as any)?.id) {
        this.dialogsManager.openInfoMessageDialog('Успешно создано!').afterClosed().subscribe(() => {
          console.log('afterClosed!',);
          this.dialogRef.close(res);
        })
      }
    })
  }
}
