import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../services/cart.service';
import { Button } from "primeng/button";
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [Button, FooterComponent]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];

  ngOnInit(): void {
    this.loadCart();
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

    let mensagem = "Olá, gostaria de finalizar o meu produto da GAITHGIO. Esses são os itens que vou comprar:\n\n";

    this.items.forEach(item => {
      const tamanho = item.selectedSize ? ` - Tamanho ${item.selectedSize}` : '';
      mensagem += `${item.product.name}${tamanho} - Quantidade: ${item.quantity} - Valor: €${item.product.price}\n`;
    });

    mensagem += `\nValor total: €${this.totalPrice()}`;

    const numero = "5511957056779";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
  }
}
