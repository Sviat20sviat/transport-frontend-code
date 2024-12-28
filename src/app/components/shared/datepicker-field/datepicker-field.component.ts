import { AfterViewInit, ChangeDetectorRef, Component, Host, Injector, Input, OnInit, Optional, SkipSelf } from '@angular/core';
import { FormsModule, NG_VALIDATORS, NgControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { InputFieldComponent } from '../input-field/input-field.component';
import { FormControlDirective, getValueAccessor } from '../../../directives/form-directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';

@Component({
    selector: 'datepicker-field',
    imports: [
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule
    ],
    templateUrl: './datepicker-field.component.html',
    styleUrl: './datepicker-field.component.scss',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: DatepickerFieldComponent,
            multi: true
        },
        getValueAccessor(DatepickerFieldComponent)
    ]
})
export class DatepickerFieldComponent extends FormControlDirective implements OnInit, AfterViewInit {
  @Input() label = '';
  formControl: UntypedFormControl;
  isRequired = false;

  constructor(
    @Optional() @Host() @SkipSelf()
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    const ngControl: NgControl = this.injector.get(NgControl, null);
    if (ngControl) {
      this.formControl = ngControl.control as UntypedFormControl;
      this.changeDetectorRef.detectChanges();
    }
  }

  validate(control: UntypedFormControl) {
    if (control.disabled || control.validator) {
      this.formControl = control as UntypedFormControl;
      if (control.validator) {
        const validation = control.validator(new UntypedFormControl());
        this.isRequired = validation !== null && validation['required'] === true;
      }
      return false;
    }
    return true;
  }

  modelChanged() {
    this.emitChanges();
  }

}
