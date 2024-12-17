import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@app/services/authService';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const userRoles = this.authService.getUserRoles();
    const isAdmin = userRoles.includes('admin');

    if (route.data['role']) {
      if (route.data['role'] === 'admin' && !isAdmin) {
        this.router.navigate(['/user']);
        return false;
      }
    }

    return true;
  }

  setUserRole(roles: string[]): void {
    localStorage.setItem('userRoles', JSON.stringify(roles));
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('userRoles');
    return roles ? JSON.parse(roles) : [];
  }
}
