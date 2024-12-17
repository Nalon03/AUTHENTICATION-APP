import { Routes } from '@angular/router';
import { AuthGuard } from './guard/authGuard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: 'admin',
    loadComponent: () =>
      import(
        './features/dashboard/admin-dashboard/admin-dashboard.component'
      ).then((c) => c.AdminDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  {
    path: 'user',
    loadComponent: () =>
      import(
        './features/dashboard/user-dashboard/user-dashboard.component'
      ).then((c) => c.UserDashboardComponent),
    canActivate: [],
    data: { role: 'user' },
  },
];
