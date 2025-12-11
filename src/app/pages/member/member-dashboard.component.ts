import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { FooterComponent } from '../../components/footer/footer.component';
import { OrderService, Order } from '../../services/order.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { translations } from '../../translations/translations';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, NavbarComponent, TranslatePipe],
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss']
})
export class MemberDashboardComponent implements OnInit {
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Verificar se o usuário está logado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

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
    
    // Se for adicionar endereço, resetar o formulário apenas se não estiver editando
    if (tab === 'add-address' && !this.editingAddressId) {
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
        const currentLang = this.languageService.currentLanguage();
        this.successMessage = translations['dashboard.editProfile.success'][currentLang];
        
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
    const currentLang = this.languageService.currentLanguage();
    const statusKey = status.toLowerCase();
    const translationKey = `dashboard.orders.status.${statusKey}` as keyof typeof translations;
    
    if (translations[translationKey]) {
      return translations[translationKey][currentLang];
    }
    
    return status;
  }

  formatOrderDate(dateString: string): string {
    const currentLang = this.languageService.currentLanguage();
    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const monthKey = monthKeys[monthIndex];
    const month = translations[`dashboard.months.${monthKey}` as keyof typeof translations]?.[currentLang] || monthKey;
    const year = date.getFullYear();
    
    const ofText = translations['dashboard.months.of'][currentLang];
    
    return currentLang === 'pt' 
      ? `${day} de ${month}, ${year}`
      : `${month} ${day}, ${year}`;
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
    const currentLang = this.languageService.currentLanguage();
    const totalItems = this.getTotalItems(order);
    const itemKey = totalItems === 1 ? 'dashboard.orders.item' : 'dashboard.orders.items';
    const itemText = translations[itemKey][currentLang];
    return `${totalItems} ${itemText}`;
  }

  concludeOrder(order: Order): void {
    const currentLang = this.languageService.currentLanguage();
    const t = translations;
    
    let mensagem = `${t['dashboard.whatsapp.greeting'][currentLang]}\n\n`;
    mensagem += `📦 ${t['dashboard.whatsapp.order'][currentLang]}${order.orderNumber || order.id}\n`;
    
    const date = new Date(order.createdAt);
    const dateStr = currentLang === 'pt' 
      ? date.toLocaleDateString('pt-PT')
      : date.toLocaleDateString('en-US');
    mensagem += `📅 ${t['dashboard.whatsapp.date'][currentLang]} ${dateStr}\n`;
    
    // Garantir que total seja tratado como número
    const total = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0;
    mensagem += `💰 ${t['dashboard.whatsapp.total'][currentLang]} €${total.toFixed(2)}\n\n`;
    
    // Usar OrderItems (O maiúsculo) que é como a API retorna
    const items = (order as any).OrderItems || (order as any).orderItems || (order as any).items;
    if (items && items.length > 0) {
      mensagem += `${t['dashboard.whatsapp.items'][currentLang]}\n`;
      items.forEach((item: any, index: number) => {
        // Debug: verificar estrutura do item
        console.log('Order item:', item);
        
        mensagem += `${index + 1}. `;
        
        // Verificar se o item tem productName
        if (item.productName || item.ProductName) {
          mensagem += `${item.productName || item.ProductName}`;
        } else {
          // Tentar diferentes variações do productId
          const productId = item.productId ?? item.ProductId ?? item.product_id ?? item.Product_Id ?? item.id;
          
          if (productId !== undefined && productId !== null && productId !== 'undefined') {
            mensagem += `${t['dashboard.whatsapp.productId'][currentLang]} ${productId}`;
          } else {
            // Fallback: usar apenas o número do item
            mensagem += `${t['dashboard.whatsapp.productId'][currentLang]} #${index + 1}`;
          }
        }
        
        mensagem += ` - ${t['dashboard.whatsapp.quantity'][currentLang]} ${item.quantity}`;
        
        // Garantir que unitPrice seja tratado como número
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(String(item.unitPrice || item.UnitPrice || 0)) || 0;
        mensagem += ` - ${t['dashboard.whatsapp.unitPrice'][currentLang]} €${unitPrice.toFixed(2)}`;
        
        if (item.totalPrice || item.TotalPrice) {
          const itemTotal = typeof item.totalPrice === 'number' ? item.totalPrice : 
                           typeof item.TotalPrice === 'number' ? item.TotalPrice :
                           parseFloat(String(item.totalPrice || item.TotalPrice || 0)) || 0;
          mensagem += ` - ${t['dashboard.whatsapp.itemTotal'][currentLang]} €${itemTotal.toFixed(2)}`;
        }
        
        mensagem += `\n`;
      });
    }
    
    mensagem += `\n${t['dashboard.whatsapp.confirmation'][currentLang]}`;
    
    const numero = "351934036467";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir WhatsApp em nova aba
    window.open(url, '_blank');
  }

  getAddressTypeLabel(type: string): string {
    const currentLang = this.languageService.currentLanguage();
    const translationKey = `dashboard.addresses.type.${type}` as keyof typeof translations;
    
    if (translations[translationKey]) {
      return translations[translationKey][currentLang];
    }
    
    return type;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  addNewAddress(): void {
    this.editingAddressId = null;
    this.setActiveTab('add-address');
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
          const currentLang = this.languageService.currentLanguage();
          this.successMessage = translations['dashboard.editAddress.success.update'][currentLang];
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
          const currentLang = this.languageService.currentLanguage();
          this.successMessage = translations['dashboard.editAddress.error'][currentLang];
        }
      });
    } else {
      this.authService.addAddress(addressData).subscribe({
        next: (response) => {
          this.isLoading = false;
          const currentLang = this.languageService.currentLanguage();
          this.successMessage = translations['dashboard.editAddress.success.save'][currentLang];
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
          const currentLang = this.languageService.currentLanguage();
          this.successMessage = translations['dashboard.editAddress.error'][currentLang];
        }
      });
    }
  }

  deleteAddress(address: any): void {
    const currentLang = this.languageService.currentLanguage();
    const confirmMessage = translations['dashboard.addresses.confirmDelete'][currentLang];
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';

    this.authService.deleteAddress(address.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = translations['dashboard.addresses.success.delete'][currentLang];
        // Recarregar perfil para obter endereços atualizados
        this.authService.refreshUserProfile().subscribe(user => {
          this.currentUser = user;
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao apagar endereço:', error);
        this.successMessage = translations['dashboard.addresses.error.delete'][currentLang];
      }
    });
  }
}
