import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UsersComponent } from '../../users/users.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { StateService } from '../../../services/state.service';
import { PostsService } from '../../../services/api/posts.service';
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
import { Subject, takeUntil } from 'rxjs';
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
    NgxUiLoaderModule,
    InputFieldComponent,
    MatInputModule,
    MatIconModule,
    DatepickerFieldComponent,
    SelectFieldComponent,
    MatCheckboxModule,
    MatExpansionModule,
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
  post;
  driver;
  isEdit: boolean = false;
  
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
  loaderId: string = 'post-dialog';
  clients;
  price = 2000;

  addressesIn = [
    {
      name: "ООО РОМАШКА",
      address: "Сухум, Государственная 31"
    },
    {
      name: "ИП СИДОРОВ",
      address: "Сухум, Государственная 23"
    },
    {
      name: "ООО ЛАРИН",
      address: "Сухум, Государственная 44"
    },
    {
      name: "ФАО КИНГИЗ",
      address: "Сухум, Государственная 34/2"
    },
    {
      name: "НТП КГБ",
      address: "Сухум, Мира 8"
    },
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
    this.initForm();
    this.post = data?.post;
    console.log('this.post', this.post);

    console.log('this.currentUser!', this.currentUser);
    this.stateService.clients$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((value) => {
      this.clients = value;
    });
    this.stateService.currentUser$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((value) => {
      this.currentUser = value;
      if(this.currentUser?.id) {
        this.setValidator();
      };
    });

    // this.form = fb.group({
    //   id: fb.control(''),
    //   status: fb.control(''),
    //   title: fb.control(''),
    //   content: fb.control(''),
    //   addressFrom: fb.control(''),
    //   addressTo: fb.control(''),
    //   warehouse: fb.control(''),
    //   price: fb.control(''),
    //   commission: fb.control(''),
    //   summ: fb.control(''),
    //   paid: fb.control(''),
    //   driverId: fb.control(''),
    //   createdAt: fb.control(''),
    // });

    this.initUserFormGroup();

    this.form.patchValue(this.post);
    if(this.post?.customer) {
      this.setUserDataFormValue(this.post?.customer);
    };
    if (!this.userService.isUserAdmin(this.currentUser)) {
      console.log(
        'this.userService.isUserAdmin(this.currentUser)!',
        this.userService.isUserAdmin(this.currentUser)
      );
      // this.form.get('status').disable();
    }
    this.form.get('status').valueChanges.subscribe((value) => {
      console.log('value!', value);
    });
    this.form.get('cargoCharacterSize').valueChanges.subscribe((value: string) => {
      if(this.form.get('cargoCharacterSize')?.valid) {
        console.log('cargoCharacterSize',value);
        let fd = value.split('*')[0];
        let sd = value.split('*')[1];
        let td = value.split('*')[2];
        console.log('console',fd,sd,td);
        let all = (+fd)*(+sd)*(+td);
        console.log('console',all);
        this.form.get('cargoCharacterSizeAll').setValue(all);
      };
    })
  }
  ngOnDestroy(): void {
    this.unsubscribeAll$.next(null);
    this.unsubscribeAll$.complete();
  }


  ngOnInit(): void {
    if(this.post?.author?.id) {
      this.userApiService.getUserById(this.post?.author?.id).subscribe((res) => {
        console.log('getUserById',res);
        this.userDataForm.patchValue(res);
        this.userDataForm.disable();
      })
    };
    this.userApiService.getUsers
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      addressFrom: ['', Validators.required],
      addressTo: ['', Validators.required],
      postNaming: [''],
      warehouse: ['', Validators.required],
      cargoStatus: [0, Validators.required],
      deliveryDate: [null],
      deliveryType: ['', Validators.required],
      trackCode: ['', Validators.required],
      orderNumber: ['', Validators.required],
      cargoPickupComment: [''],
      cargoCharacter: [''],
      cargoCharacterComment: [''],
      cargoCharacterSize: ['', [Validators.required, Validators.pattern(/^\d{1,3}\*\d{1,3}\*\d{1,3}$/)]],
      cargoCharacterSizeAll: [0],
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
      customerId: ['', Validators.required],

      price: [0, Validators.pattern('[0-9]*')],
      commission: [0, Validators.pattern('[0-9]*')],
      summ: [0, Validators.pattern('[0-9]*')],
      paid: [0, Validators.pattern('[0-9]*')],
      createdAt: this.fb.control(''),
      status: this.fb.control(''),


    });
  }

  setValidator() {
    if(this.currentUser?.roles?.some(role => role.value == 'Admin' || role.value == 'Operator')) {
      this.form.get('customerId')?.setValidators(Validators.required);
    };

    if(this.userService.isUserAdmin(this.currentUser) || this.userService.isUserOperator(this.currentUser)) {
      this.form.get('price').setValidators(Validators.required);
      this.form.get('commission').setValidators(Validators.required);
      this.form.get('summ').setValidators(Validators.required);
      this.form.get('paid').setValidators(Validators.required);
      this.setPriceCalc();
    };

  }

  setPriceCalc() {
    this.form.get('price').valueChanges.subscribe(value => {
      const commission = this.form.get('commission').value;
      console.log('commission',);
      if(commission) {
        this.form.get('summ').setValue((+commission) + (+value));
      }
    });

    this.form.get('commission').valueChanges.subscribe(value => {
      const price = this.form.get('price').value;
      console.log('price',price);
      if(price) {
        this.form.get('summ').setValue((+price) + (+value));
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

  setUserDataFormValue(user) {
    this.userDataForm.patchValue(user);
  }

  getPostExecutingStatus(status: string): number {
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

  save() {
    this.ngxService.startLoader(this.loaderId);
    const value = this.form.value;
    const request = value;
    this.postsService.updatePost(request).subscribe((res) => {
      this.ngxService.stopLoader(this.loaderId);
      console.log('setStatus!', res);
      if (res) {
        this.dialogsManager.openInfoMessageDialog('Успешно!');
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

  create() {

    const values = this.form?.value;
    console.log('values',values);


    this.postsService.createPost(values, this.currentUser).subscribe(res => {
      console.log('createPost',res);
    })

  }
}

export enum PostStatusesEnum {
  NotAllowed = 0,
  Allowed = 1,
  InProgress = 2,
  Done = 3,
  Rejected = 4,
  SOS = 5,
}
