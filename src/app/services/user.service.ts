import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  isUserAdmin(user): boolean {
    console.log('isUserAdmin!',user);
    if(user) {
      if(user?.roles?.some(role => role.value == 'Admin')) {
        return true;
      }
      return false;
    };
    return false;
  }

  isUserUser(user): boolean {
    if(user) {
      if(user?.roles?.some(role => role.value == 'User')) {
        return true;
      }
      return false;
    };
    return false;
  }

  isUserDriver(user): boolean {
    if(user) {
      if(user?.roles?.some(role => role.value == 'Driver')) {
        return true;
      }
      return false;
    };
    return false;
  }
}
