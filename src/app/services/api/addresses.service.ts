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

  getFilteredAddress(data: AddressFilterData) {
    return this.http.post(this.server.serverAddress + '/addresses' + '/getFiltered', data);
  }

  deleteAddress(id) {
    return this.http.post(this.server.serverAddress + '/addresses' + '/delete', {id}); 
  }

  updateAddress(id, data) {
    return this.http.post(this.server.serverAddress + '/addresses' + '/update' + `/${id}`, data); 
  }

}

export interface AddressFilterData {
  organization?: string;
  district?: string;
  name?: string;
  address?: string;
  phone?: string;
  addressStatusId?: number;
  addressType?: number;
  location?: string;
  createdAt?: {
    fromTime: number;
    toTime: number;
  };
}