// src/app/features/auth/login/login.component.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);
  
  // Comptes de test à afficher
  readonly testAccounts = [
    { email: 'admin@webbuilder.com', password: 'password123', role: 'Admin' },
    { email: 'user@webbuilder.com', password: 'password123', role: 'User' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private logger: LoggerService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get isLoading() {
    return this.authService.isLoading;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.errorMessage.set(null);
    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.logger.info('Login attempt', credentials.email);

    this.authService.login(credentials).subscribe({
      next: () => {
        this.logger.info('Login successful');
        this.notificationService.success('Connexion réussie');
        
        // Récupérer l'URL de retour ou rediriger vers dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.logger.error('Login failed', error);
        this.errorMessage.set('Email ou mot de passe incorrect');
        this.notificationService.error('Échec de la connexion. Veuillez vérifier vos informations.');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  fillTestAccount(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper methods pour les erreurs
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères`;
    }
    
    return '';
  }
}