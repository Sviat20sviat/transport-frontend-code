import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { StateService } from '../../../services/state.service';
import {
  CreatePostData,
  PostsService,
} from '../../../services/api/posts.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DatepickerFieldComponent } from '../../shared/datepicker-field/datepicker-field.component';
import { SelectFieldComponent } from '../../shared/select-field/select-field.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UserService as UserApiServie } from '../../../services/api/user.service';
import { BehaviorSubject, Subject, combineLatest, takeUntil } from 'rxjs';
import { PhotoSelectComponent } from '../../shared/photo-select/photo-select.component';
@Component({
  selector: 'post-dialog',
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
    MatInputModule,
    MatIconModule,
    DatepickerFieldComponent,
    SelectFieldComponent,
    MatCheckboxModule,
    MatExpansionModule,
    PhotoSelectComponent,
  ],
  templateUrl: './post-dialog.component.html',
  styleUrl: './post-dialog.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class PostDialogComponent implements OnInit, OnDestroy {
  unsubscribeAll$: Subject<any> = new Subject();
  currentUser;
  form: FormGroup;
  userDataForm: FormGroup;
  driverDataForm: FormGroup;
  post;
  driver;
  isEdit: boolean = false;

  statuses = [];
  deliveryTypes = [];
  cargoStatuses = [];
  warehouses = [];
  loaderId: string = 'post-dialog';
  clients;
  users;
  price = 2000;

  addressesIn = [];
  addressesOut = [];
  addressesInGroup = [];
  addressesOutGroup = [];
  addAddressToFavorite$: BehaviorSubject<any>;

  titles = [
    {
      name: "Малогабаритные грузоперевозки с маркетплейсов Адлер - Сухум (сборным грузом)",
      items: [
        {name: "До 4.5 литр. до 2кг", id: 1, commission: 45, sum: 300},
        {name: "До 12 литр. до 5кг", id: 2, commission: 127, sum: 850},
        {name: "До 30 литр. до 12кг", id: 3,commission: 277, sum: 1850},
        {name: "До 60 литр. до 18кг", id: 4, commission: 405,sum: 2700},
        {name: "До 110 литр. до 20кг", id: 5, commission: 510,sum: 3400},
        {name: "До 150 литр. до 30кг", id: 6, commission: 555,sum: 3700},
      ]
    },
    {
      name: "Трансфер (индивидуальная поездка)",
      items: [
        { name: "Аэропорт Сочи - Цандрипш", id: 7, commission: 3375, sum: 4500 },
        { name: "Аэропорт Сочи - Холодная речка", id: 8, commission: 3375, sum: 4500 },
        { name: "Аэропорт Сочи - Гагра", id: 9, commission: 3750, sum: 5000 },
        { name: "Аэропорт Сочи - Алахадзы", id: 10, commission: 4125, sum: 5500 },
        { name: "Аэропорт Сочи - Пицунда", id: 11, commission: 4125, sum: 5500 },
        { name: "Аэропорт Сочи - Лидзава", id: 12, commission: 4500, sum: 6000 },
        { name: "Аэропорт Сочи - Монашеское ущелье", id: 4, commission: 4875, sum: 6500 },
        { name: "Аэропорт Сочи - Мюсера", id: 13, commission: 4875, sum: 6500 },
        { name: "Аэропорт Сочи - Гудаута", id: 14, commission: 4875, sum: 6500 },
        { name: "Аэропорт Сочи - Новый Афон", id: 15, commission: 5250, sum: 7000 },
        { name: "Аэропорт Сочи - Сухум", id: 16, commission: 5625, sum: 7500 },
        { name: "Аэропорт Сочи - Агудзера", id: 17, commission: 6000, sum: 8000 },
        { name: "Аэропорт Сочи - Дранда, Бабушара", id: 18, commission: 6000, sum: 8000 },
        { name: "Аэропорт Сочи - Кындги", id: 19, commission: 6375, sum: 8500 },
        { name: "Аэропорт Сочи - Тамыш", id: 20, commission: 6750, sum: 9000 },
        { name: "Аэропорт Сочи - Очамчира", id: 21, commission: 7125, sum: 9500 },
        { name: "Аэропорт Сочи - Ткварчал", id: 22, commission: 7875, sum: 10500 },
        { name: "Аэропорт Сочи - Гал", id: 23, commission: 7875, sum: 10500 }
      ]
    },
    {
      name: "Грузоперевозки до 3 тонн (индивидуальная поездка)",
      items: [
        { name: "Сухум - Цандрипш", id: 24, sum: 12500, commission: 9375 },
        { name: "Сухум - Гагра", id: 25, sum: 9000, commission: 6750 },
        { name: "Сухум - Гудаута", id: 26, sum: 6000, commission: 4500 },
        { name: "Сухум - Новый Афон", id: 27, sum: 4500, commission: 3375 },
        { name: "Сухум - Сухум", id: 28, sum: 1700, commission: 1275 },
        { name: "Сухум - Агудзера", id: 29, sum: 4200, commission: 3150 },
        { name: "Сухум - Дранда", id: 30, sum: 5200, commission: 3900 },
        { name: "Сухум - Адзюбжа/Лабра", id: 31, sum: 7700, commission: 5775 },
        { name: "Сухум - Очамчира", id: 32, sum: 10000, commission: 7500 },
        { name: "Сухум - Ткварчал", id: 33, sum: 10000, commission: 7500 },
        { name: "Сухум - Гал", id: 34, sum: 14500, commission: 10875 }
      ]
    }
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { post },
    public dialogRef: MatDialogRef<PostDialogComponent>,
    private dialogsManager: DialogsManagerService,
    private stateService: StateService,
    private postsService: PostsService,
    private ngxService: NgxUiLoaderService,
    private fb: FormBuilder,
    public userService: UserService,
    private userApiService: UserApiServie
  ) {
    this.deliveryTypes = this.stateService.deliveryTypes;
    this.cargoStatuses = this.stateService.cargoStatuses;
    this.statuses = this.stateService.statuses;
  }

  ngOnInit(): void {
    this.post = this.data?.post;
    this.initForm();


    this.form.patchValue(this.post);

    this.form.get('status').valueChanges.subscribe((value) => {
      console.log('value!', value);
    });

    this.form.get('height').valueChanges.subscribe((value: number) => {
      this.form.get('cargoCharacterSizeAll').setValue(this.cargoCharacterSizeAllCalc(value, this.form.get('width').value, this.form.get('depth').value));
    });
    this.form.get('width').valueChanges.subscribe((value: number) => {
      this.form.get('cargoCharacterSizeAll').setValue(this.cargoCharacterSizeAllCalc(this.form.get('height').value, value, this.form.get('depth').value));
    });
    this.form.get('depth').valueChanges.subscribe((value: number) => {
      this.form.get('cargoCharacterSizeAll').setValue(this.cargoCharacterSizeAllCalc(this.form.get('height').value, this.form.get('width').value, value));
    });
    this.form.get('addressTo').valueChanges.subscribe((value: string) => {
      if(value?.length) {
        const isExistTo = this.addressesIn.find((item) => item.address === value);
        const isExistFrom = this.addressesOut.find((item) => item.address ===  this.form.get('addressFrom').value);
        if(isExistTo && isExistFrom) {
          this.form.get('deliveryType').setValue(DeliveryTypesEnum.Pickup);
        } else {
          this.form.get('deliveryType').setValue(DeliveryTypesEnum.CourierDelivery);
        };
      };
    });
    this.form.get('addressFrom').valueChanges.subscribe((value: string) => {
      // if(value?.length) {
      //   // const isExistFrom = this.addressesOut.find((item) => item.address === value);
      //   const isExistTo = this.addressesIn.find((item) => item.address ===  this.form.get('addressTo').value);
      //   if(isExistTo) {
      //     this.form.get('deliveryType').setValue(DeliveryTypesEnum.Pickup);
      //   } else {
      //     this.form.get('deliveryType').setValue(DeliveryTypesEnum.CourierDelivery);
      //   };
      // };
    });
    combineLatest({
      clients: this.stateService.clients$,
      currentUser: this.stateService.currentUser$,
      addresesIn: this.stateService.addresesIn$,
      addresesOut: this.stateService.addressesOut$,
      users: this.stateService.users$,
      warehouses: this.stateService.warehouses$
    })
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((res) => {
        this.clients = res.clients;
        this.currentUser = res.currentUser;

        this.addressesIn = res.addresesIn;
        this.addressesOut = res.addresesOut;
        console.log('warehouses',res.warehouses);
        this.warehouses = res.warehouses;
        this.addressesInGroup = this.setAutocompleteAddresses(
          this.currentUser?.favoriteAddresses,
          this.addressesIn
        );
        this.addressesOutGroup = this.setAutocompleteAddresses(
          this.currentUser?.favoriteAddresses,
          this.addressesOut
        );
        this.users = res?.users;

        if(this.isAdmin() || this.isOperator()) {
          this.initUserFormGroup();
          this.initDriverFormGroup();
          if (this.post?.customer) {
            this.setUserDataFormValue(this.post?.customer);
          };
          if (this.post?.driver) {
            this.setDriverDataFormValue(this.post?.driver);
          };
        };
        if (this.currentUser?.id) {
          this.setValidator();
        };
      });
    if (this.post?.author?.id && (this.isAdmin() || this.isOperator())) {
      this.userApiService
        .getUserById(this.post?.author?.id)
        .subscribe((res) => {
          this.userDataForm.patchValue(res);
          this.userDataForm.disable();
          this.driverDataForm.disable();
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }

  initForm() {
    this.form = this.fb.group({
      title: [''],
      content: [''],

      addressFrom: ['', Validators.required],
      addressTo: ['', Validators.required],

      addressFromId: [null],
      addressToId: [null],

      postNaming: [''],
      warehouse: [''],
      cargoStatus: [1],
      deliveryDate: [null],
      deliveryType: [null, Validators.required],
      trackCode: [''],
      orderNumber: [''],
      cargoPickupComment: [''],
      cargoCharacter: [''],
      cargoCharacterComment: [''],
      cargoCharacterSize: [''],
      cargoCharacterSizeAll: this.fb.control(0),
      cargoCharacterWeight: [''],
      isFragile: [false],
      additionalContactFullName: [''],
      additionalContactPhone: [''],
      additionalContactPhoneSec: [''],
      additionalComment: [''],
      additionalRecipientFullName: [''],
      additionalRecipientPhone: [''],
      additionalRecipientComment: [''],
      additionalFloor: [''],
      additionalFriagle: [false],
      userId: [null],
      customerId: [null, Validators.required],

      price: [0, Validators.pattern('[0-9]*')],
      commission: [0, Validators.pattern('[0-9]*')],
      summ: [0, Validators.pattern('[0-9]*')],
      paid: [0, Validators.pattern('[0-9]*')],
      status: this.fb.control(''),
      imageUrl: this.fb.control(''),

      height: [
        null,
        [
          Validators.pattern('[0-9]*'),
          Validators.maxLength(3),
        ],
      ],
      width: [
        null,
        [
          Validators.pattern('[0-9]*'),
          Validators.maxLength(3),
        ],
      ],
      depth: [
        null,
        [
          Validators.pattern('[0-9]*'),
          Validators.maxLength(3),
        ],
      ],
      warehouseId: [null]
    });
  }

  setValidator() {
    if (
      this.isAdmin() ||
      this.isOperator()
    ) {
      this.form.get('customerId')?.setValidators(Validators.required);
      this.form
        .get('price')
        .setValidators([Validators.required, Validators.minLength(2)]);
      this.form
        .get('commission')
        .setValidators([Validators.required, Validators.minLength(2)]);
      this.form
        .get('summ')
        .setValidators([Validators.required, Validators.minLength(2)]);
      this.form.get('paid').setValidators(Validators.required);
      this.setPriceCalc();
    } else {
      this.validateFormForUser();
      if(this.post?.id) {
        setTimeout(() => {
          this.form.disable();
        }, 0);
      };
    }
  }

  setPriceCalc() {
    this.form.get('price').valueChanges.subscribe((value) => {
      const commission = this.form.get('commission').value;
      console.log('commission');
      if (commission) {
        this.form.get('summ').setValue(+commission + +value);
      }
    });

    this.form.get('commission').valueChanges.subscribe((value) => {
      const price = this.form.get('price').value;
      console.log('price', price);
      if (price) {
        this.form.get('summ').setValue(+price + +value);
      }
    });
  }

  initUserFormGroup() {
    this.userDataForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      id: [''],
      status: [''],
      phoneNumber: [''],
      chatId: [''],
    });
  }

  initDriverFormGroup() {
    this.driverDataForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      id: [''],
      status: [''],
      phoneNumber: [''],
      chatId: [''],
    });
  }

  setUserDataFormValue(user) {
    this.userDataForm.patchValue(user);
  }

  setDriverDataFormValue(user) {
    this.driverDataForm.patchValue(user);
  }

  getPostExecutingStatus(status: string): number {
    return this.stateService.getPostExecutingStatusFromText(status);
  }

  save() {
    if (!this.post?.id) {
      return;
    };

    this.ngxService.startLoader(this.loaderId);
    const value = this.form.value;
    console.log('value',value);
    const request = value;
    request.id = this.post.id;
    this.postsService.updatePost(request).subscribe((res) => {
      this.ngxService.stopLoader(this.loaderId);
      console.log('setStatus!', res);
      if (res) {
        this.dialogsManager
          .openInfoMessageDialog('Успешно!')
          .afterClosed()
          .subscribe(() => {
            this.dialogRef.close(res);
          });
      }
    });
    this.isEdit = false;
  }

  edit() {
    this.isEdit = true;
  }

  isAdmin(): boolean {
    return this.currentUser?.roles?.some((role) => role.value == 'Admin');
  }
  isOperator(): boolean {
    return this.currentUser?.roles?.some((role) => role.value == 'Operator');
  }

  create() {
    console.log('create',);
    const values = this.form?.value;
    console.log('values',);
    const createPostData: CreatePostData = {
      title: values.title,
      content: values.content,

      addressFrom: values.addressFrom,
      addressTo: values.addressTo,

      addressFromId: values?.addressFromId,
      addressToId: values?.addressToId,

      postNaming: values.postNaming,
      warehouse: values?.warehouse,
      cargoStatus: values.cargoStatus,
      deliveryDate: values.deliveryDate,
      deliveryType: values.deliveryType,
      trackCode: values.trackCode,
      orderNumber: values.orderNumber,
      cargoPickupComment: values.cargoPickupComment,
      cargoCharacter: values.cargoCharacter,
      cargoCharacterComment: values.cargoCharacterComment,
      cargoCharacterSize: values.cargoCharacterSize,
      cargoCharacterSizeAll: values.cargoCharacterSizeAll || 0,
      cargoCharacterWeight: values.cargoCharacterWeight,
      isFragile: values.isFragile || false,
      additionalContactFullName: values.additionalContactFullName,
      additionalContactPhone: values.additionalContactPhone,
      additionalContactPhoneSec: values.additionalContactPhoneSec,
      additionalComment: values.additionalComment,
      additionalRecipientFullName: values.additionalRecipientFullName,
      additionalRecipientPhone: values.additionalRecipientPhone,
      additionalRecipientComment: values.additionalRecipientComment,
      additionalFloor: values.additionalFloor,
      additionalFriagle: values.additionalFriagle || false,
      userId: values.userId || null,
      customerId: values.customerId || values.userId,
      price: values.price || 0,
      commission: values.commission || 0,
      summ: values.summ || 0,
      paid: values.paid || 0,
      status: values.status,
      imageUrl: values.imageUrl,

      height: values.height || 0,
      width: values.width || 0,
      depth: values.depth || 0,
      warehouseId: values.warehouseId || null,
    };

    console.log(createPostData);
    console.log('values', values);
    if (
      !this.isAdmin() &&
      !this.isOperator()
    ) {
      console.log('USERUSER',this.currentUser);
      values.customerId = this.currentUser.id;
    }

    this.postsService
      .createPost(createPostData, this.currentUser)
      .subscribe((res) => {
        console.log('createPost', res);
        if (!res) {
          this.dialogsManager.openInfoMessageDialog('ОШИБКА СОЗДАНИЯ');
          return;
        }
        if (
          !this.userService.isUserAdmin(this.currentUser) &&
          !this.userService.isUserOperator(this.currentUser)
        ) {
          this.dialogsManager.openInfoMessageDialog(
            'Объявление успешно создано. Вы увидите стоимость услуги и Водитель сможет приступить к заказу после его подтверждения Оператором.'
          );
        } else {
          this.dialogsManager.openInfoMessageDialog(
            'Объявление успешно создано'
          );
        }

        this.dialogRef.close(res);
      });
  }

  validateFormForUser() {
    this.form.get('price').clearValidators();
    this.form.get('commission').clearValidators();
    this.form.get('summ').clearValidators();
    this.form.get('paid').clearValidators();
    this.form.get('customerId').clearValidators();
  }

  addAddressToFavorite(address) {
    console.log('event addAddressToFavorite', event);
    if (!this.currentUser?.id) {
      return;
    }
    let addresses = [];
    if (this.currentUser?.favoriteAddresses?.length) {
      addresses = [...this.currentUser?.favoriteAddresses];
    }
    addresses = [...addresses, address];
    this.userApiService
      .setUserFavoriteAddress(this.currentUser?.id, addresses)
      .subscribe((res) => {
        console.log('setUserFavoriteAddress', res);
        if (!res) {
          this.dialogsManager.openInfoMessageDialog(
            'Ошибка добавления адреса в избранное'
          );
          return;
        }
        this.currentUser = res;
        this.dialogsManager.openInfoMessageDialog('Адрес добавлен успешно!');
        this.addressesInGroup = this.setAutocompleteAddresses(
          this.currentUser?.favoriteAddresses,
          this.addressesIn
        );
        this.addressesOutGroup = this.setAutocompleteAddresses(
          this.currentUser?.favoriteAddresses,
          this.addressesOut
        );
      });
  }

  setAutocompleteAddresses(
    userFavorites: string[] | null,
    addresses: string[] | null
  ): any[] {
    const groups = [];

    if (userFavorites?.length) {
      const group = {
        name: 'Избранные Адреса',
        items: userFavorites.map((item) => {
          return { name: item };
        }),
      };
      groups.push(group);
    }
    if (addresses?.length) {
      const group = {
        name: 'Возможные Адреса',
        items: addresses,
      };
      groups.push(group);
    }
    return groups;
  }

  openUserDialog() {
    console.log('this.post', this.post);
    if (!this.post?.customer?.id) {
      return;
    }

    const fullUser = this.users.find(
      (user) => user.id == this.post.customer.id
    );
    if (fullUser) {
      this.dialogsManager.openUserDialog(fullUser);
    }
  }

  openDriverDialog() {
    console.log('this.post', this.post);
    if (!this.post?.driver?.id) {
      return;
    }

    const fullUser = this.users.find((user) => user.id == this.post.driver.id);
    if (fullUser) {
      this.dialogsManager.openUserDialog(fullUser);
    }
  }

  getPostExecutingStatusText(status: number): string {
    return this.stateService.getPostExecutingStatus(status);
  }

  onPhotoLoad(imageUrl: string) {
    console.log('onPhotoLoad', imageUrl);
    if (imageUrl && this.post?.imageUrl) {
      this.post.imageUrl = imageUrl;
    }
    this.form.get('imageUrl').setValue(imageUrl);
  }

  cargoCharacterSizeAllCalc(height: number, width: number, depth: number): number {
    const dimensions = [Number(height), Number(width), Number(depth)];
    const validNumbers = dimensions.filter(value => typeof value === 'number' && !isNaN(value) && value > 0);

    if (validNumbers.length === 0) {
      return 0;
    } else if (validNumbers.length === 1) {
      return validNumbers[0];
    } else {
      return validNumbers.reduce((acc, current) => acc * current, 1);
    };
  }

  selectPostTitle(event) {
    this.form.get('summ').setValue(event.sum);
    this.form.get('commission').setValue(event.commission);
    this.form.get('price').setValue(event.sum - event.commission);
  }

  getCargoStatus(cargoStatus: CargoStatusesEnum): string {
    return this.stateService.getCargoStatus(cargoStatus);
  }
}

export enum PostStatusesEnum {
  NotAllowed = 0,
  Allowed = 1,
  InProgress = 2,
  AwaitingReceipt = 21,
  Done = 3,
  Rejected = 4,
  SOS = 5,
}

export enum DeliveryTypesEnum {
  CourierDelivery = 1,
  Pickup = 2,
}

export enum CargoStatusesEnum {
  WaitCargo = 1,
  OnTheWayOnOurDelivery = 2,
  WaitConfirmation = 3,
  WaitInWarehouse = 4,
  // WaitInOurWarehouse = 4,
  ReadyForPickup = 5,
  Issued = 6,
  Cancelled = 7,
}