import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiResponse, User } from '@app/interface/user.interface';
import { AuthService } from '@app/services/authService';
import { UserService } from '@app/services/userService';

@Component({
  selector: 'app-user-dashboard',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  users: User[] = [];
  userRoles: string[] = [];

  constructor(private userService: UserService, private authService: AuthService) {
    this.loadUsers();
    this.userRoles = this.authService.getUserRoles();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.success) {
          this.users = response.data;
        }
      },
      error: (error) => {
      },
    });
  }

  getRoleNames(roles: any[]): string {
    return roles.map(role => role.name).join(', ');
  }

  editUserRoles(userId: string) {
  }

  removeUser(userId: string) {
  }
}
