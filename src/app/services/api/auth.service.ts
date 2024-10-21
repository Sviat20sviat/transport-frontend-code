import { Inject, Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { createUserDto } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private server: ServerService,
    private http: HttpClient
  ) { 
    
  }

  get accessToken () {
    const localStorage = this.document.defaultView?.localStorage;
    const tokenRaw = localStorage?.getItem('accessToken');
    if(tokenRaw) {
      return JSON.parse(tokenRaw);  
    }
    return null;
  }

  set accessToken (token) {
    if(!token) {
      localStorage.removeItem('accessToken');
      return;
    };
    localStorage.setItem('accessToken', JSON.stringify(token));
  }

  login(login: string, password: string): Observable<any> | null {
    if (!login || !password) {
      return null;
    };
    const body = {
      email: login,
      password: password
    };
    return this.http.post(this.server.serverAddress + '/auth/login', body);
  }

  logout() {
    localStorage.removeItem('accessToken');
  }

  register(dto: createUserDto) {
    return this.http.post(this.server.serverAddress + '/auth/register', dto);
  }
}
  