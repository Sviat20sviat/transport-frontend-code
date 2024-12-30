import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { StateService } from './services/state.service';
import { UserService } from './services/api/user.service';
import { AuthService } from './services/api/auth.service';
import { DialogsManagerService } from './services/dialogs-manager.service';
import * as moment from 'moment';
import 'moment/locale/ru';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'transport-frontend';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private stateService: StateService,
    private userService: UserService,
    private authService: AuthService,
    private dialogsManager: DialogsManagerService,
    private sw: SwUpdate
  ) {
    const localStorage = this.document.defaultView?.localStorage;
    const jwt_token = localStorage?.getItem('accessToken');
    if (jwt_token) {
      console.log('USER ASSIGNED');
      const user = jwtDecode(jwt_token);
      if (user) {
        this.userService.getUserById((user as any)?.id).subscribe({
          next: (value: any) => {
            if (value?.id) {
              this.stateService.currentUser$.next(value);
            } else {
              dialogsManager.openInfoMessageDialog(
                'Сессия истелка, пожалуйста авторизируйтесь заново!'
              );
              authService.logout();
            }
          },
          error: (err) => {
            dialogsManager.openInfoMessageDialog(
              'Сессия истелка, пожалуйста авторизируйтесь заново!'
            );
            authService.logout();
          },
        });
      }
      console.log('user!', user);
    }
    moment.locale('ru');
    console.log(moment.locale()); // fr

    if (this.sw.isEnabled) {
      // Проверяем обновления каждые 50 секунд
      setInterval(() => {
        this.sw.checkForUpdate();
      }, 50000);

      // Обрабатываем событие готовности новой версии
      this.sw.versionUpdates
        .pipe(
          filter(
            (event): event is VersionReadyEvent =>
              event.type === 'VERSION_READY'
          )
        )
        .subscribe((event) => {
          console.log('New version available');
          this.promptUserForUpdate();
        });
    }
  }
  private promptUserForUpdate(): void {
    if (confirm('New version available. Would you like to update?')) {
      this.sw.activateUpdate().then(() => {
        document.location.reload();
      });
    }
  }
}
