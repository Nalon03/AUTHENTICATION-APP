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
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private router: Router) {
    this.getAccessToken();
  }

  register(
    registerInput: RegisterInput
  ): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.apiUrl}/auth/register`,
      registerInput
    );
  }

  login(loginInput: LoginInput): Observable<LoginApiResponse> {
    return this.http
      .post<LoginApiResponse>(`${this.apiUrl}/auth/login`, loginInput)
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
        catchError((err) => throwError(() => err))
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
      .post<string>(`${this.apiUrl}/auth/generate-access-token`, { id, roles })
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to generate access token'))
        )
      );
  }

  private generateRefreshToken(id: string): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/auth/generate-refresh-token`, { id })
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to generate refresh token'))
        )
      );
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | undefined {
    return localStorage.getItem('authToken') || undefined;
  }
  

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(token?: string): boolean {
    token = token || this.getAccessToken(); 
    if (!token) return true;
  
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
  
      if (decodedToken.exp !== undefined) {
        return decodedToken.exp < currentTime;
      }
  
      return true;
    } catch {
      return true;
    }
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

  routeUserBasedOnRole(): void {
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
