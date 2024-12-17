import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, User, UserRole } from '@app/interface/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse<User[]>> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No access token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`, {
      headers,
    });
  }

  updateUserRoles(
    userId: string,
    roles: UserRole[]
  ): Observable<ApiResponse<User>> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No access token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const body = { userId, newRoles: roles };

    console.log('Updating user roles:', { userId, newRoles: roles });

    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/admin/update/user/role`,
      body,
      {
        headers,
      }
    );
  }

  deleteUser(userId: string): Observable<ApiResponse<any>> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No access token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/admin/delete/user/${userId}`,
      {
        headers,
      }
    );
  }

  getProfile(): Observable<ApiResponse<User>> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No access token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/user/profile`, {
      headers,
    });
  }

  updateProfile(userData: User): Observable<ApiResponse<User>> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No access token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/user/update/profile`,
      userData,
      {
        headers,
      }
    );
  }
}
