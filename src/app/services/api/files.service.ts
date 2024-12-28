import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(
    private server: ServerService,
    private http: HttpClient
  ) { }

  uploadPhoto(file): Observable<any> {
    return this.http.post<any>(`${this.server.serverAddress}/files/upload`, file);
  }
}
