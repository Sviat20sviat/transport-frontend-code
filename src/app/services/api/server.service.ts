import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private _serverIP = 'http://176.124.219.232:5000';
  constructor(
    private http: HttpClient
  ) { }

  getUsers(): Observable<any> {
    return this.http.get(`${this._serverIP}/users`);

  }

  get serverAddress() {
    return this._serverIP;
  }
}
