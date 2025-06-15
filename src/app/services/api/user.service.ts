import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRolesEnum } from './roles.service';

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

  updateUser(data: updateUserDto) {
    return this.http.post(this.server.serverAddress + '/users/update', data);
  }

  createUser(createUserDto: createUserDto) {
    return this.http.post(this.server.serverAddress + '/users', createUserDto);
  }

  getUserById(userId: string) {
    return this.http.post(this.server.serverAddress + '/users/getUserById', {userId});
  }

  getFilteredUsers(roleId?: UserRolesEnum, status?: string) {
    return this.http.post(this.server.serverAddress + '/users/getFiltered', {roleId, status});
  }

  setUserBalance(userId: string, balance: number) {
    return this.http.post(this.server.serverAddress + '/users/setBalance', {userId, balance});
  }

  setUserFavoriteAddress(userId: string, addresses: string[]) {
    return this.http.post(this.server.serverAddress + '/users/setAddresses', {userId, addresses});
  }

  getUsersBySearch(value) {
    console.log('getUsersBySearch value',value);
    if(value) {
      return this.http.post(this.server.serverAddress + '/users/searchAll', {value});
    };
    return this.getFilteredUsers();
  }

  blockUser(userId: string) {
    return this.http.post(this.server.serverAddress + '/users/ban', {userId, banReason: "BAN"});
  }

  unblockUser(userId) {
    return this.http.post(this.server.serverAddress + '/users/unban', {userId});
  }

  changePassword(data:{userId: number, password: string}) {
    return this.http.post(this.server.serverAddress + '/users/changePassword', data);
  }
}

export interface createUserDto {
  email: string,
  password: string,
  nickname: string,
  phoneNumber: string,
  phoneNumberSecond?: string,
  isDriver: boolean,
  firstName?: string,
  lastName?: string

  roles?: number[];

  inn?: string;
  kpp?: string;
  ogrn?: string;
  ocpo?: string;
  bic?: string;
  bankAccount?: string;
  userBankAccount?: string;
  registrationAddress?: string;
  realAddress?: string;
}

export interface updateUserDto {
  id: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  phoneNumberSecond?: string;
  firstName?: string;
  lastName?: string;

  roles?: number[];

  inn?: string;
  kpp?: string;
  ogrn?: string;
  ocpo?: string;
  bic?: string;
  bankAccount?: string;
  userBankAccount?: string;
  registrationAddress?: string;
  realAddress?: string;
}