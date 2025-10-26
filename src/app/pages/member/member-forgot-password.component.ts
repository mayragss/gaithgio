import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-member-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-forgot-password.component.html',
  styleUrls: ['./member-forgot-password.component.scss']
})
export class MemberForgotPasswordComponent implements OnInit {
  email: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  newPassword: string = '';

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
    if (!this.email) {
      this.errorMessage = 'Por favor, insira seu email.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.newPassword = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.newPassword) {
          this.newPassword = response.newPassword;
          this.successMessage = 'Nova senha gerada com sucesso!';
        } else {
          this.errorMessage = 'Erro ao gerar nova senha. Tente novamente.';
        }
      },
      error: (error: any) => {
        console.error('Forgot password error:', error);
        this.isLoading = false;
        // Capturar a mensagem de erro específica da API
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Erro ao recuperar senha. Tente novamente.';
        }
      }
    });
  }

  copyPassword(): void {
    navigator.clipboard.writeText(this.newPassword).then(() => {
      // Opcional: mostrar feedback visual de que foi copiado
      console.log('Senha copiada para a área de transferência');
    }).catch(err => {
      console.error('Erro ao copiar senha:', err);
    });
  }
}
