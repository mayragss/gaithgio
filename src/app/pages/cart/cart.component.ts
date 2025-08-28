import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../services/cart.service';

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true
})
export class CartComponent implements OnInit{
  items: CartItem[] = [];

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    const data = localStorage.getItem('cart_items');
    this.items = data ? JSON.parse(data) : [];

    console.log(this.items);
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
}
