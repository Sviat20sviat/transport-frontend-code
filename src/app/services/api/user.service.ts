import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private server: ServerService,
    private http: HttpClient
  ) { }

  getUsers(): Observable<any> {
    return this.http.get(this.server.serverAddress + '/users');
  }

  deleteUser(user): Observable<any> {
    console.log('deleteUser!',user);
    return this.http.post(this.server.serverAddress + '/users/delete', {id: user.id});
  }

  updateUser(user) {
    return this.http.post(this.server.serverAddress + '/users/update', user);
  }

  createUser(createUserDto: createUserDto) {
    return this.http.post(this.server.serverAddress + '/users', createUserDto);
  }
  getUserById(userId: string) {
    return this.http.post(this.server.serverAddress + '/users/getUserById', {userId});
  }
}

export interface createUserDto {
  email: string,
  password: string,
  nickname: string,
  phoneNumber: string,
  isDriver: boolean
}