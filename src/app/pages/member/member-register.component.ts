import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-member-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-register.component.html',
  styleUrls: ['./member-register.component.scss']
})
export class MemberRegisterComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    this.register();
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
      next: (response: any) => {
        if (response.user && response.user.token) {
          this.handleSuccessfulRegistration();
        } else {
          this.errorMessage = 'Erro ao criar conta. Tente novamente.';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        // Capturar a mensagem de erro específica da API
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Erro ao criar conta. Tente novamente.';
        }
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

  private handleSuccessfulRegistration(): void {
    // Verificar se há itens de checkout salvos
    const checkoutItems = localStorage.getItem('checkout_items');
    
    if (checkoutItems) {
      // Redirecionar para o carrinho para que o checkout seja processado automaticamente
      this.router.navigate(['/cart']);
    } else {
      // Redirecionar normalmente para dashboard
      this.router.navigate(['/member/dashboard']);
    }
  }
}
