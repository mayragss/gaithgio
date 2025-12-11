import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProductService } from '../../services/product.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer/footer.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'faqs',
  imports: [NavbarComponent, CommonModule, FooterComponent, TranslatePipe],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  products: Product[] = [];
  filterForm: FormGroup | undefined;
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  
  constructor(private fb: FormBuilder, private productService: ProductService) {
    // Effect para detectar mudanças no idioma e forçar atualização
    effect(() => {
      this.languageService.currentLanguage();
      this.cdr.markForCheck();
    });
  }

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
