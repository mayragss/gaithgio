import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { FooterComponent } from '../../components/footer/footer.component';
import { OrderService, Order } from '../../services/order.service';

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
  addressForm: any = {
    type: 'residential',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    zip: '',
    country: 'Portugal'
  };
  editingAddressId: number | null = null;
  orders: Order[] = [];
  isLoadingOrders: boolean = false;
  showUserMenu: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário está logado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Fechar o menu do usuário ao clicar fora
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.navbar-profile') && !target.closest('.user-dropdown')) {
        this.showUserMenu = false;
      }
    });

    // Obter dados do usuário atual
    this.currentUser = this.authService.getCurrentUser();
    
    // Verificar parâmetros de query para definir a aba ativa
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      if (params['tab']) {
        this.activeTab = params['tab'];
        console.log('Aba ativa definida para:', this.activeTab);
        // Se for a aba de pedidos, carregar os pedidos
        if (params['tab'] === 'orders') {
          setTimeout(() => this.loadOrders(), 100);
        }
      }
    });
    
    // Verificar também o snapshot inicial (caso não tenha query params, mas precise verificar)
    const initialTab = this.route.snapshot.queryParams['tab'];
    if (initialTab === 'orders') {
      this.activeTab = 'orders';
      setTimeout(() => this.loadOrders(), 100);
    }
    
    // Sempre recarregar o perfil para garantir dados atualizados
    this.authService.refreshUserProfile().subscribe(user => {
      this.currentUser = user;
      if (!this.currentUser) {
        this.router.navigate(['/login']);
      }
    });
  }

  setActiveTab(tab: string): void {
    console.log('setActiveTab chamado com:', tab);
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
    
    // Se estiver na aba de pedidos, carregar os pedidos
    if (tab === 'orders') {
      console.log('Aba orders selecionada, carregando pedidos...');
      this.loadOrders();
    }
    
    // Se for adicionar endereço, resetar o formulário
    if (tab === 'add-address') {
      this.editingAddressId = null;
      this.addressForm = {
        type: 'residential',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        zip: '',
        country: 'Portugal'
      };
      this.successMessage = '';
    }
  }

  loadOrders(): void {
    console.log('loadOrders() chamado');
    this.isLoadingOrders = true;
    console.log('Chamando getMyOrders()...');
    this.orderService.getMyOrders().subscribe({
      next: (orders: Order[]) => {
        console.log('Pedidos recebidos:', orders);
        this.orders = orders;
        this.isLoadingOrders = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        console.error('URL:', error?.url);
        console.error('Status:', error?.status);
        this.isLoadingOrders = false;
        this.orders = [];
      }
    });
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

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'awaiting_treatment': 'Aguardando Tratamento',
      'processing': 'Processando',
      'shipped': 'Em trânsito',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[status.toLowerCase()] || status;
  }

  formatOrderDate(dateString: string): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month}, ${year}`;
  }

  getTotalItems(order: Order): number {
    // A API retorna OrderItems com O maiúsculo (como no JSON fornecido)
    const items = (order as any).OrderItems;
    
    if (!order || !items) {
      return 0;
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      return 0;
    }
    
    // Calcular total somando as quantidades
    const total = items.reduce((sum: number, item: any) => {
      const qty = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || 0), 10);
      return sum + qty;
    }, 0);
    
    return total;
  }

  formatItemsText(order: Order): string {
    const totalItems = this.getTotalItems(order);
    return totalItems === 1 ? '1 item' : `${totalItems} itens`;
  }

  concludeOrder(order: Order): void {
    let mensagem = `Olá! Gostaria de finalizar meu pedido da GAITHGIO.\n\n`;
    mensagem += `📦 Pedido #${order.orderNumber || order.id}\n`;
    mensagem += `📅 Data: ${new Date(order.createdAt).toLocaleDateString('pt-PT')}\n`;
    
    // Garantir que total seja tratado como número
    const total = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0;
    mensagem += `💰 Total: €${total.toFixed(2)}\n\n`;
    
    // Usar OrderItems (O maiúsculo) que é como a API retorna
    const items = (order as any).OrderItems;
    if (items && items.length > 0) {
      mensagem += `Itens do pedido:\n`;
      items.forEach((item: any, index: number) => {
        mensagem += `${index + 1}. `;
        
        // Verificar se o item tem productName (do tipo OrderItem do user.ts) ou precisa buscar
        if ('productName' in item && item.productName) {
          mensagem += `${item.productName}`;
        } else {
          mensagem += `Produto ID: ${item.productId}`;
        }
        
        mensagem += ` - Quantidade: ${item.quantity}`;
        
        // Garantir que unitPrice seja tratado como número
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(String(item.unitPrice)) || 0;
        mensagem += ` - Preço unitário: €${unitPrice.toFixed(2)}`;
        
        if ('totalPrice' in item && item.totalPrice) {
          const itemTotal = typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(String(item.totalPrice)) || 0;
          mensagem += ` - Total: €${itemTotal.toFixed(2)}`;
        }
        
        mensagem += `\n`;
      });
    }
    
    mensagem += `\nAguardo confirmação. Obrigado!`;
    
    const numero = "351934036467";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir WhatsApp em nova aba
    window.open(url, '_blank');
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  getAddressTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'residential': 'Residencial',
      'commercial': 'Comercial'
    };
    return types[type] || type;
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  editAddress(address: any): void {
    this.editingAddressId = address.id;
    this.addressForm = {
      type: address.type || 'residential',
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      district: address.district || address.neighborhood || '',
      city: address.city || '',
      zip: address.zip || address.zipCode || '',
      country: address.country || 'Portugal'
    };
    this.successMessage = '';
    this.setActiveTab('add-address');
  }

  saveAddress(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.isLoading = true;
    const addressData = {
      street: this.addressForm.street,
      number: this.addressForm.number,
      district: this.addressForm.district,
      city: this.addressForm.city,
      state: this.addressForm.city, // state pode ser igual a city
      zip: this.addressForm.zip,
      complement: this.addressForm.complement || '',
      type: this.addressForm.type
    };

    // Se estiver editando, fazer PUT, senão POST
    if (this.editingAddressId) {
      this.authService.updateAddress(this.editingAddressId, addressData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Endereço atualizado com sucesso!';
          this.editingAddressId = null;
          // Recarregar perfil para obter endereços atualizados
          this.authService.refreshUserProfile().subscribe(user => {
            this.currentUser = user;
            // Redirecionar para lista de endereços
            this.setActiveTab('addresses');
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erro ao atualizar endereço:', error);
          this.successMessage = 'Erro ao atualizar endereço. Tente novamente.';
        }
      });
    } else {
      this.authService.addAddress(addressData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Endereço salvo com sucesso!';
          // Recarregar perfil para obter endereços atualizados
          this.authService.refreshUserProfile().subscribe(user => {
            this.currentUser = user;
            // Redirecionar para lista de endereços
            this.setActiveTab('addresses');
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erro ao salvar endereço:', error);
          this.successMessage = 'Erro ao salvar endereço. Tente novamente.';
        }
      });
    }
  }
}
