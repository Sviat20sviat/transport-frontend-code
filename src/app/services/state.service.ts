import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  currentUser$: BehaviorSubject<any> = new BehaviorSubject(null);


  constructor() { }

  updateCurrentUser(user: any) {
    this.currentUser$.next(user);
  }
}
