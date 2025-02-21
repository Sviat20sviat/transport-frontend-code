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

  getAllDocuments(createdAt?): Observable<any> {
    return this.http.post(this.server.serverAddress + '/documents/getFiltered', {createdAt});
  }

  getDocumentById(id): Observable<any> {
    return this.http.get(this.server.serverAddress + '/documents/getFiltered' + id);
  }

  createDocument(data: any) {
    return this.http.post(this.server.serverAddress + '/documents', data);
  }

  deleteDocument(id) {
    return this.http.delete(this.server.serverAddress + '/documents/'+ id);
  }

  updateDocument(data, id) {
    return this.http.put(this.server.serverAddress + '/documents/' + id, data);
  }
}
