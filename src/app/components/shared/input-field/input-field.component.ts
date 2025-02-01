import { AfterViewInit, ChangeDetectorRef, Component,  ElementRef,  EventEmitter, Host, Injector, Input, OnInit, Optional, Output, SkipSelf, ViewChild } from '@angular/core';
import { UntypedFormControl, NgControl, NG_VALIDATORS, ReactiveFormsModule } from '@angular/forms';
import { FormControlDirective, getValueAccessor } from '../../../directives/form-directive';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { BehaviorSubject, Observable, map, startWith } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
    selector: 'custom-input-field',
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        MatTooltipModule
    ],
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: InputFieldComponent,
            multi: true
        },
        getValueAccessor(InputFieldComponent)
    ],
    templateUrl: './input-field.component.html',
    styleUrl: './input-field.component.scss'
})
export class InputFieldComponent extends FormControlDirective implements OnInit, AfterViewInit {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @Input() label = 'Input';
  @Input() placeholder = '';
  @Input() isTextarea: boolean = false;
  @Input() matAutoCompleteOptions = [];
  @Input() matAutoCompleteOptionKey = 'name';
  @Input() matAutoCompleteOptionValueKey = 'address';
  @Input() isAddToFavorite: boolean = false;
  @Output() addAddressToFavorite: EventEmitter<any> = new EventEmitter<any>();
  @Input() maxLength: number;
  matAutoCompleteOptionsFiltered: any[];
  isAlreadyUsed = false;

  formControl: UntypedFormControl;
  isRequired = false;

  constructor(
    @Optional() @Host() @SkipSelf()
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();

    console.log('matAutoCompleteOptions',this.matAutoCompleteOptions);

  }

  ngOnInit(): void {


    this.onChange()
  }

  ngAfterViewInit(): void {
    const ngControl: NgControl = this.injector.get(NgControl, null);
    console.log('ngControl',ngControl);
    if (ngControl) {
      this.formControl = ngControl.control as UntypedFormControl;
      this.changeDetectorRef.detectChanges();
    };
    this.matAutoCompleteOptionsFiltered = this.matAutoCompleteOptions;

    this.formControl?.valueChanges?.subscribe((value) => {
      console.log('valueChanges',value, this.matAutoCompleteOptions);
      if(!value) {
        return;
      };
      this.isAlreadyUsed = false;
      let exist1;
      let exist2;
      if(this.matAutoCompleteOptions?.length && this.matAutoCompleteOptions[0]?.items?.length) {
        exist1 = this.matAutoCompleteOptions[0]?.items.some(i => i.name == value);
      }
      if(this.matAutoCompleteOptions?.length >=2 && this.matAutoCompleteOptions[1]?.items?.length) {
        exist2 = this.matAutoCompleteOptions[1]?.items.some(i => i.address == value);
      };
      if(exist1 || exist2) {
        this.isAlreadyUsed = true;
      }
    });
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

  // private _filterOptions(value: string): any[] {
  //   console.log('_filterOptions',value);
  //   const filterValue = value.toLowerCase();

  //   return this.matAutoCompleteOptions.filter(option => option.name.toLowerCase().includes(filterValue));
  // }

  filter(): void {
    const filterValue = this.input?.nativeElement?.value?.toLowerCase();
    this.matAutoCompleteOptionsFiltered = this.matAutoCompleteOptions.filter(o => o.name.toLowerCase().includes(filterValue));
  }

  addAddressToFavorites() {
    const address = this.formControl.value;
    console.log('address',address);
    if(!address) {
      return;
    };

    this.addAddressToFavorite.emit(address);
  }

  usedAddress() {

  }

}
