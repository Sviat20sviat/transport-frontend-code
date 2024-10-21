import { Router, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { inject } from '@angular/core';
import { AuthService } from './services/api/auth.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    title: 'Login',
    path: 'login',
    component: LoginComponent,
  },
  {
    title: 'Dashboard',
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [
      () => {
        const router: Router = inject(Router);
        const auth: AuthService = inject(AuthService);

        if (auth.accessToken) {
          return true;
        }
        router.navigate(['./login']);
        return false;
      },
    ],
  },
];
