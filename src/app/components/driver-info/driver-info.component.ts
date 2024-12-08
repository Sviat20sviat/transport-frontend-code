import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import { PostsService } from '../../services/api/posts.service';
import { StateService } from '../../services/state.service';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
  selector: 'driver-info',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    PostsTableComponent
  ],
  templateUrl: './driver-info.component.html',
  styleUrl: './driver-info.component.scss'
})
export class DriverInfoComponent implements OnInit, OnDestroy {

  posts = [];
  loaderId = 'driver-info';
  currentUser;
  unsubscribeAll$: Subject<any> = new Subject();

  constructor(
    private postService: PostsService,
    private stateService: StateService,
    private ngxService: NgxUiLoaderService
  ) {

  }


  ngOnInit(): void {
    this.stateService.currentUser$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((user) => {
      this.currentUser = user;
      if(this.currentUser) {
        this.getDriverPosts();
      }

    })

    
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  getDriverPosts() {
    this.ngxService.startLoader(this.loaderId);
    this.postService.getFilteredPosts({driverId: this.currentUser.id}).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      if(res) {
        this.posts = (res as any);
      };
    });
  };

}
