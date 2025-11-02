import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../services/cart.service';
import { Button } from "primeng/button";
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { OrderService, CreateOrderRequest } from '../../services/order.service';
import { Router } from '@angular/router';
import { WhatsAppConfirmationComponent } from '../../components/whatsapp-confirmation/whatsapp-confirmation.component';

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [Button, FooterComponent, WhatsAppConfirmationComponent]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  showConfirmation: boolean = false;
  createdOrderNumber?: string;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    
    // Verificar se há itens de checkout salvos após login
    this.checkForCheckoutItems();
  }

  getImageMain(product: any): string {
    if (!product?.images) {
      return "images/no-image-icon-6.png";
    }

    try {
      let images: string[] = [];
      
      // Se já é um array, usa diretamente
      if (Array.isArray(product.images)) {
        images = product.images;
      } 
      // Se é string, tenta parsear
      else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            images = parsed;
          } else {
            // Se não é array após parse, pode ser uma string única
            images = [product.images];
          }
        } catch (e) {
          // Se falhar o parse, tenta usar como string única
          images = [product.images];
        }
      }
      
      if (images && images.length > 0) {
        const imageUrl = images[0];
        if (!imageUrl) {
          return "images/no-image-icon-6.png";
        }
        
        // Se a URL já começa com http, retornar como está
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
        
        // Caso contrário, construir a URL completa da API
        return `https://api-ecommerce.maygomes.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      
      return "images/no-image-icon-6.png";
    } catch (error) {
      console.error("Erro ao processar imagens:", error);
      return "images/no-image-icon-6.png";
    }
  }

  getTamanhos(prod: any): string[] {
    try {
      return prod.attributes ? JSON.parse(prod.attributes) : [];
    } catch {
      return [];
    }
  }

  loadCart() {
    const data = localStorage.getItem('cart_items');
    this.items = data ? JSON.parse(data) : [];
  }

  remove(productId: number) {
    this.items = this.items.filter(i => i.product.id !== productId);
    localStorage.setItem('cart_items', JSON.stringify(this.items));
  }

  updateQuantity(productId: number, quantity: number) {
    const item = this.items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity > 0 ? quantity : 1;
      localStorage.setItem('cart_items', JSON.stringify(this.items));
    }
  }

  clear() {
    this.items = [];
    localStorage.removeItem('cart_items');
  }

  totalPrice() {
    return this.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  }

  finalizarCompra() {
    if (this.items.length === 0) {
      return;
    }

    // Verificar se o usuário está logado
    if (!this.authService.isLoggedIn()) {
      // Salvar os itens do carrinho para depois do login
      this.saveCartForCheckout();
      // Redirecionar para login
      this.router.navigate(['/login']);
      return;
    }

    // Se estiver logado, prosseguir com o checkout
    this.proceedToCheckout();
  }

  private saveCartForCheckout() {
    // Salvar os itens do carrinho em uma chave específica para checkout
    localStorage.setItem('checkout_items', JSON.stringify(this.items));
  }

  private proceedToCheckout() {
    // Primeiro criar o pedido na API
    this.createOrder();
  }

  private createOrder() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Usuário não encontrado');
      return;
    }

    // Preparar dados do pedido
    const orderData: CreateOrderRequest = {
      userId: parseInt(currentUser.id),
      items: this.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price
      })),
      paymentMethod: 'whatsapp'
    };

    console.log('Criando pedido com dados:', orderData);

    // Criar pedido na API
    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('Pedido criado com sucesso:', response);
        // Salvar o número do pedido e mostrar a tela de confirmação
        this.createdOrderNumber = response.orderNumber;
        this.showConfirmation = true;
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
        console.error('Erro completo:', JSON.stringify(error, null, 2));
        // Mesmo com erro, mostrar confirmação (fallback)
        this.createdOrderNumber = undefined;
        this.showConfirmation = true;
      }
    });
  }

  private openWhatsApp(orderNumber?: string) {
    let mensagem = "Olá, gostaria de finalizar o meu produto da GAITHGIO. Esses são os itens que vou comprar:\n\n";

    this.items.forEach(item => {
      const tamanho = item.selectedSize ? ` - Tamanho ${item.selectedSize}` : '';
      mensagem += `${item.product.name}${tamanho} - Quantidade: ${item.quantity} - Valor: €${item.product.price}\n`;
    });

    mensagem += `\nValor total: €${this.totalPrice()}`;
    
    if (orderNumber) {
      mensagem += `\n\nNúmero do pedido: ${orderNumber}`;
    }

    const numero = "5511957056779";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    // Abrir WhatsApp em nova aba
    window.open(url, '_blank');
  }

  private clearCart() {
    this.items = [];
    localStorage.removeItem('cart_items');
  }

  private checkForCheckoutItems(): void {
    // Verificar se há itens de checkout salvos e se o usuário está logado
    const checkoutItems = localStorage.getItem('checkout_items');
    
    if (checkoutItems && this.authService.isLoggedIn()) {
      // Restaurar os itens do carrinho
      this.items = JSON.parse(checkoutItems);
      localStorage.removeItem('checkout_items');
      
      // Prosseguir com o checkout automaticamente após garantir que o perfil está carregado
      this.authService.refreshUserProfile().subscribe(() => {
        setTimeout(() => {
          this.proceedToCheckout();
        }, 500);
      });
    }
  }

  onConfirmWhatsApp(): void {
    // Fechar a confirmação
    this.showConfirmation = false;
    // Guardar uma cópia dos itens antes de limpar o carrinho
    const itemsCopy = [...this.items];
    // Abrir WhatsApp com os itens
    this.openWhatsAppWithItems(itemsCopy, this.createdOrderNumber);
    // Limpar o carrinho após abrir WhatsApp
    this.clearCart();
    // Redirecionar para a página de pedidos
    this.router.navigate(['/member/dashboard'], { queryParams: { tab: 'orders' } });
  }

  onCancelWhatsApp(): void {
    // Fechar a confirmação
    this.showConfirmation = false;
    // Limpar o carrinho
    this.clearCart();
    // Redirecionar para a página de pedidos
    this.router.navigate(['/member/dashboard'], { queryParams: { tab: 'orders' } });
  }

  private openWhatsAppWithItems(items: CartItem[], orderNumber?: string) {
    let mensagem = "Olá, gostaria de finalizar o meu produto da GAITHGIO. Esses são os itens que vou comprar:\n\n";

    items.forEach(item => {
      const tamanho = item.selectedSize ? ` - Tamanho ${item.selectedSize}` : '';
      mensagem += `${item.product.name}${tamanho} - Quantidade: ${item.quantity} - Valor: €${item.product.price}\n`;
    });

    const totalPrice = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    mensagem += `\nValor total: €${totalPrice}`;
    
    if (orderNumber) {
      mensagem += `\n\nNúmero do pedido: ${orderNumber}`;
    }

    const numero = "5511957056779";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    // Abrir WhatsApp em nova aba
    window.open(url, '_blank');
  }

  getFirstName(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.firstName || 'Cliente';
  }
}
