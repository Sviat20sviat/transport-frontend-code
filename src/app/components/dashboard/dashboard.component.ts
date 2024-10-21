import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { StateService } from '../../services/state.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { UsersComponent } from '../users/users.component';
import { PostsService } from '../../services/api/posts.service';
import { ServerService } from '../../services/api/server.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { InfoMessageComponent } from '../shared/info-message/info-message.component';
import { Subject, finalize, forkJoin, takeUntil } from 'rxjs';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { EventNameEnum, WebSocketService } from '../../services/api/socket/web-socket.service';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    ProfileDetailsComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  leftOpened: boolean = false;
  selectedTab: string = TabsEnum.Dashboard;
  allPosts = [];
  checkedPosts = [];
  serverAddress: string;
  unsubscribeAll$: Subject<any> = new Subject();
  loaderId: string = 'dashboard';
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private dialogsManager: DialogsManagerService,
    private stateService: StateService,
    private router: Router,
    private postsService: PostsService,
    private _serverApi: ServerService,
    private ngxService: NgxUiLoaderService,
    private websocketService: WebSocketService
  ) {
    this.serverAddress = this._serverApi.serverAddress;

    console.log('this.currentUser!', this.currentUser);
    // this.stateService.currentUser$.subscribe(user => {
    //   this.currentUser = user;
    //   console.log('currentUser!',this.currentUser);
    // })


  }
  ngOnInit(): void {
    this.stateService.currentUser$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((user) => {
      this.currentUser = user;
      const localStorage = this.document.defaultView?.localStorage;
      let selectedTab = localStorage.getItem('selectedTab');
      if (selectedTab) {
        this.selectedTab = JSON.parse(selectedTab);
      };
  
      this.websocketService.on(EventNameEnum.OnPostCreate).subscribe((data) => {
        console.log('OnPostCreate!', data);
        this.getPost(data.id)
      })
      this.websocketService.on(EventNameEnum.OnPostUpdate).subscribe((data) => {
        console.log('OnPostUpdate!', data);
        if(!this.isAdmin()) {
          if(this.checkedPosts.some(p => p.id == data.id)) {
            this.getAll();
          } else {
            this.getPost(data.id)
          }
        } else {
          let existPostIndex = this.allPosts.findIndex(p => p.id == data.id);
          if(existPostIndex > -1) {
            this.allPosts[existPostIndex] = data;
          }
        }
      });
      this.getAll();
    });


  }
  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  // receiveSocketResponse() {
  //   this.websocketService.on();
  //  }

  isAdmin(): boolean {
    return this.currentUser?.roles?.some(role => role.value == "Admin");
  }

  isDriver(): boolean {
    return this.currentUser?.roles?.some(role => role.value == "Driver");
  }

  openInfo() {
    return this.dialogsManager.openInfoMessageDialog("Успешно открытие ДАШБОРДА!")
  }

  openConfirmDialog(message): MatDialogRef<InfoMessageComponent> {
    return this.dialogsManager.openInfoMessageDialog(message, true);
  }

  showUsers() {
    console.log('showUsers!',);
    this.selectedTab = TabsEnum.Users;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showDashboard() {
    console.log('showDashboard!',);
    this.selectedTab = TabsEnum.Dashboard;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showUserDashboard() {
    console.log('showUserDashboard!',);
    this.selectedTab = TabsEnum.UserDashboard;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  logout() {
    this.router.navigateByUrl('/login');
  }

  getAll() {
    this.ngxService.startLoader(this.loaderId);
    if (!this.isAdmin()) { 
      this.postsService.getAllCheckedPosts().subscribe((posts) => {
        console.log('CONSOLE!', posts);
        this.checkedPosts = posts;
        this.ngxService.stopLoader(this.loaderId);
      })
      return;
    }

    this.postsService.getPosts().subscribe((posts) => {
      console.log('CONSOLE!', posts);
      this.allPosts = posts;
      this.ngxService.stopLoader(this.loaderId);
    })
  }

  deletePost(post: any) {
    const dialog = this.openConfirmDialog("Вы действительно хотите удалить объявление?");
    console.log('post!', post);
    dialog.afterClosed().pipe(takeUntil(this.unsubscribeAll$)).subscribe((confirmed: boolean) => {
      if (confirmed && post?.id) {
        console.log('confirmed!',);
        this.postsService.deletePost(post.id).subscribe((res) => {
          console.log('CONSOLE!', res);
          if (res?.deleted) {
            const index = this.allPosts.findIndex(p => p.id === post.id);
            this.allPosts.splice(index, 1);
          }
        });
        return;
      }
      console.log('not Cconfirmed',);
    })
  }

  createPost() {
    console.log('createPost!',);
    const dialog = this.dialogsManager.openCreatePostDialog();
    dialog.afterClosed().subscribe((res) => {
      if (res?.id) {
        // this.getAll();
      };
    })
  }

  getPost(id) {
    this.ngxService.startLoader(this.loaderId);
    this.postsService.getPost(id).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe(post => {
      if (!this.isAdmin()) {
        if ((post as any).status !== 1) {
          return;
        }
        this.checkedPosts.push(post);
        return;
      }
      this.allPosts.push(post);

    })
  }

  getPostExecutingStatus(status: number): string {
    switch (status) {
      case 0:
        return 'Не одобрено';
      case 1:
        return 'Одобрено';
      case 2:
        return 'В работе';
      case 3:
        return 'Выполено';
      case 4:
        return 'Отменено';
      default:
        return 'Не одобрено';
    }
  }

  openPostDialog(post) {
    console.log('CONSOLE!', post);
    const dialog = this.dialogsManager.openPostDialog(post);
    dialog.afterClosed().subscribe(() => {
      console.log('afterClosed!',);
      // this.getAll();
    })
  }

  setInProgressByDriver() {
    console.log('currentUser!',this.currentUser);
    this
  }

  showSettings() {
    this.selectedTab = TabsEnum.ProfileDetails;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }
}

export enum TabsEnum {
  Dashboard = 'Dashboard',
  Users = 'Users',
  UserDashboard = 'UserDashboard',
  Settings = 'Settings',
  ProfileDetails = 'ProfileDetails'
}
