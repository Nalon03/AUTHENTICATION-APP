import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/services/authService'; // Ensure the correct path
import { RegisterInput } from '@app/interface/user.interface'; 
import { Router, RouterLink, RouterModule } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  registrationError: string | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        // Validators.required,
        // Validators.minLength(8),
        // Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  passwordsMatch(): boolean {
    return this.registerForm.get('password')?.value === this.registerForm.get('confirmPassword')?.value;
  }

  onSubmit() {
    this.registrationError = null; 
    if (this.registerForm.valid) {
      this.isLoading = true; 
      const formValue = this.registerForm.value;

      const registerInput: RegisterInput = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        password: formValue.password
      };

      this.authService.register(registerInput).subscribe({
        next: (response) => {
          if (response.success) {
            this.registerForm.reset(); 
            this.router.navigate(['auth/login']);          } else {
            this.registrationError = response.message || 'Registration failed. Please try again.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.registrationError = error.message || 'An unexpected error occurred.';
          this.isLoading = false;
        }
      });
    }
  }
}
