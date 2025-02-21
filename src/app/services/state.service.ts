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
import { CargoStatusesEnum, DeliveryTypesEnum } from '../components/dialogs/post-dialog/post-dialog.component';

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
  documents$: Observable<any[]> = this.documentsSubject.asObservable();
  warehouses$: Observable<any[]> = this.warehousesSubject.asObservable();
  roles$: Observable<any[]> = this.rolesSubject.asObservable();
  clients$: Observable<any[]> = this.clientsSubject.asObservable();

  addresesIn$: Observable<any[]> = this.addressesInSubject.asObservable();
  addressesOut$: Observable<any[]> = this.addressesOutSubject.asObservable();

  currentUser$: BehaviorSubject<any> = new BehaviorSubject(null);

  postsUpdatesSignal = new Subject<any>();
  documentsUpdatesSignal = new Subject<any>();

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
      id: CargoStatusesEnum.WaitInWarehouse,
      name: 'Ожидает на Складе ',
    },
    {
      id: CargoStatusesEnum.ReadyForPickup,
      name: 'Готово к выдаче',
    },
    {
      id: CargoStatusesEnum.Issued,
      name: 'Выдано',
    },
    {
      id: CargoStatusesEnum.Cancelled,
      name: 'Отменено',
    },
  ];

  constructor(
    private usersSerive: UserService,
    private postsService: PostsService,
    private documentsService: DocumentsService,
    private rolesService: RolesService,
    private addressesService: AddressesService,
    private webSocketService: WebSocketService
  ) {
    this.loadRoles();
    this.loadUsers();
    this.loadPosts();
    this.loadDocuments();
    this.loadWarehouses();
    this.loadClients();

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
      }
      this.postsSubject.next(res);
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
    this.warehousesSubject.next([
      { id: 1, location: 'NY' },
      { id: 2, location: 'LA' },
    ]);
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
    });
    this.webSocketService.on(EventNameEnum.OnPostDelete).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.postsUpdatesSignal.next(data);
    });
    this.webSocketService.on(EventNameEnum.OnPostCreate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.postsUpdatesSignal.next(data);
    });

    this.webSocketService.on(EventNameEnum.OnDocumentCreate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.documentsUpdatesSignal.next(data);
    });
    this.webSocketService.on(EventNameEnum.OnDocumentUpdate).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.documentsUpdatesSignal.next(data);
    });
    this.webSocketService.on(EventNameEnum.OnDocumentDelete).subscribe((data) => {
      console.log('webSocketService =====>>>>',data);
      this.documentsUpdatesSignal.next(data);
    });
  }
}
