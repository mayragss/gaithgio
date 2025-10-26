import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss']
})
export class MemberDashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeTab: string = 'profile';
  isLoading: boolean = false;
  successMessage: string = '';
  editForm: any = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário está logado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Verificar parâmetros de query para definir a aba ativa
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });

    // Obter dados do usuário atual
    this.currentUser = this.authService.getCurrentUser();
    
    // Sempre recarregar o perfil para garantir dados atualizados
    this.authService.refreshUserProfile().subscribe(user => {
      this.currentUser = user;
      if (!this.currentUser) {
        this.router.navigate(['/login']);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.successMessage = '';
    
    // Se estiver editando perfil, inicializar o formulário
    if (tab === 'edit-profile' && this.currentUser) {
      this.editForm = {
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        phone: this.currentUser.phone,
        dateOfBirth: this.currentUser.dateOfBirth ? this.formatDateForInput(this.currentUser.dateOfBirth) : ''
      };
    }
  }

  formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmitEditProfile(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.successMessage = '';

    const updateData = {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      email: this.editForm.email,
      phone: this.editForm.phone,
      dateOfBirth: this.editForm.dateOfBirth ? new Date(this.editForm.dateOfBirth) : null
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Perfil atualizado com sucesso!';
        
        // Atualizar o usuário atual
        if (this.currentUser) {
          this.currentUser.firstName = updateData.firstName;
          this.currentUser.lastName = updateData.lastName;
          this.currentUser.email = updateData.email;
          this.currentUser.phone = updateData.phone;
          this.currentUser.dateOfBirth = updateData.dateOfBirth || undefined;
        }
        
        // Voltar para a aba de perfil após 2 segundos
        setTimeout(() => {
          this.setActiveTab('profile');
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating profile:', error);
        // Não mostrar erro para o usuário, apenas log no console
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
