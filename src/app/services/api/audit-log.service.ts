import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  constructor(private server: ServerService, private http: HttpClient) {}

  getFiltered(data: AuditFilterData | null) {
    return this.http.post(
      this.server.serverAddress + '/audit' + '/getFiltered',
      data
    );
  }
}

export interface AuditFilterData {
  userId?: number;
  action?: number;
  createdAt?: {
    fromTime: number;
    toTime: number;
  };
}

export enum AuditLogActions {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login'
}