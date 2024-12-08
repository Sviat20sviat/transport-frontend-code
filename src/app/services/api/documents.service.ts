import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  constructor(
    private server: ServerService,
    private http: HttpClient
  ) { }

  getAllDocuments(): Observable<any> {
    return this.http.post(this.server.serverAddress + '/documents/getFiltered', {});
  }

  getDocumentById(id): Observable<any> {
    return this.http.get(this.server.serverAddress + '/documents/getFiltered' + id);
  }

  createDocument(data: any) {
    return this.http.post(this.server.serverAddress + '/documents', data);
  }


}
