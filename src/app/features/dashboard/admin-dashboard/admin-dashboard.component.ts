import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User, ApiResponse, UserRole } from '@app/interface/user.interface'; 
import { UserService } from '@app/services/userService';

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
  availableRoles: UserRole[] = ['admin', 'user'];

  currentUser: User = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    roles: []
  }; 
  isEditingProfile = false;

  constructor(private userService: UserService) {
    this.loadUsers();
    this.loadCurrentUser();
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

  loadCurrentUser() {
    this.userService.getProfile().subscribe({
      next: (response: ApiResponse<User>) => {
        if (response.success) {
          this.currentUser = response.data;
        }
      },
      error: (error) => {
      },
    });
  }

  getRoleNames(roles: any[]): string {
    return roles.map(role => role.name).join(', ');
  }

  editUserRoles(user: User) {
    this.selectedUser = { ...user }; 
  }

  hasRole(roleName: UserRole): boolean {
    if (!this.selectedUser || !this.selectedUser.roles) return false;
    return this.selectedUser.roles.includes(roleName);
  }

  toggleRole(roleName: UserRole) {
    if (!this.selectedUser) return;
    this.selectedUser.roles = this.selectedUser.roles || [];
    
    const roleExists = this.hasRole(roleName);
    
    if (roleExists) {
      this.selectedUser.roles = this.selectedUser.roles.filter(role => role !== roleName);
    } else {
      this.selectedUser.roles.push(roleName);
    }
  }

  saveUserRoles() {
    if (this.selectedUser) {
      const selectedRoles = this.selectedUser.roles;

      this.userService.updateUserRoles(this.selectedUser.id, selectedRoles).subscribe({
          next: (response: ApiResponse<User>) => {
              if (response.success) {
                  const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
                  if (index !== -1) {
                      this.users[index] = response.data;
                  }
                  this.selectedUser = null;
              }
          },
          error: (error) => {
          }
      });
    }
  }

  removeUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.users = this.users.filter(user => user.id !== userId);
          }
        },
        error: (error) => {
        }
      });
    }
  }

  cancelRoleEdit() {
    this.selectedUser = null;
  }

  editProfile() {
    this.isEditingProfile = true;
  }

  saveProfile() {
    this.userService.updateProfile(this.currentUser).subscribe(response => {
      if (response.success) {
        this.isEditingProfile = false;
        this.loadCurrentUser();
      }
    }, error => {
    });
  }

  cancelProfileEdit() {
    this.isEditingProfile = false;
  }
}
