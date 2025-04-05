import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  takeUntil,
} from 'rxjs';
import { UserService } from './api/user.service';
import { PostsService } from './api/posts.service';
import { DocumentsService } from './api/documents.service';
import { RolesService } from './api/roles.service';
import { AddressesService } from './api/addresses.service';
import { AddressTypes } from '../components/address-out/address-out.component';
import { EventNameEnum, WebSocketService } from './api/socket/web-socket.service';
import { CargoStatusesEnum, DeliveryTypesEnum, PostStatusesEnum } from '../components/dialogs/post-dialog/post-dialog.component';
import { WarehousesService } from './api/warehouses.service';

@Injectable({
  providedIn: 'root',
})
export class StateService implements OnDestroy {
  private usersSubject = new BehaviorSubject<any[]>([]);
  private postsSubject = new BehaviorSubject<any[]>([]);
  private documentsSubject = new BehaviorSubject<any[]>([]);
  private warehousesSubject = new BehaviorSubject<any[]>([]);
  private rolesSubject = new BehaviorSubject<any[]>([]);
  private clientsSubject = new BehaviorSubject<any[]>([]);

  private addressesInSubject = new BehaviorSubject<any[]>([]);
  private addressesOutSubject = new BehaviorSubject<any[]>([]);

  private unsubscribeAll$ = new Subject();

  users$: Observable<any[]> = this.usersSubject.asObservable();
  posts$: Observable<any[]> = this.postsSubject.asObservable();
  postsMap: Map<number, any> = new Map();
  documents$: Observable<any[]> = this.documentsSubject.asObservable();
  warehouses$: Observable<any[]> = this.warehousesSubject.asObservable();
  roles$: Observable<any[]> = this.rolesSubject.asObservable();
  clients$: Observable<any[]> = this.clientsSubject.asObservable();
  driversMap: Map<number, any> = new Map();

  addresesIn$: Observable<any[]> = this.addressesInSubject.asObservable();
  addressesOut$: Observable<any[]> = this.addressesOutSubject.asObservable();

  currentUser$: BehaviorSubject<any> = new BehaviorSubject(null);

  postsUpdatesSignal = new Subject<any>();
  documentsUpdatesSignal = new Subject<any>();
  usersUpdatesSignal = new Subject<any>();
  userBannedSignal$: BehaviorSubject<any> = new BehaviorSubject(null);

  deliveryTypes = [
    {
      id: DeliveryTypesEnum.Pickup,
      name: 'Самовывоз из офиса или пункта выдачи заказов (ПВЗ).',
    },
    {
      id: DeliveryTypesEnum.CourierDelivery,
      name: 'Курьерская доставка',
    },
  ];

  cargoStatuses = [
    {
      id: CargoStatusesEnum.WaitCargo,
      name: 'В Ожидании забора груза',
    },
    // {
    //   id: CargoStatusesEnum.WaitInOurWarehouse,
    //   name: 'В Ожидании забора груза',
    // },
    {
      id: CargoStatusesEnum.OnTheWayOnOurDelivery,
      name: 'В пути',
    },
    {
      id: CargoStatusesEnum.WaitConfirmation,
      name: 'Ожидает Подтверждения',
    },
    {
      id: CargoStatusesEnum.WaitInWarehouse,
      name: 'На Складе',
    },
    // {
    //   id: CargoStatusesEnum.ReadyForPickup,
    //   name: 'Готово к выдаче',
    // },
    {
      id: CargoStatusesEnum.Issued,
      name: 'Выдано',
    },
    {
      id: CargoStatusesEnum.Cancelled,
      name: 'Отменено',
    },
  ];

  statuses = [
    {
      id: 0,
      value: 'Не одобрено',
    },
    {
      id: 1,
      value: 'Одобрено',
    },
    {
      id: 2,
      value: 'В pаботе',
    },
    {
      id: 3,
      value: 'Выполнено',
    },
    {
      id: 4,
      value: 'Отменено',
    },
    {
      id: 5,
      value: 'ЧП',
    },
  ];

  constructor(
    private usersSerive: UserService,
    private postsService: PostsService,
    private documentsService: DocumentsService,
    private rolesService: RolesService,
    private addressesService: AddressesService,
    private webSocketService: WebSocketService,
    private warehousesService: WarehousesService
  ) {
    this.loadRoles();
    this.loadUsers();
    this.loadPosts();
    this.loadDocuments();
    this.loadWarehouses();
    this.loadClients();
    this.loadDrivers();

    this.loadAddresesIn();
    this.loadAddresesOut();

    this.registerListeners();
  }
  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  private loadUsers() {
    this.usersSerive.getUsers().subscribe((res) => {
      if (!res) {
        return;
      }
      this.usersSubject.next(res);
    });
  }

  private loadPosts() {
    this.postsService.getPosts().subscribe((res) => {
      if (!res) {
        return;
      };

      this.postsSubject.next(res);
      this.postsMap.clear();
      res?.forEach(element => {
        this.postsMap.set(element.id,element);
      });
    });
  }

