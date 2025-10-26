import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2 class="cinzel">Gaithgio</h2>
          <p class="montserrat">Entre na sua conta</p>
        </div>
        
        <form #loginForm="ngForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label montserrat">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              class="form-control"
              [(ngModel)]="credentials.email"
              required
              email
              #email="ngModel"
              [class.is-invalid]="email.invalid && email.touched"
              placeholder="seu@email.com"
            >
            <div class="invalid-feedback" *ngIf="email.invalid && email.touched">
              Email é obrigatório e deve ser válido.
            </div>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label montserrat">Senha</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              class="form-control"
              [(ngModel)]="credentials.password"
              required
              minlength="6"
              #password="ngModel"
              [class.is-invalid]="password.invalid && password.touched"
              placeholder="Sua senha"
            >
            <div class="invalid-feedback" *ngIf="password.invalid && password.touched">
              Senha é obrigatória e deve ter pelo menos 6 caracteres.
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary montserrat"
              [disabled]="loginForm.invalid || loading"
            >
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </div>
          
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>
        
        <div class="login-footer">
          <p class="montserrat"><a href="#" class="link">Criar conta</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
      animation: slideUp 0.6s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .login-header h2 {
      font-size: 2.5rem;
      color: #624725;
      margin-bottom: 8px;
    }
    
    .login-header p {
      color: #666;
      font-size: 1rem;
    }
    
    .login-form {
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    
    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .form-control.is-invalid {
      border-color: #dc3545;
    }
    
    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 4px;
    }
    
    .form-actions {
      margin-top: 30px;
    }
    
    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 0.875rem;
      text-align: center;
    }
    
    .login-footer {
      text-align: center;
      margin-top: 20px;
    }
    
    .login-footer p {
      color: #666;
      font-size: 0.9rem;
    }
    
    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    
    .link:hover {
      text-decoration: underline;
    }
    
    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loading) return;
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.loginWithCredentials(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Erro ao fazer login. Tente novamente.';
      }
    });
  }
}