import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CartItem } from '../../services/cart.service';
import { Button } from "primeng/button";
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { OrderService, CreateOrderRequest } from '../../services/order.service';
import { Router } from '@angular/router';
import { WhatsAppConfirmationComponent } from '../../components/whatsapp-confirmation/whatsapp-confirmation.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [Button, FooterComponent, WhatsAppConfirmationComponent, TranslatePipe, CommonModule]
})
export class CartComponent implements OnInit {
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  items: CartItem[] = [];
  showConfirmation: boolean = false;
  createdOrderNumber?: string;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }

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
    if (!prod || !prod.attributes) {
      return [];
    }

    const parsedAttributes = this.parseAttributes(prod.attributes);
    let sizes: string[] = [];
    
    // Se parsedAttributes é um array, usa diretamente
    if (Array.isArray(parsedAttributes)) {
      sizes = parsedAttributes;
    }
    // Se é um objeto com propriedade size, extrai o array de tamanhos
    else if (parsedAttributes && typeof parsedAttributes === 'object' && parsedAttributes.size) {
      sizes = Array.isArray(parsedAttributes.size) ? parsedAttributes.size : [];
    }
    
    // Converte os tamanhos baseado no idioma atual
    return sizes.map(size => this.convertSize(size));
  }

  /**
   * Converte tamanhos brasileiros para internacionais apenas quando o idioma for EN
   * PT: G e GG (mantém como vem do backend)
   * EN: L e XL (converte)
   */
  convertSize(size: string): string {
    const currentLang = this.languageService.currentLanguage();
    
    // Se o idioma for PT, mantém como está
    if (currentLang === 'pt') {
      return size;
    }
    
    // Se o idioma for EN, converte
    if (size === 'G') {
      return 'L';
    }
    if (size === 'GG') {
      return 'XL';
    }
    return size;
  }

  /**
   * Converte o tamanho selecionado para exibição baseado no idioma atual
   */
  getDisplaySize(selectedSize: string | undefined): string {
    if (!selectedSize) {
      return '';
    }
    return this.convertSize(selectedSize);
  }

  /**
   * Faz o parse recursivo dos atributos que podem ter múltiplas camadas de escape JSON
   */
  private parseAttributes(attributes: any): any {
    if (!attributes) {
      return {};
    }

    // Se já é um objeto, retorna diretamente
    if (typeof attributes === 'object' && attributes !== null && !Array.isArray(attributes)) {
      return attributes;
    }

    // Se é string, tenta fazer parse recursivo
    if (typeof attributes === 'string') {
      let currentValue: any = attributes.trim();
      let maxAttempts = 10; // Limite de segurança para evitar loop infinito
      let attempts = 0;
      let lastValidObject: any = null;

      while (attempts < maxAttempts) {
        try {
          const parsed = JSON.parse(currentValue);
          
          // Se o resultado é uma string, continua tentando fazer parse
          if (typeof parsed === 'string') {
            currentValue = parsed.trim();
            attempts++;
            continue;
          }
          
          // Se o resultado é um objeto, verifica se tem a estrutura esperada
          if (typeof parsed === 'object' && parsed !== null) {
            lastValidObject = parsed;
            
            // Se tem as propriedades esperadas (size, color), retorna
            if (parsed.size || parsed.color || (Object.keys(parsed).length > 0 && !parsed.toString)) {
              return parsed;
            }
            
            // Se não tem propriedades úteis, pode ser que ainda precise de mais um parse
            // Mas só continua se o objeto não tem propriedades ou se parece ser um wrapper
            if (Object.keys(parsed).length === 0) {
              break;
            }
            
            // Tenta fazer stringify e parse novamente
            currentValue = JSON.stringify(parsed);
            attempts++;
            continue;
          }
          
          // Se chegou aqui, retorna o que foi parseado
          return parsed;
        } catch (e) {
          // Se falhou o parse e já temos um objeto válido, retorna ele
          if (lastValidObject) {
            return lastValidObject;
          }
          // Se falhou na primeira tentativa, retorna objeto vazio
          return {};
        }
      }
      
      // Se saiu do loop e tem um objeto válido, retorna ele
      if (lastValidObject) {
        return lastValidObject;
      }
    }

    return {};
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
    const currentLang = this.languageService.currentLanguage();
    const translations = {
      pt: {
        orderMessage: 'Olá, gostaria de finalizar o meu produto da GAITHGIO. Esses são os itens que vou comprar:\n\n',
        size: ' - Tamanho ',
        quantity: ' - Quantidade: ',
        value: ' - Valor: €',
        totalValue: '\n\nValor total: €',
        orderNumber: '\n\nNúmero do pedido: '
      },
      en: {
        orderMessage: 'Hello, I would like to finalize my GAITHGIO product. These are the items I will purchase:\n\n',
        size: ' - Size ',
        quantity: ' - Quantity: ',
        value: ' - Value: €',
        totalValue: '\n\nTotal value: €',
        orderNumber: '\n\nOrder number: '
      }
    };

    const t = translations[currentLang];
    let mensagem = t.orderMessage;

    this.items.forEach(item => {
      const tamanho = item.selectedSize ? `${t.size}${item.selectedSize}` : '';
      mensagem += `${item.product.name}${tamanho}${t.quantity}${item.quantity}${t.value}${item.product.price}\n`;
    });

    mensagem += `${t.totalValue}${this.totalPrice()}`;
    
    if (orderNumber) {
      mensagem += `${t.orderNumber}${orderNumber}`;
    }

    const numero = "351934036467";
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
    const currentLang = this.languageService.currentLanguage();
    const translations = {
      pt: {
        orderMessage: 'Olá, gostaria de finalizar o meu produto da GAITHGIO. Esses são os itens que vou comprar:\n\n',
        size: ' - Tamanho ',
        quantity: ' - Quantidade: ',
        value: ' - Valor: €',
        totalValue: '\n\nValor total: €',
        orderNumber: '\n\nNúmero do pedido: '
      },
      en: {
        orderMessage: 'Hello, I would like to finalize my GAITHGIO product. These are the items I will purchase:\n\n',
        size: ' - Size ',
        quantity: ' - Quantity: ',
        value: ' - Value: €',
        totalValue: '\n\nTotal value: €',
        orderNumber: '\n\nOrder number: '
      }
    };

    const t = translations[currentLang];
    let mensagem = t.orderMessage;

    items.forEach(item => {
      const tamanho = item.selectedSize ? `${t.size}${item.selectedSize}` : '';
      mensagem += `${item.product.name}${tamanho}${t.quantity}${item.quantity}${t.value}${item.product.price}\n`;
    });

    const totalPrice = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    mensagem += `${t.totalValue}${totalPrice}`;
    
    if (orderNumber) {
      mensagem += `${t.orderNumber}${orderNumber}`;
    }

    const numero = "351934036467";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    // Abrir WhatsApp em nova aba
    window.open(url, '_blank');
  }

  getFirstName(): string {
    const currentUser = this.authService.getCurrentUser();
    const currentLang = this.languageService.currentLanguage();
    return currentUser?.firstName || (currentLang === 'pt' ? 'Cliente' : 'Customer');
  }
}