  loadDocuments() {
    this.documentsService.getAllDocuments().subscribe((res) => {
      if (!res) {
        return;
      }
      this.documentsSubject.next(res);
    });
  }

  private loadWarehouses() {
    this.warehousesService.getAll().subscribe((res) => {
      if (!res) {
        return;
      }
      this.warehousesSubject.next(res);
    });
  }

  private loadRoles() {
    this.rolesService.getAllRoles().subscribe((res) => {
      if (!res) {
        return;
      }
      this.rolesSubject.next(res);
    });
  }

  private loadClients() {
    this.roles$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((roles) => {
      if (roles?.length) {
        const clientRole = roles.find((role) => role.value == 'User');
        console.log('clientRole', clientRole);
        this.usersSerive
          .getFilteredUsers(clientRole.id)
          .subscribe((res: any) => {
            if (!res) {
              return;
            }
            console.log('getFilteredUsers', res);
            this.clientsSubject.next(res);
          });
      }
    });
  }

  private loadDrivers() {
    this.roles$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((roles) => {
      if (roles?.length) {
        const clientRole = roles.find((role) => role.value == 'Driver');
        console.log('clientRole', clientRole);
        this.usersSerive
          .getFilteredUsers(clientRole.id)
          .subscribe((res: any) => {
            if (!res) {
              return;
            }
            console.log('getFilteredUsers', res);
            this.driversMap.clear();
            res?.forEach(element => {
              this.driversMap.set(element.id, element);
            });
          });
      }
    });
  }

  private loadAddresesIn() {
    this.addressesService
      .getFilteredAddress({ addressType: AddressTypes.InAddress })
      .subscribe((res: any) => {
        console.log('console', res);
        this.addressesInSubject.next(res);
      });
  }

  private loadAddresesOut() {
    this.addressesService
      .getFilteredAddress({ addressType: AddressTypes.OutAddress })
      .subscribe((res: any) => {
        console.log('loadAddresesOut', res);
        this.addressesOutSubject.next(res);
      });
  }


  getAllData(): Observable<{
    users: any[];
    posts: any[];
    documents: any[];
    // warehouses: any[];
  }> {
    return combineLatest([
      this.users$,
      this.posts$,
      this.documents$,
      // this.warehouses$,
    ]).pipe(
      map(([users, posts, documents]) => ({
        users,
        posts,
        documents,
      }))
    );
  }

  updateCurrentUser(user: any) {
    this.currentUser$.next(user);
  }

  registerListeners() {
    this.webSocketService.on(EventNameEnum.OnPostUpdate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.postsUpdatesSignal.next(data);
      this.loadPosts();
    });
    this.webSocketService.on(EventNameEnum.OnPostDelete).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.postsUpdatesSignal.next(data);
      this.loadPosts();
    });
    this.webSocketService.on(EventNameEnum.OnPostCreate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.postsUpdatesSignal.next(data);
      this.loadPosts();
    });

    this.webSocketService.on(EventNameEnum.OnDocumentCreate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.documentsUpdatesSignal.next(data);
      this.loadDocuments();
    });
    this.webSocketService.on(EventNameEnum.OnDocumentUpdate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.documentsUpdatesSignal.next(data);
      this.loadDocuments();
    });
    this.webSocketService.on(EventNameEnum.OnDocumentDelete).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.documentsUpdatesSignal.next(data);
    });

    this.webSocketService.on(EventNameEnum.OnUserBanned).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.userBannedSignal$.next(data);
      this.loadUsers();
    });
    this.webSocketService.on(EventNameEnum.OnUserCreate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.usersUpdatesSignal.next(data);
      this.loadUsers();
    });
    this.webSocketService.on(EventNameEnum.OnUserDelete).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.usersUpdatesSignal.next(data);
      this.loadUsers();
    });
    this.webSocketService.on(EventNameEnum.OnUserUpdate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.usersUpdatesSignal.next(data);
      this.loadUsers();
    });

    this.usersUpdatesSignal.subscribe((data) => {
      console.log('usersUpdatesSignal', data);
      this.loadUsers();
      
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

  getPostExecutingStatusFromText(status: string): number {
    switch (status) {
      case 'Не одобрено':
        return PostStatusesEnum.NotAllowed;
      case 'Одобрено':
        return PostStatusesEnum.Allowed;
      case 'В pаботе':
        return PostStatusesEnum.InProgress;
      case 'Выполнено':
        return PostStatusesEnum.Done;
      case 'Отменено':
        return PostStatusesEnum.Rejected;
      case 'ЧП':
        return PostStatusesEnum.SOS;
      default:
        return PostStatusesEnum.NotAllowed;
    }
  }

  getCargoStatus(cargoStatus: CargoStatusesEnum): string {
    switch (cargoStatus) {
      case CargoStatusesEnum.WaitCargo:
        return 'В Ожидании забора груза';
      case CargoStatusesEnum.OnTheWayOnOurDelivery:
        return 'В пути';
      case CargoStatusesEnum.WaitConfirmation:
        return 'Ожидает подтверждения Работником ПВЗ'; 
      case CargoStatusesEnum.WaitInWarehouse:
        return 'Hа Складе';
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
