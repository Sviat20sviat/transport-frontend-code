import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {

  constructor(
    private server: ServerService,
    private http: HttpClient
  ) { }

  getAddresses(): Observable<any> {
    return this.http.get(this.server.serverAddress + '/addresses' + '/all');
  }

  createAddress(data: any) {
    return this.http.post(this.server.serverAddress + '/addresses' + '/create', data);
  }

  getFilteredAddress(data: {organization?: string, name?: string, addressStatus?: string, addressType?: number}) {
    return this.http.post(this.server.serverAddress + '/addresses' + '/getFiltered', data);
  }

  deleteAddress(id) {
    return this.http.post(this.server.serverAddress + '/addresses' + '/delete', {id}); 
  }

  updateAddress(id, data) {
    return this.http.post(this.server.serverAddress + '/addresses' + '/update' + `/${id}`, data); 
  }

}
