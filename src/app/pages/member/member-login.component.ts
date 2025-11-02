import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-member-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-login.component.html',
  styleUrls: ['./member-login.component.scss']
})
export class MemberLoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

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

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSubmit(): void {
    this.login();
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.handleSuccessfulLogin();
        } else {
          this.errorMessage = 'Email ou senha incorretos.';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Login error:', error);
        // Capturar a mensagem de erro específica da API
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        }
        this.isLoading = false;
      }
    });
  }

  private handleSuccessfulLogin(): void {
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
