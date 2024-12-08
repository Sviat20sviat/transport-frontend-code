import { Directive, EventEmitter, forwardRef, Output, Provider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive()
export class FormControlDirective implements ControlValueAccessor {
  @Output() modelChange = new EventEmitter();
  model: any;
  isDisabled: boolean;
  onChange: Function = () => {};
  onTouched: Function = () => {};

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    this.model = value;
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }

  protected emitChanges() {
    this.onChange(this.model);
    this.onTouched();
    this.modelChange.emit(this.model);
  }
}

export function getValueAccessor(componentClass): Provider {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => componentClass),
    multi: true
  };
}
