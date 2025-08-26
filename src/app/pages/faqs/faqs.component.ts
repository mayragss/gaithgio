import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProductService } from '../../services/product.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { JsonArrayToStringPipe } from '../../pipes/json-array-to-string.pipe';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'faqs',
  imports: [NavbarComponent, CommonModule, JsonArrayToStringPipe, FooterComponent ],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  products: Product[] = [];
  filterForm: FormGroup | undefined;
  
  constructor(private fb: FormBuilder,private productService: ProductService) {}

    ngOnInit() {
    this.filterForm = this.fb.group({
      availability: [''],
      sort: [''],
      minPrice: [null],
      maxPrice: [null]
    });

    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll().subscribe(
      products => this.products = products,
      err => console.error('Erro ao carregar produtos', err)
    );
  }
}
