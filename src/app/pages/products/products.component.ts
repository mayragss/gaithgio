import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProductService } from '../../services/product.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { JsonArrayToStringPipe } from '../../pipes/json-array-to-string.pipe';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { take, tap } from 'rxjs';

@Component({
  selector: 'products',
  imports: [NavbarComponent, CommonModule, JsonArrayToStringPipe, FooterComponent, ToastModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filterForm: FormGroup | undefined;
  availableFirst: boolean = true;
  unavailableFirst: boolean = true;
  ascPriceFirst: boolean = true;
  descPriceFirst: boolean = true;
  aFirst: boolean = true;
  zFirst: boolean = true;
  activeOrder: { [key: string]: 'asc' | 'desc' } = {};
  
  // Estados dos arrows
  disponibilidadeArrowUp: boolean = false;
  precoArrowUp: boolean = false;
  ordenarArrowUp: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService) { }

  ngOnInit() {
    this.filterForm = this.fb.group({
      availability: [''],
      sort: [''],
      minPrice: [null],
      maxPrice: [null]
    });

    this.loadProducts();
  }
/*
  toggleSort(filter: 'price' | 'availability' | 'letters') {
    // alterna entre desc e asc
    const current = this.activeOrder[filter];
    const newOrder = current === 'asc' ? 'desc' : 'asc';
    this.activeOrder[filter] = newOrder;

    this.productService.getSortedProducts(filter, newOrder).subscribe({
      next: (products) => console.log('Produtos recebidos:', products),
      error: (err) => console.error('Erro ao buscar produtos', err)
    });
  }

  isAsc(filter: string) {
    return this.activeOrder[filter] === 'asc';
  }

  isDesc(filter: string) {
    return !this.activeOrder[filter] || this.activeOrder[filter] === 'desc';
  }*/

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  loadProducts() {
    this.productService.getAll()
      .pipe(
        take(1),
        tap({ error: (err) => console.error('Erro ao carregar produtos', err) })
      )
      .subscribe((products) => this.products = products);
  }

  // Métodos para toggle dos arrows
  toggleDisponibilidadeArrow() {
    this.disponibilidadeArrowUp = !this.disponibilidadeArrowUp;
  }

  togglePrecoArrow() {
    this.precoArrowUp = !this.precoArrowUp;
  }

  toggleOrdenarArrow() {
    this.ordenarArrowUp = !this.ordenarArrowUp;
  }
}
