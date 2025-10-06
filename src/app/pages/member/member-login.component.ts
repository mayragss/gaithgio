import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-member-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-login.component.html',
  styleUrls: ['./member-login.component.scss']
})
export class MemberLoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  isLoginMode: boolean = true;

  // Registration fields
  firstName: string = '';
  lastName: string = '';
  confirmPassword: string = '';
  phone: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se já está logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/member/dashboard']);
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.clearForm();
  }

  clearForm(): void {
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.confirmPassword = '';
    this.phone = '';
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/member/dashboard']);
        } else {
          this.errorMessage = 'Email ou senha incorretos.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  register(): void {
    if (!this.validateRegistration()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone
    };

    this.authService.register(userData).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/member/dashboard']);
        } else {
          this.errorMessage = 'Erro ao criar conta. Tente novamente.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao criar conta. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  validateRegistration(): boolean {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword || !this.phone) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return false;
    }

    return true;
  }
}
