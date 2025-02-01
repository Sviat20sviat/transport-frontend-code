import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Host, Injector, Input, OnInit, Optional, Output, SkipSelf } from '@angular/core';
import { FormControlDirective, getValueAccessor } from '../../../directives/form-directive';
import { FormBuilder, FormControl, FormsModule, NG_VALIDATORS, NgControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InputFieldComponent } from '../input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { debounce, debounceTime, timer } from 'rxjs';

@Component({
    selector: 'select-field',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        InputFieldComponent,
        MatInputModule, MatIconModule,
    ],
    templateUrl: './select-field.component.html',
    styleUrl: './select-field.component.scss',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: SelectFieldComponent,
            multi: true
        },
        getValueAccessor(SelectFieldComponent)
    ]
})
export class SelectFieldComponent extends FormControlDirective implements OnInit, AfterViewInit {
  @Input() label;
  @Input() valueKey: string = "id";
  @Input() nameKey: string = "name";
  @Input() disabled;
  @Input() options: any[];
  @Input() isDeselectEnabled = false;
  @Input() isMultiple = false;
  @Input() notRequired;
  @Input() isFilterComponent = true;
  @Output() selectedValueChanged = new EventEmitter<any>();
  formControl: UntypedFormControl;
  copyOptions;
  selectedValues;
  isSelectionChanged = false;
  isRequired = false;
  filterField: FormControl;

  constructor(
    @Optional() @Host() @SkipSelf()
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    super();
    this.filterField = this.fb.control('');
    this.filterField.valueChanges.pipe(debounceTime(500)).subscribe(value => {
      if (value) {
        this.options = this.copyOptions.filter(option => option[this.nameKey].toLowerCase().includes(value.toLowerCase()));
        if(!this.options?.length && this.formControl?.value) {
          console.log('this.formControl',this.formControl?.value);
          const selectedOption = this.copyOptions.find(option => option.id == this.formControl?.value);
          if(selectedOption) {
            this.options.push(selectedOption);
          };
        };
        if(!this.options?.length && !this.formControl?.value) {
          timer(5000).subscribe(() => {
            this.options = [...this.copyOptions];
            this.filterField.reset();
          });
        };
      } else {
        this.options = this.copyOptions;
      };
    });
  }

  ngAfterViewInit(): void {
    const ngControl: NgControl = this.injector.get(NgControl, null);
    console.log('ngControl',ngControl);
    if (ngControl) {
      this.formControl = ngControl.control as UntypedFormControl;
      if (this.disabled) {
        this.formControl.disable()
      };
      this.changeDetectorRef.detectChanges();
    };
    if(Array.isArray(this.options)) {
      this.copyOptions = [...this.options];
    };

    setTimeout(() => {
      if (ngControl) {
        this.formControl = ngControl.control as UntypedFormControl;
        if (this.disabled) {
          this.formControl.disable()
        };
        this.changeDetectorRef.detectChanges();
      };
      if(Array.isArray(this.options)) {
        this.copyOptions = [...this.options];
      };
    }, 1000);
  }

  ngOnInit(): void {

  }

  selectionChange($event: MatSelectChange, id?) {
    this.selectedValues = $event.value;
    this.model = $event.value;
    this.emitChanges();
    if ($event.value !== undefined) {
      this.isSelectionChanged = true;
      this.selectedValueChanged.emit($event.value);
    }
  }

  optionClick(id) {
    if (this.isDeselectEnabled) {
      if (this.isSelectionChanged) {
        this.isSelectionChanged = false;
        return;
      }
      if (this.model === id) {
        this.selectionChange({ value: null, source: null });
      }
    }
  }

  isSelected(id) {
    if (this.isMultiple) {
      return (this.model) ? this.model?.find(o => o == id) : null;
    } else {
      return (this.model !== null && this.model !== undefined) ? this.model === id : null;
    }
  }

  validate(control: UntypedFormControl) {
    if (control.disabled || control.validator) {
      this.formControl = control;
      const validation = control.validator(new UntypedFormControl())
      this.isRequired = validation !== null && validation['required'] === true;
    }

    return false;
  }

  isRequiredControl() {
    if (this.formControl && (this.formControl.disabled || this.formControl.validator)) {
      if (this.notRequired) {
        return false;
      }
      const validation = this.formControl.validator(new UntypedFormControl());
      return validation !== null && validation['required'] === true;
    }
    return false;
  }

  onFilter(value) {
    console.log('value',value);
  }
}
