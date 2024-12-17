import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import {
  RegisterInput,
  ApiResponse,
  RegisterResponse,
  LoginInput,
  LoginApiResponse,
  RefreshTokens,
  TokenPayload,
  UserRole,
} from '@app/interface/user.interface';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {
    this.getAccessToken();
  }

  register(
    registerInput: RegisterInput
  ): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.baseUrl}/auth/register`,
      registerInput
    );
  }

  login(loginInput: LoginInput): Observable<LoginApiResponse> {
    return this.http
      .post<LoginApiResponse>(`${this.baseUrl}/auth/login`, loginInput)
      .pipe(
        switchMap((response) => {
          if (response.success && response.data) {
            const { accessToken, refreshToken, user } = response.data;
            if (accessToken && refreshToken) {
              this.storeTokens(accessToken, refreshToken);
              this.setUserRole(user.roles as UserRole[]);
              this.routeUserBasedOnRole();
            } else {
              return throwError(() => new Error('Invalid token structure'));
            }
          }
          return of(response);
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  refreshTokens(): Observable<RefreshTokens> {
    const refreshToken = this.getRefreshToken();
    const accessToken = this.getAccessToken();

    if (!refreshToken || !accessToken) {
      this.logout();
      return throwError(() => new Error('No tokens available'));
    }

    try {
      const decodedToken = jwtDecode<TokenPayload>(accessToken);
      return this.generateAccessToken(decodedToken.id, decodedToken.roles).pipe(
        switchMap((newAccessToken) =>
          this.generateRefreshToken(decodedToken.id).pipe(
            switchMap((newRefreshToken) => {
              this.storeTokens(newAccessToken, newRefreshToken);
              return of({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              });
            })
          )
        ),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
    } catch (error) {
      this.logout();
      return throwError(() => error);
    }
  }

  private generateAccessToken(id: string, roles: string[]): Observable<string> {
    return this.http
      .post<string>(`${this.baseUrl}/auth/generate-access-token`, { id, roles })
      .pipe(
        catchError((err) => {
          this.logout();
          return throwError(() => new Error('Failed to generate access token'));
        })
      );
  }

  private generateRefreshToken(id: string): Observable<string> {
    return this.http
      .post<string>(`${this.baseUrl}/auth/generate-refresh-token`, { id })
      .pipe(
        catchError((err) => {
          this.logout();
          return throwError(() => new Error('Failed to generate refresh token'));
        })
      );
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  setUserRole(roles: UserRole[]): void {
    if (!roles || roles.length === 0) {
      return;
    }

    localStorage.setItem('userRoles', JSON.stringify(roles));
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('userRoles');
    return roles ? JSON.parse(roles) : [];
  }

  routeUserBasedOnRole() {
    const roles = this.getUserRoles();
    if (roles && roles.length > 0) {
      if (roles.includes('admin')) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/user']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
