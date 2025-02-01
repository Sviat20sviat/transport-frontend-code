import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
import {
  EventNameEnum,
  WebSocketService,
} from '../../services/api/socket/web-socket.service';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import { CargoStatusesEnum, PostStatusesEnum } from '../dialogs/post-dialog/post-dialog.component';
import { DriverInfoComponent } from '../driver-info/driver-info.component';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DocumentsComponent } from '../documents/documents.component';
// import { YMapComponent, YMapDefaultSchemeLayerDirective } from 'angular-yandex-maps-v3';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddressInComponent } from '../address-in/address-in.component';
import { AddressOutComponent } from '../address-out/address-out.component';
import { MutualSettlementsComponent } from '../mutual-settlements/mutual-settlements.component';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { MatMenuModule } from '@angular/material/menu';
import { SelectFieldComponent } from '../shared/select-field/select-field.component';
// declare var ymaps:any;

@Component({
  selector: 'dashboard',
  imports: [
    CommonModule,
    UsersComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgxUiLoaderModule,
    ProfileDetailsComponent,
    MatTabsModule,
    PostsTableComponent,
    DriverInfoComponent,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    DocumentsComponent,
    // YMapComponent, YMapDefaultSchemeLayerDirective,
    MatTooltipModule,
    AddressInComponent,
    AddressOutComponent,
    MutualSettlementsComponent,
    InputFieldComponent,
    ContactsComponent,
    MatMenuModule,
    // SelectFieldComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  currentUser: any;
  leftOpened: boolean = false;
  selectedTab: string = TabsEnum.Dashboard;
  allPosts = [];
  checkedPosts = [];
  userPosts = [];
  serverAddress: string;
  unsubscribeAll$: Subject<any> = new Subject();
  loaderId: string = 'dashboard';
  selectedPostTypeTabIndex: number = 6;
  searchControl: FormControl;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private dialogsManager: DialogsManagerService,
    private stateService: StateService,
    private router: Router,
    private postsService: PostsService,
    private _serverApi: ServerService,
    private ngxService: NgxUiLoaderService,
    private websocketService: WebSocketService,
    private el: ElementRef,
    private fb: FormBuilder
  ) {
    this.serverAddress = this._serverApi.serverAddress;
    this.searchControl = fb.control('');
  }

  ngOnInit(): void {
    this.stateService.currentUser$
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((user) => {
        this.currentUser = user;
        console.log('currentUser',user);
        const localStorage = this.document.defaultView?.localStorage;
        let selectedTab = localStorage.getItem('selectedTab');
        if (selectedTab) {
          this.selectedTab = JSON.parse(selectedTab);
        }
        this.getAll();
        if (this.isDriver()) {
          this.selectedTab = TabsEnum.DriverDashboard;
        }
        if (!this.isAdmin() && !this.isOperator() && !this.isDriver()) {
          this.selectedTab = TabsEnum.UserDashboard;
        }
        if (this.isAdmin() || this.isOperator()) {
          this.setAdminListeners();
        }
        if (this.isDriver()) {
          this.setDriverListeners();
        }
        if (!this.isAdmin() && !this.isOperator() && !this.isDriver()) {
          console.log('isAdminisDriver',);
          this.setUserListeners();
        }
      });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loadMap();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  setAdminListeners() {
    this.stateService.postsUpdatesSignal
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((data) => {
        console.log('data', data);
        this.getAll();
      });
  }

  setUserListeners() {
    this.stateService.postsUpdatesSignal
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((data) => {
        if ((data?.customer?.id === this.currentUser?.id) || data?.clientId == this.currentUser?.id) {
          this.getAll();
        }
      });
  }

  setDriverListeners() {
    this.stateService.postsUpdatesSignal
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((data) => {
        if (data?.driver?.id == this.currentUser?.id || (data?.driver?.id == null && data.status == 1)) {
          this.getAll();
        }
      });
  }

  isAdmin(): boolean {
    return this.currentUser?.roles?.some((role) => role.value == 'Admin');
  }

  isDriver(): boolean {
    return this.currentUser?.roles?.some((role) => role.value == 'Driver');
  }

  isOperator(): boolean {
    return this.currentUser?.roles?.some((role) => role.value == 'Operator');
  }

  isUser(): boolean {
    return this.currentUser?.roles?.some((role) => role.value == 'User');
  }

  openInfo() {
    return this.dialogsManager.openInfoMessageDialog(
      'Успешно открытие ДАШБОРДА!'
    );
  }

  openConfirmDialog(message): MatDialogRef<InfoMessageComponent> {
    return this.dialogsManager.openInfoMessageDialog(message, true);
  }

  showUsers() {
    console.log('showUsers!');
    this.selectedTab = TabsEnum.Users;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showDashboard() {
    console.log('showDashboard!');
    this.selectedTab = TabsEnum.Dashboard;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showUserDashboard() {
    console.log('showUserDashboard!');
    this.selectedTab = TabsEnum.UserDashboard;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showDriverDashboard() {
    console.log('showDriverDashboard!');
    this.selectedTab = TabsEnum.DriverDashboard;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  logout() {
    this.router.navigateByUrl('/login');
  }

  getAll() {
    console.log('getAll', this.isAdmin());
    this.ngxService.startLoader(this.loaderId);
    if (this.isDriver()) {
      this.postsService.getAllCheckedPosts().subscribe((posts) => {
        console.log('getAllCheckedPosts!', posts);
        this.checkedPosts = posts;
        this.ngxService.stopLoader(this.loaderId);
      });
      return;
    }
    if (this.isAdmin() || this.isOperator()) {
      this.postsService.getPosts().subscribe((posts) => {
        console.log('CONSOLE!', posts);
        this.allPosts = posts;
        this.ngxService.stopLoader(this.loaderId);
      });
      return;
    }

    if (!this.isAdmin() && !this.isOperator() && !this.isDriver()) {
      this.postsService
        .getFilteredPosts({ customerId: this.currentUser?.id })
        .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
        .subscribe((posts: any) => {
          this.userPosts = posts;
        });
    }
  }

  deletePost(post: any) {
    const dialog = this.openConfirmDialog(
      'Вы действительно хотите удалить объявление?'
    );
    console.log('post!', post);
    dialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((confirmed: boolean) => {
        if (confirmed && post?.id) {
          console.log('confirmed!');
          this.postsService.deletePost(post.id).subscribe((res) => {
            console.log('CONSOLE!', res);
            if (res?.deleted) {
              const index = this.allPosts.findIndex((p) => p.id === post.id);
              this.allPosts.splice(index, 1);
            }
          });
          return;
        }
        console.log('not Cconfirmed');
      });
  }

  createPost() {
    console.log('createPost!');
    const dialog = this.dialogsManager.openCreatePostDialog();
    dialog.afterClosed().subscribe((res) => {
      if (res?.id) {
        // this.getAll();
      }
    });
  }

  getPost(id) {
    this.ngxService.startLoader(this.loaderId);
    this.postsService
      .getPost(id)
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((post) => {
        if (!this.isAdmin()) {
          if ((post as any).status !== 1) {
            return;
          }
          this.checkedPosts.push(post);
          return;
        }
        this.allPosts.push(post);
      });
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
      case 5:
        return 'ЧП';
      default:
        return 'Не одобрено';
    }
  }

  openPostDialog(post?) {
    console.log('CONSOLE!', post);
    const dialog = this.dialogsManager.openPostDialog(post);
    dialog.afterClosed().subscribe(() => {
      console.log('afterClosed!');
      // this.getAll();
    });
  }

  setInProgressByDriver(post) {
    if (!post) {
      this.dialogsManager.openInfoMessageDialog(
        'ОШИБКА! ОБЪЯВЛЕНИЕ НЕ НАЙДЕНО.'
      );
      return;
    }
    console.log('currentUser!', this.currentUser);
    this.dialogsManager
      .openInfoMessageDialog(
        'Вы действительно хотите взять на выполение это объявление?',
        true
      )
      .afterClosed()
      .subscribe((confirm) => {
        if (!confirm) {
          return;
        }

        this.ngxService.startLoader(this.loaderId);
        this.postsService
          .updatePost({
            driverId: this.currentUser.id,
            status: PostStatusesEnum.InProgress,
            id: post.id,
          })
          .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
          .subscribe((res) => {
            console.log('res', res);
            this.dialogsManager.openInfoMessageDialog(
              'Вы успешно взяли объявление! Пожалуйста, ознакомтесь детальнее с объявлением в списке Ваших Объявлений'
            );
            this.getAll();
          });
      });
  }

  showSettings() {
    this.selectedTab = TabsEnum.ProfileDetails;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showDriverPosts() {
    console.log('showDriverPosts');
    this.selectedTab = 'DriverDeliveries';
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  selectPostTypeTab(index: number) {
    this.selectedPostTypeTabIndex = index;

    switch (index) {
      case 0:
        this.getFilteredPosts(PostStatusesEnum.InProgress);
        break;
      case 1:
        this.getFilteredPosts(PostStatusesEnum.Allowed);
        break;
      case 2:
        this.getFilteredPosts(PostStatusesEnum.NotAllowed);
        break;
      case 3:
        this.getFilteredPosts(PostStatusesEnum.Done);
        break;
      case 4:
        this.getFilteredPosts(PostStatusesEnum.Rejected);
        break;
      case 5:
        this.getFilteredPosts(PostStatusesEnum.SOS);
        break;
      case 6:
        this.getFilteredPosts();
        break;

      default:
        this.getFilteredPosts(PostStatusesEnum.Allowed);
        break;
    }
  }

  getFilteredPosts(status?: number) {
    this.ngxService.startLoader(this.loaderId);
    const data = {};
    data['status'] = status;
    if (!this.isAdmin() && !this.isOperator()) {
      data['userId'] = this.currentUser?.id;
    }
    this.postsService
      .getFilteredPosts(data)
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((res: any) => {
        this.allPosts = res;
      });
  }

  showDocuments() {
    this.selectedTab = TabsEnum.Documents;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showMap() {
    this.selectedTab = TabsEnum.Map;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showInAddresses() {
    this.selectedTab = TabsEnum.InAddresses;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showOutAddresses() {
    this.selectedTab = TabsEnum.OutAddresses;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  showMutualSettlements() {
    this.selectedTab = TabsEnum.MutualSettlements;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  private async loadMap(): Promise<void> {
    // const ymaps = (window as any).ymaps;
    // await ymaps3.ready;
    // const {YMap, YMapDefaultSchemeLayer} = ymaps3;
    // const map = new ymaps.Map(
    //     document.getElementById('map'),
    //     {
    //         location: {
    //             center: [37.588144, 55.733842],
    //             zoom: 10
    //         }
    //     }
    // );
    // map.addChild(new YMapDefaultSchemeLayer());
  }
  searchPosts() {
    console.log('searchPosts');
    const value = this.searchControl.value;
    if (!value) {
      this.selectPostTypeTab(this.selectedPostTypeTabIndex);
      return;
    }
    this.ngxService.startLoader(this.loaderId);
    this.postsService
      .searchPosts(value)
      .pipe(finalize(() => this.ngxService.stopLoader(this.loaderId)))
      .subscribe((posts) => {
        if (posts) {
          this.allPosts = posts;
          this.selectedPostTypeTabIndex = 6;
        }
      });
  }

  onPostUpdate(event) {
    if (event) {
      this.selectPostTypeTab(this.selectedPostTypeTabIndex);
    }
  }

  showContacts() {
    this.selectedTab = TabsEnum.Contacts;
    localStorage.setItem('selectedTab', JSON.stringify(this.selectedTab));
  }

  getCargoStatus(status: number) {
    switch (status) {
      case CargoStatusesEnum.WaitCargo:
        return 'В Ожидании забора груза';
        case CargoStatusesEnum.OnTheWayOnOurDelivery:
        return 'В пути';
        case CargoStatusesEnum.WaitInWarehouse:
        return 'Ожидает на Складе';
        case CargoStatusesEnum.ReadyForPickup:
        return 'Готово к выдаче';
        case CargoStatusesEnum.Issued:
        return 'Выдано';
        case CargoStatusesEnum.Cancelled:
        return 'Отменено';
      default:
        return 'В пути';
    }
  }
}

export enum TabsEnum {
  Dashboard = 'Dashboard',
  Users = 'Users',
  UserDashboard = 'UserDashboard',
  DriverDashboard = 'DriverDashboard',
  Settings = 'Settings',
  ProfileDetails = 'ProfileDetails',
  DriverDeliveries = 'DriverDeliveries',
  Documents = 'Documents',
  Map = 'Map',
  InAddresses = 'InAddresses',
  OutAddresses = 'OutAddresses',
  MutualSettlements = 'MutualSettlements',
  Contacts = 'Contacts',
}
