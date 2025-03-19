import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {
  phoneMask = /^\+79\d{9}$/;
  constructor() { }

  phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
    const phonePattern = /^\+79\d{9}$/; // Регулярное выражение для формата +79xxxxxxxxx
    if (control.value && !phonePattern.test(control.value)) {
      return { invalidPhoneNumberFormat: true }; // Возвращаем ошибку, если формат неверен
    }
    return null; // Нет ошибки, если формат верен или поле пустое
  }

}
