import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/api/auth.service';

// export const httpInterceptor: HttpInterceptorFn = (req, next) => {
//   const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG1haWxMLmNvbW0iLCJpZCI6Nywicm9sZXMiOlt7ImlkIjoxLCJ2YWx1ZSI6IkFkbWluIiwiZGVzY3JpcHRpb24iOiJzb21lIGRlc2NyaXB0aW9uIiwiY3JlYXRlZEF0IjoiMjAyNC0wOC0yNlQxNDoxNDowMi42NzZaIiwidXBkYXRlZEF0IjoiMjAyNC0wOC0yNlQxNDoxNDowMi42NzZaIiwiVXNlclJvbGVzIjp7ImlkIjo1LCJyb2xlSWQiOjEsInVzZXJJZCI6N319XSwiaWF0IjoxNzI1NzA0ODIxLCJleHAiOjE3MjYzMDk2MjF9.dytmmO4h4AAiY3COqUc6c8t3jSk3uIeHsvrfDIaIxEI'; const modifiedReq = req.clone({
//     headers: req.headers.set('Authorization', `Bearer ${userToken}`),
//   });
//   return next(modifiedReq);
// };
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log('request!',request);
    let token = this.authService.accessToken;
    // console.log('has-token!');
    
    const auth  = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next.handle(auth);
  }
 }