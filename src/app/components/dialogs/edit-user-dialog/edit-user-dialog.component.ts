import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '../../../services/api/roles.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/api/user.service';
import { DialogsManagerService } from '../../../services/dialogs-manager.service';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { DatepickerFieldComponent } from '../../shared/datepicker-field/datepicker-field.component';
import { SelectFieldComponent } from '../../shared/select-field/select-field.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { MatButtonModule } from '@angular/material/button';
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
      surName: this.fb.control(''),
      email: this.fb.control('', [Validators.email]),
      phoneNumber: this.fb.control('', []),
      phoneNumberSec: this.fb.control('', []),
      roles: this.fb.control([]),
    })
    this.rolesService.getAllRoles().subscribe((res) => {
      console.log('getAllRoles!',res);
      this.roles = res;
      this.user.roles?.map(r => {
        const rr = this.roles.find(rrr => rrr.id == r.id);
        if(rr) {
          r = rr
        };
        return r;
        
      })
    });
    this.form.patchValue(this.data.user);
    console.log('this.form',this.form.value);
    this.form.valueChanges.subscribe(value => {
      console.log('console',value);
    })
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
