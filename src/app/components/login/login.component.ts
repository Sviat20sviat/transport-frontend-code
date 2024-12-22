import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ServerService } from '../../services/api/server.service';
import { AuthService } from '../../services/api/auth.service';
import { DialogsManagerService } from '../../services/dialogs-manager.service';
import { Router } from '@angular/router';
import { UserService, createUserDto } from '../../services/api/user.service';
import { StateService } from '../../services/state.service';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ValidatorsService } from '../../services/validators.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginPageImage: any;
  inputType: string = 'password';
  loginForm: FormGroup;
  registerForm: FormGroup;
  isRegistration: boolean = false;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private server: ServerService,
    private authService: AuthService,
    private dialogsManager: DialogsManagerService,
    private router: Router,
    private userService: UserService,
    private stateService: StateService,
    private validatorsService: ValidatorsService
  ) {
    this.loginForm = fb.group({
      email: fb.control(''),
      password: fb.control('')
    });
    const phoneMask = validatorsService.phoneMask;
    this.registerForm = fb.group({
      email: fb.control('', [Validators.email, Validators.required]),
      password: fb.control('', [Validators.minLength(6), Validators.maxLength(16), Validators.required]),
      repeatPassword: fb.control('', [Validators.minLength(6), Validators.maxLength(16), Validators.required]),
      nickname: fb.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(14)]),
      firstName: ['', [Validators.required,]],
      lastName: ['', [Validators.required,]],
      phoneNumber: fb.control('', [Validators.required, Validators.pattern(phoneMask)]),
      phoneNumberSecond: fb.control('', [Validators.pattern(phoneMask)]),
      isDriver: fb.control(false),
    })
  }
  ngOnInit(): void {
    const localStorage = this.document.defaultView?.localStorage;
    localStorage?.removeItem('accessToken');

    this.registerForm.get('repeatPassword').valueChanges.subscribe((repeatPass: string) => {
      const pass = this.registerForm.get('password').value;
      if (pass !== repeatPass) {
        this.registerForm.setErrors({ notSamePass: true });
        this.registerForm.get('repeatPassword').setErrors({ notSamePass: true });
      } else {
        this.registerForm.setErrors({ notSamePass: false });
        this.registerForm.get('repeatPassword').setErrors(null);
      };
      console.log('CONSOLE!', this.registerForm.errors);
    });
    this.registerForm.get('password').valueChanges.subscribe((pass: string) => {
      const repeatPass = this.registerForm.get('repeatPassword').value;
      if (pass !== repeatPass) {
        this.registerForm.setErrors({ notSamePass: true });
        this.registerForm.get('repeatPassword').setErrors({ notSamePass: true });
      } else {
        this.registerForm.setErrors({ notSamePass: false });
        this.registerForm.get('repeatPassword').setErrors(null);
      };
      console.log('CONSOLE!', this.registerForm.errors);
    });
  }

  onSubmit() {
    const self = this;
    const values = this.loginForm.value;
    console.log('values!', values);

    this.authService.login(values.email, values.password)?.subscribe({
      next(res) {
        console.log('response!', res);
        if (res?.token?.token) {
          self.dialogsManager.openInfoMessageDialog("Успешно!")
          self.authService.accessToken = res.token.token;
          self.stateService.currentUser$.next(res.user);
          self.router.navigateByUrl('/dashboard')
        }
      },
      error(err) {
        if(err.error.message == "UNCORRECT CREDENTIALS") {
          self.dialogsManager.openInfoMessageDialog('Email или пароль неверные!')
        };
      }
    });

    // this.server.getUsers().subscribe(data => {
    //   console.log('CONSOLE!',data);
    // })
  }

  register() {
    this.isRegistration = true;
  }

  login() {
    console.log('login!',);
    this.isRegistration = false;
    console.log('CONSOLE!',this.isRegistration);
  }

  registerUser() {
    const self = this;
    const values = this.registerForm.value;
    console.log('CONSOLE!', values);

    let dto: createUserDto = {
      password: values.password,
      email: values.email,
      nickname: values.nickname,
      phoneNumber: values.phoneNumber,
      isDriver: values.isDriver,
      phoneNumberSecond: values.phoneNumberSecond,
      firstName: values.firstName,
      lastName: values.lastName
    };

    this.authService.register(dto).subscribe({
      next(res) {
        console.log('CONSOLE!', res);
        const dialog = self.dialogsManager.openSetUserToTelegramDialog(res);
        dialog.afterClosed().subscribe(res => {
          console.log('afterClosed!',res);
          self.isRegistration = false;
          const dialog2 = self.dialogsManager.openInfoMessageDialog("Регистрация прошла успешно, авторизируйтесь!");
        })
      },
      error(err) {
        console.log('err!', err);
        if(err?.error?.message == "Email Already Used") {
          self.dialogsManager.openInfoMessageDialog('Email уже используется!')
        }
      },
    })
  }

  getNotSamePass(): boolean {
    if (this.registerForm.get('repeatPassword').errors) {
      return this.registerForm.get('repeatPassword').errors['notSamePass'];
    };
    return false;
  }
}
