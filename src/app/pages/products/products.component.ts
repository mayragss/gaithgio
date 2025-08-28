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

@Component({
  selector: 'products',
  imports: [NavbarComponent, CommonModule, JsonArrayToStringPipe, FooterComponent, ToastModule ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filterForm: FormGroup | undefined;
  
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService) {}

    ngOnInit() {
    this.filterForm = this.fb.group({
      availability: [''],
      sort: [''],
      minPrice: [null],
      maxPrice: [null]
    });

    this.loadProducts();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  loadProducts() {
    this.productService.getAll().subscribe(
      products => this.products = products,
      err => console.error('Erro ao carregar produtos', err)
    );
  }
}
