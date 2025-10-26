import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../services/cart.service';
import { Button } from "primeng/button";
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { OrderService, CreateOrderRequest } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [Button, FooterComponent]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];

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
    try {
      if (product?.images) {
        const images: string[] = JSON.parse(product.images.toString());
        console.log('images '+images);
        return images.length > 0 ? images[0] : "sem-imagem.png"; // fallback
      }
      return "sem-imagem.png"; // caso não tenha imagens
    } catch (error) {
      console.error("Erro ao parsear imagens:", error);
      return "sem-imagem.png";
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

    // Criar pedido na API
    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('Pedido criado com sucesso:', response);
        this.openWhatsApp(response.orderNumber);
        this.clearCart();
        this.router.navigate(['/member/dashboard'], { queryParams: { tab: 'orders' } });
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
        // Mesmo com erro, abrir WhatsApp (fallback)
        this.openWhatsApp();
        this.router.navigate(['/member/dashboard'], { queryParams: { tab: 'orders' } });
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
      
      // Prosseguir com o checkout automaticamente
      setTimeout(() => {
        this.proceedToCheckout();
      }, 1000); // Pequeno delay para garantir que a página carregou
    }
  }
}
