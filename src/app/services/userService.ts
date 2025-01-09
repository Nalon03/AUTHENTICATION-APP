import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import {
  ApiResponse,
  Roles,
  User,
  UserRole,
} from '@app/interface/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`);
  }

  updateUserRoles(
    userId: string,
    roles: UserRole[]
  ): Observable<ApiResponse<User>> {
    const body = {
      userId,
      newRoles: roles,
    };

    return this.http
      .put<ApiResponse<User>>(`${this.apiUrl}/admin/update/user/role`, body)
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Failed to update user roles'));
        })
      );
  }

  getRoles(): Observable<ApiResponse<Roles[]>> {
    return this.http.get<ApiResponse<Roles[]>>(
      `${this.apiUrl}/admin/all/roles`
    );
  }

  deleteUser(userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/admin/delete/user/${userId}`
    );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/user/profile`);
  }

  updateProfile(userData: User): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/user/update/profile`,
      userData
    );
  }
}
