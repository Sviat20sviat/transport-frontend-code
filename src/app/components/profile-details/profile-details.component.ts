import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersComponent } from '../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { StateService } from '../../services/state.service';
import { Subject, takeUntil } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import { PostsService } from '../../services/api/posts.service';
import { PostStatusesEnum } from '../dialogs/post-dialog/post-dialog.component';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InputFieldComponent } from '../shared/input-field/input-field.component';

@Component({
  selector: 'profile-details',
  standalone: true,
  imports: [
    CommonModule,
    // UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    MatTabsModule,
    PostsTableComponent,
    InputFieldComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  unsubscribeAll$: Subject<any> = new Subject();
  currentUser;
  selectedMainTabIndex = 1;
  selectedTabIndex = 1;
  posts;
  postTableLoaderId = 'post-table';
  form: FormGroup;
  constructor(
    private stateService: StateService,
    private postService: PostsService,
    private ngxService: NgxUiLoaderService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
      lastName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
      email: ['', [Validators.required, Validators.email]],
      id: [''],
      phoneNumber: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
      phoneNumberSec: [''],
      balance: [0],
      nickname: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
    });
  }

  ngOnInit(): void {
    this.stateService.currentUser$
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((user) => {
        this.currentUser = user;
        console.log('this.currentUser', this.currentUser);
        this.form.patchValue(this.currentUser);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
    switch (index) {
      case 0:
        this.getPosts(PostStatusesEnum.InProgress);
        break;
      case 1:
        this.getPosts(PostStatusesEnum.Allowed);
        break;
      case 2:
        this.getPosts(PostStatusesEnum.NotAllowed);
        break;
      case 3:
        this.getPosts(PostStatusesEnum.Done);
        break;
      case 4:
        this.getPosts(PostStatusesEnum.Rejected);
        break;
      case 5:
        this.getPosts(PostStatusesEnum.SOS);
        break;

      default:
        this.getPosts(PostStatusesEnum.Allowed);
        break;
    }
  }

  getPosts(status: number) {
    this.ngxService.startLoader(this.postTableLoaderId);
    this.postService
      .getFilteredPosts({ userId: this.currentUser?.id, status: status })
      .subscribe((res) => {
        this.posts = res;
        this.ngxService.stopLoader(this.postTableLoaderId);
      });
  }

  selectMainTab(index) {
    this.selectedMainTabIndex = index;
  }
}
