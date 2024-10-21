import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { StateService } from './services/state.service';
import { UserService } from './services/api/user.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'transport-frontend';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private stateService: StateService,
    private userService: UserService
  ) {
    const localStorage = this.document.defaultView?.localStorage;
    const jwt_token = localStorage?.getItem('accessToken');
    if (jwt_token) {
      console.log('jwt_token!',jwt_token);
      const user = jwtDecode(jwt_token);
      console.log('jwtDecode!',user);
      if (user) {
        this.userService.getUserById((user as any).id).subscribe(res => {
          if(res) {
            this.stateService.currentUser$.next(res);
          };
        });
      }
      console.log('user!',user);
    }
  }
}
