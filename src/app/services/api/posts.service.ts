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

  createPost(data: any, user) {
    console.log('createPost!',data,user);
    return this.http.post(this.server.serverAddress + '/posts', {title: data?.title, content: data?.content, addressFrom: data?.addressFrom, addressTo: data?.addressTo, userId: user.id});
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
}
