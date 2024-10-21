import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersComponent } from '../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { StateService } from '../../services/state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'profile-details',
  standalone: true,
  imports: [
    CommonModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule
  ],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss'
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  unsubscribeAll$: Subject<any> = new Subject();
  currentUser;
  constructor(
    private stateService: StateService
  ){

  }


  ngOnInit(): void {
    this.stateService.currentUser$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((user) => {
      this.currentUser = user;
    });  
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

}
