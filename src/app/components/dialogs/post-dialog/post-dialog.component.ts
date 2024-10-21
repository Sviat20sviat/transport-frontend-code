import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { StateService } from '../../../services/state.service';
import { PostsService } from '../../../services/api/posts.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'post-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule
  ],
  templateUrl: './post-dialog.component.html',
  styleUrl: './post-dialog.component.scss'
})
export class PostDialogComponent {
  currentUser;
  form: FormGroup;
  post;
  driver;
  isEdit: boolean = false;
  statuses = [
    {
      id: 0,
      value:"Не одобрено"
    },
    {
      id: 1,
      value:"Одобрено"
    },
    {
      id: 2,
      value:"В pаботе"
    },
    {
      id: 3,
      value:"Выполнено"
    },
    {
      id: 4,
      value:"Отменено"
    },
  ];
  loaderId: string = 'post-dialog';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {post},
    public dialogRef: MatDialogRef<PostDialogComponent>,
    private dialogsManager: DialogsManagerService,
    private stateService: StateService,
    private postsService: PostsService,
    private ngxService: NgxUiLoaderService,
    private fb: FormBuilder,
    public userService: UserService
  ) {
    this.post = data?.post;
    console.log('this.post',this.post);
    this.currentUser = this.stateService.currentUser$.value;
    console.log('this.currentUser!', this.currentUser);
    this.form = fb.group({
      id: fb.control(''),   
      status: fb.control(''),   
      title: fb.control(''),
      content: fb.control(''),
      addressFrom: fb.control(''),
      addressTo: fb.control(''),
      warehouse: fb.control(''),
      price: fb.control(''),
      commission: fb.control(''),
      summ: fb.control(''),
      paid: fb.control(''),
      driverId: fb.control(''),
    });
    this.form.patchValue(this.post);
    this.form.get('status').setValue(this.statuses.find(status => status.id == this.post.status).value);
    if(!this.userService.isUserAdmin(this.currentUser)) {
      console.log('this.userService.isUserAdmin(this.currentUser)!',this.userService.isUserAdmin(this.currentUser));
      this.form.get('status').disable();
    }
    this.form.get('status').valueChanges.subscribe((value) => {
      console.log('value!',value);
    })
  }

  getPostExecutingStatus(status: string): number {
    switch (status) {
      case 'Не одобрено':
        return 0;
      case 'Одобрено':
        return 1;
      case 'В pаботе':
        return 2;
      case 'Выполнено':
        return 3;
      case 'Отменено':
        return 4;
      default:
        return 0;
    }
  }

  save() {
    this.ngxService.startLoader(this.loaderId);
    const value = this.form.value;
    // const request = {
    //   id: this.post.id,
    //   status: this.getPostExecutingStatus(value.status)
    // };
    const request = value;
    request.status = this.getPostExecutingStatus(value.status);
    this.postsService.updatePost(request).subscribe((res) => {
      this.ngxService.stopLoader(this.loaderId);
      console.log('setStatus!',res);
      if(res) {
        this.dialogsManager.openInfoMessageDialog("Успешно!")
      }
    });
    this.isEdit = false;
  }

  edit() {
    this.isEdit = true;
  }

  isAdmin(): boolean {
    return this.currentUser?.roles?.some(role => role.value == "Admin");
  }
}
