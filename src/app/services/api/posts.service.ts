import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(
    private server: ServerService,
    private http: HttpClient
  ) { }

  getPosts(): Observable<any> {
    return this.http.get(this.server.serverAddress + '/posts');
  }

  getAllCheckedPosts(): Observable<any> {
    return this.http.get(this.server.serverAddress + '/posts/getAllChecked');
  }

  deletePost(postId: string): Observable<any> {
    return this.http.post(this.server.serverAddress + '/posts/delete', {id: postId});
  }

  createPost(data: CreatePostData, user) {
    console.log('createPost!',data,user);
    data.userId = user?.id;
    if(!data?.customerId) {
      data.customerId = user?.id;
    };
    return this.http.post(this.server.serverAddress + '/posts', data);
  }

  setStatus(data) {
    return this.http.post(this.server.serverAddress + '/posts/setStatus', data);
  }

  getPost(id) {
    return this.http.post(this.server.serverAddress + '/posts/getOne', {id});
  }

  updatePost(data) {
    return this.http.post(this.server.serverAddress + '/posts/update', data);
  }

  getFilteredPosts(filter: PostFilter): Observable<any> {
    return this.http.post(this.server.serverAddress + '/posts/getFilteredPosts', filter);
  }

  searchPosts(searchText: string): Observable<any> {
    return this.http.post(this.server.serverAddress + '/posts/search', {value: searchText});
  }
}
export interface CreatePostData {
  title: string;
  content: string;

  addressFrom: string;
  addressTo: string;

  addressToId: number;
  addressFromId: number;

  postNaming: string;
  warehouse: string;
  cargoStatus: number;
  deliveryDate: Date | null;
  deliveryType: string;
  trackCode: string;
  orderNumber: string;
  cargoPickupComment: string;
  cargoCharacter: string;
  cargoCharacterComment: string;
  cargoCharacterSize: string;
  cargoCharacterSizeAll: number;
  cargoCharacterWeight: string;
  isFragile: boolean;
  additionalContactFullName: string;
  additionalContactPhone: string;
  additionalContactPhoneSec: string;
  additionalComment: string;
  additionalRecipientFullName: string;
  additionalRecipientPhone: string;
  additionalRecipientComment: string;
  additionalFloor: string;
  additionalFriagle: boolean;
  userId: number | null;
  customerId: number;
  price: number;
  commission: number;
  summ: number;
  paid: number;
  status: string;
  imageUrl: string;

  height: number;
  width: number;
  depth: number;

  warehouseId: number | null;
}

export interface PostFilter {
  userId?: number, 
  customerId?: number, 
  driverId?: number,  
  status?: number, 
  warehouseId?: number, 
  cargoStatus?: number, 
  onlyForWarehouse?:boolean,
  arrivedAtWarehouseRange?: {
    fromTime: number,
    toTime: number
  }
}