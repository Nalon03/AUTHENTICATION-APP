import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  User,
  ApiResponse,
  UserRole,
  Roles,
} from '@app/interface/user.interface';
import { UserService } from '@app/services/userService';
import { AuthService } from '@app/services/authService';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent {
  users: User[] = [];
  selectedUser: User | null = null;
  availableRoles: UserRole[] = [];
  isEditingProfile = false;

  currentUser: User = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    roles: [],
  };

  constructor(private userService: UserService, private authService: AuthService) {
    this.loadUsers();
    this.loadRoles();
    this.loadCurrentUser();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.success) {
          this.users = response.data;
        }
      },
      error: (error) => console.error('Failed to load users:', error),
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (response: ApiResponse<Roles[]>) => {
        if (response.success) {
          this.availableRoles = response.data.map((role, index) => ({
            id: index + 1, 
            name: role,
          }));
        }
      },
      error: (error) => console.error('Failed to load roles:', error),
    });
  }
  

  loadCurrentUser(): void {
    this.userService.getProfile().subscribe({
      next: (response: ApiResponse<User>) => {
        if (response.success) {
          this.currentUser = response.data;
        }
      },
      error: (error) => console.error('Failed to load current user:', error),
    });
  }

  getRoleNames(roles: UserRole[]): string {
    return roles.map((role) => role.name).join(', ');
  }

  editUserRoles(user: User): void {
    this.selectedUser = { ...user };
  }

  hasRole(roleName: Roles): boolean {
    return (
      this.selectedUser?.roles.some((role) => role.name === roleName) ?? false
    );
  }

  toggleRole(roleName: Roles): void {
    if (!this.selectedUser) return;

    const roleExists = this.hasRole(roleName);

    if (roleExists) {
      this.selectedUser.roles = this.selectedUser.roles.filter(
        (role) => role.name !== roleName
      );
    } else {
      const role = this.availableRoles.find((r) => r.name === roleName);
      if (role) {
        this.selectedUser.roles.push(role);
      } else {
        console.error('Role not found:', roleName);
      }
    }
  }

  saveUserRoles(): void {
    if (this.selectedUser) {
      const roles: UserRole[] = this.selectedUser.roles
        .map((role) => {
          const matchedRole = this.availableRoles.find((r) => r.id === role.id);
          if (matchedRole) {
            return { id: role.id, name: matchedRole.name }; 
          }
          return null; 
        })
        .filter((role): role is UserRole => role !== null); 
  
      this.userService.updateUserRoles(this.selectedUser.id, roles).subscribe({
        next: (response: ApiResponse<User>) => {
          if (response.success) {
            const index = this.users.findIndex(
              (u) => u.id === this.selectedUser!.id
            );
            if (index !== -1) {
              this.users[index] = response.data;
            }
            this.selectedUser = null;
          }
        },
        error: (error) => console.error('Failed to save user roles:', error),
      });
    }
  }
  
  
  
  removeUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: (response: ApiResponse<unknown>) => {
          if (response.success) {
            this.users = this.users.filter((user) => user.id !== userId);
          }
        },
        error: (error) => console.error('Failed to delete user:', error),
      });
    }
  }

  cancelRoleEdit(): void {
    this.selectedUser = null;
  }

  editProfile(): void {
    this.isEditingProfile = true;
  }

  saveProfile(): void {
    this.userService.updateProfile(this.currentUser).subscribe({
      next: (response: ApiResponse<User>) => {
        if (response.success) {
          this.isEditingProfile = false;
          this.loadCurrentUser();
        }
      },
      error: (error) => console.error('Failed to save profile:', error),
    });
  }

  cancelProfileEdit(): void {
    this.isEditingProfile = false;
  }

  logout(): void {
    this.authService.logout();
  }
}