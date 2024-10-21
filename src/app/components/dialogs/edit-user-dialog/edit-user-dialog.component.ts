import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '../../../services/api/roles.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as bcrypt from "bcrypt";
import { UserService } from '../../../services/api/user.service';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
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
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.scss'
})
export class EditUserDialogComponent implements OnInit {
  toppings = new FormControl('', [Validators.required]);
  form: FormGroup;
  roles: any[] = [];
  user;
  loaderId: string = 'edit-user-dialog';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {user},
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    private rolesService: RolesService,
    private fb: FormBuilder,
    private userService: UserService,
    private dialogsManager: DialogsManagerService,
    private ngxService: NgxUiLoaderService,
    
  ) {
    this.user = data?.user;
    console.log('CONSOLE!',data);
    this.form = this.fb.group({
      nickname: this.fb.control(''),
      firstName: this.fb.control(''),
      lastName: this.fb.control(''),
      email: this.fb.control('', [Validators.email]),
      phoneNumber: this.fb.control('', []),
      roles: this.fb.control(''),

    })
    this.rolesService.getAllRoles().subscribe((res) => {
      console.log('getAllRoles!',res);
      this.roles = res;
    });
    this.form.patchValue(this.data.user);

  }

  ngOnInit(): void {
    
  }

  update() {
    this.ngxService.startLoader(this.loaderId);
    const values = this.form.value;
    let request = {
      id: this.user.id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
    };
    this.userService.updateUser(request).subscribe((res) => {
      this.ngxService.stopLoader(this.loaderId);
      console.log('CONSOLE!',res);
      if(res) {
        const dialog = this.dialogsManager.openInfoMessageDialog('Успешно!');
        dialog.afterClosed().subscribe(() => {
          this.dialogRef.close();
        })
      }
      
    })
  }
}
