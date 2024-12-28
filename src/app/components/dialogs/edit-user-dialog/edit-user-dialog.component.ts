import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RolesService } from '../../../services/api/roles.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService, createUserDto, updateUserDto } from '../../../services/api/user.service';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DatepickerFieldComponent } from '../../shared/datepicker-field/datepicker-field.component';
import { SelectFieldComponent } from '../../shared/select-field/select-field.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { MatButtonModule } from '@angular/material/button';
import { ValidatorsService } from '../../../services/validators.service';
import { StateService } from '../../../services/state.service';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/api/auth.service';
import { MatExpansionModule } from '@angular/material/expansion';
@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    NgxUiLoaderModule,
    DatepickerFieldComponent,
    SelectFieldComponent,
    MatCheckboxModule,
    InputFieldComponent,
    MatButtonModule,
    MatExpansionModule,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.scss',
})
export class EditUserDialogComponent implements OnInit {
  toppings = new FormControl('', [Validators.required]);
  form: FormGroup;
  passwordForm: FormGroup | null;
  roles: any[] = [];
  posts: any[] = [];
  user;
  loaderId: string = 'edit-user-dialog';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user },
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService,
    private dialogsManager: DialogsManagerService,
    private ngxService: NgxUiLoaderService,
    private validatorsService: ValidatorsService,
    private stateService: StateService,
    private authService: AuthService,
    
  ) {
    this.user = data?.user;
    console.log('CONSOLE!', data);
    this.initForm();
    this.initPasswordForm();
    this.stateService.roles$.subscribe((roles) => {
      this.roles = roles;
      if (this.user?.roles?.length) {
        this.setRolesToUser();
      }
    });
    this.stateService.posts$.subscribe((posts) => {
      this.posts = posts;
    });

    if (this.user) {
      this.form.patchValue(this.user);
      this.setRolesToUser();
      if(this.user.banned) {
        // this.form.disable();
      };
    };
  }

  ngOnInit(): void {}

  initForm() {
    const phoneMask = this.validatorsService.phoneMask;
    this.form = this.fb.group({
      nickname: this.fb.control('', [Validators.required]),
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.email, Validators.required]),
      phoneNumber: this.fb.control('', [Validators.pattern(phoneMask), Validators.required]),
      phoneNumberSecond: this.fb.control('', [Validators.pattern(phoneMask)]),
      roles: this.fb.control([],[Validators.required]),

      inn: ['', [Validators.maxLength(254)]],
      kpp: ['', [Validators.maxLength(254)]],
      ogrn: ['', [Validators.maxLength(254)]],
      ocpo: ['', [Validators.maxLength(254)]],
      bic: ['', [Validators.maxLength(254)]],
      bankAccount: ['', [Validators.maxLength(254)]],
      userBankAccount: ['', [Validators.maxLength(254)]],
      registrationAddress: ['', [Validators.maxLength(254)]],
      realAddress: ['', [Validators.maxLength(254)]],
    });
  }

  initPasswordForm() {
    this.passwordForm = this.fb.group({
      password: this.fb.control('', [Validators.minLength(6), Validators.maxLength(16), Validators.required]),
      repeatPassword: this.fb.control('', [Validators.minLength(6), Validators.maxLength(16), Validators.required]),
    });

    this.passwordForm.get('repeatPassword').valueChanges.subscribe((repeatPass: string) => {
      const pass = this.passwordForm.get('password').value;
      if (pass !== repeatPass) {
        this.passwordForm.setErrors({ notSamePass: true });
        this.passwordForm.get('repeatPassword').setErrors({ notSamePass: true });
      } else {
        this.passwordForm.setErrors({ notSamePass: false });
        this.passwordForm.get('repeatPassword').setErrors(null);
      };
      console.log('CONSOLE!', this.passwordForm.errors);
    });
    this.passwordForm.get('password').valueChanges.subscribe((pass: string) => {
      const repeatPass = this.passwordForm.get('repeatPassword').value;
      if (pass !== repeatPass) {
        this.passwordForm.setErrors({ notSamePass: true });
        this.passwordForm.get('repeatPassword').setErrors({ notSamePass: true });
      } else {
        this.passwordForm.setErrors({ notSamePass: false });
        this.passwordForm.get('repeatPassword').setErrors(null);
      };
      console.log('CONSOLE!', this.passwordForm.errors);
    });
  }

  setRolesToUser() {
    if (!this.roles?.length || !this.user) {
      return;
    };
    const roles = this.roles
      .filter((r) => this.user.roles.some((role) => role.id == r.id))
      ?.map((r) => r?.id);
    console.log('selectedRoles', roles);
    this.form.get('roles').patchValue(roles);
  }

  update() {
    this.ngxService.startLoader(this.loaderId);
    const values = this.form.value;
    let request: updateUserDto = {
      id: this.user.id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      nickname: values.nickname,

      roles: values?.roles,

      inn: values.inn,
      kpp: values.kpp,
      ogrn: values.ogrn,
      ocpo: values.ocpo,
      bic: values.bic,
      bankAccount: values.bankAccount,
      userBankAccount: values.userBankAccount,
      registrationAddress: values.registrationAddress,
      realAddress: values.realAddress,
    };
    this.userService.updateUser(request).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      console.log('CONSOLE!', res);
      if (res) {
        const dialog = this.dialogsManager.openInfoMessageDialog('Успешно!');
        dialog.afterClosed().subscribe(() => {
          this.dialogRef.close(res);
        });
      };
    });
  }

  create() {
    const values = this.form.value;
    const password = this.passwordForm.get('password').value;
    this.ngxService.startLoader(this.loaderId);
    const data: createUserDto = {
      email: values.email,
      password: password,
      firstName: values.firstName,
      lastName: values.lastName,
      nickname: values.nickname,
      phoneNumber: values.phoneNumber,
      phoneNumberSecond: values.phoneSecond,
      isDriver: false,

      roles: values?.roles,

      inn: values.inn,
      kpp: values.kpp,
      ogrn: values.ogrn,
      ocpo: values.ocpo,
      bic: values.bic,
      bankAccount: values.bankAccount,
      userBankAccount: values.userBankAccount,
      registrationAddress: values.registrationAddress,
      realAddress: values.realAddress,
    };

    this.authService.register(data).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
      console.log('CONSOLE!', res);
      if (res) {
        const dialog = this.dialogsManager.openInfoMessageDialog('Пользователь успешно зарегистрирован!');
        dialog.afterClosed().subscribe(() => {
          this.dialogRef.close(res);
        });
      };
    });

  }

  blockUser() {
    this.dialogsManager.openInfoMessageDialog('Вы действительно хотите ЗАБЛОКИРОВАТЬ пользователя?', true).afterClosed().subscribe((confirmed: boolean) => {
      if(!confirmed) {
        return;
      };
      this.ngxService.startLoader(this.loaderId);
      this.userService.blockUser(this.user.id).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
        if (res) {
          const dialog = this.dialogsManager.openInfoMessageDialog('Пользователь заблокирован!');
          dialog.afterClosed().subscribe(() => {
            this.dialogRef.close(res);
          });
        };
      });
    });
  }

  unblockUser() {
    this.dialogsManager.openInfoMessageDialog('Вы действительно хотите РАБЛОКИРОВАТЬ пользователя?', true).afterClosed().subscribe((confirmed: boolean) => {
      if(!confirmed) {
        return;
      };
      this.ngxService.startLoader(this.loaderId);
      this.userService.unblockUser(this.user.id).pipe(finalize(() => this.ngxService.stopLoader(this.loaderId))).subscribe((res) => {
        if (res) {
          const dialog = this.dialogsManager.openInfoMessageDialog('Пользователь разблокирован!');
          dialog.afterClosed().subscribe(() => {
            this.dialogRef.close(res);
          });
        };
      });
    });
  }

  getNotSamePass(): boolean {
    if (this.passwordForm?.get('repeatPassword').errors) {
      return this.passwordForm?.get('repeatPassword').errors['notSamePass'];
    };
    return false;
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

  openPostDialog(post) {
    const fullPost = this.posts.find((p) => p.id === post.id);
    if(fullPost) {
      this.dialogsManager.openPostDialog(fullPost);
    };

  }
}
