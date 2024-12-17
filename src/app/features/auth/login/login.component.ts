import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '@app/services/authService';
import { LoginInput, LoginApiResponse } from '@app/interface/user.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form submitted:', this.loginForm.value);

      const formValue = this.loginForm.value;
      const loginInput: LoginInput = {
        email: formValue.email,
        password: formValue.password,
      };

      this.authService.login(loginInput).subscribe({
        next: (response: LoginApiResponse) => {
          if (response.success) {
            this.authService.setUserRole(response.data.user.roles);
            this.authService.routeUserBasedOnRole();
          }
        },
        error: () => {},
      });
    }
  }
}
