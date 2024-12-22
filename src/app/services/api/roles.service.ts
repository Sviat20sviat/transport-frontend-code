import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private server: ServerService,
    private http: HttpClient
  ) { }

  getAllRoles(): Observable<any> {
    return this.http.get(this.server.serverAddress + '/roles');
  }

  // deleteRole(role): Observable<any> {
  //   console.log('deleteUser!',role);
  //   return this.http.post(this.server.serverAddress + '/users/delete', {id: role.id});
  // }
}

export enum UserRolesEnum {
  Admin = 1,
  User = 2,
  Driver = 3,
  Operator = 4
}