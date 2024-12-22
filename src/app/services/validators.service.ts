import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {
  phoneMask = RegExp('^((8|\\+7)[\- ]?)?(\\(?\d{3}\\)?[\- ]?)?[\\d\\- ]{7,10}$');
  constructor() { }
}
