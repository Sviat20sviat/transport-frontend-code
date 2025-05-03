import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ServerService } from '../server.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private webSocket: Socket;
  constructor(
    private _server: ServerService
  ) {
    this.webSocket = io(_server.serverAddress);
  }

  emit(event: string, data: any) {
    this.webSocket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.webSocket.on(event, (data) => {
        observer.next(data);
      });

      // Handle cleanup
      return () => {
        this.webSocket.off(event);
      };
    });
  }
}

export enum EventNameEnum {
  OnPostCreate = 'OnPostCreate',
  OnPostUpdate = 'OnPostUpdate',
  OnPostDelete = 'OnPostDelete',
  OnDocumentCreate = 'OnDocumentCreate',
  OnDocumentUpdate = 'OnDocumentUpdate',
  OnDocumentDelete = 'OnDocumentDelete',
  OnUserCreate = 'OnUserCreate',
  OnUserUpdate = 'OnUserUpdate',
  OnUserDelete = 'OnUserDelete',
  OnUserBanned = 'OnUserBanned',

  OnPriceListUpdate = 'OnPriceListUpdate'
}