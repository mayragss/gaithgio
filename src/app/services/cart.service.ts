// src/app/services/cart.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product';
import { MessageService } from 'primeng/api';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private messageService: MessageService){}

  private storageKey = 'cart_items';

  // signal que guarda os itens
  items = signal<CartItem[]>(this.loadFromStorage());

  // computados derivados (tipo useMemo do React)
  totalItems = computed(() =>
    this.items().reduce((acc, i) => acc + i.quantity, 0)
  );

  totalPrice = computed(() =>
    this.items().reduce((acc, i) => acc + i.product.price * i.quantity, 0)
  );

  private saveToStorage(items: CartItem[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadFromStorage(): CartItem[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addToCart(product: Product, quantity: number = 1, selectedSize?: string) {
    const items = [...this.items()];
    const existing = items.find(i => i.product.id === product.id && i.selectedSize === selectedSize);

    if (existing) {
      existing.quantity += quantity;
      this.messageService.add({ severity: 'success', detail: 'Produto atualizado com sucesso!', life: 3000 });
    } else {
      items.push({ product, quantity, selectedSize });      
      this.messageService.add({ severity: 'success', detail: 'Produto adicionado com sucesso!', life: 1000 });      
    }

    this.items.set(items);
    this.saveToStorage(items);
  }

  removeFromCart(productId: number) {
    const items = this.items().filter(i => i.product.id !== productId);
    this.items.set(items);
    this.saveToStorage(items);
  }

  updateQuantity(productId: number, quantity: number) {
    const items = [...this.items()];
    const item = items.find(i => i.product.id === productId);

    if (item) {
      item.quantity = quantity > 0 ? quantity : 1;
      this.items.set(items);
      this.saveToStorage(items);
    }
  }

  clearCart() {
    this.items.set([]);
    localStorage.removeItem(this.storageKey);
  }
}
