import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'detail',
  imports: [NavbarComponent, FooterComponent, ToastModule, CommonModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {
  productExternalId!: number;
  product?: Product;
  imageMain: string = "images/no-image-icon-6.png";
  images: string[] = [];
  attributes: any = {};
  quantity: number = 1;
  stock: number | undefined;
  selectedSize: string = '';
  descriptionExpanded: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.productExternalId = Number(this.route.snapshot.paramMap.get('id'));
      
     // if(this.productExternalId == undefined)
        // página nao encontrada

      if (this.productExternalId) {
        this.productService.getById(this.productExternalId).subscribe({
          next: (res) =>{
            //if(res==null)
              // página nao encontrada
            this.product = res;
            
            // Processar imagens - verificar se já é array ou precisa parsear
            let images: string[] = [];
            if (this.product?.images) {
              // Se já é um array, usa diretamente
              if (Array.isArray(this.product.images)) {
                images = this.product.images;
              } 
              // Se é string, tenta parsear
              else if (typeof this.product.images === 'string') {
                try {
                  const parsed = JSON.parse(this.product.images);
                  if (Array.isArray(parsed)) {
                    images = parsed;
                  } else {
                    // Se não é array após parse, pode ser uma string única
                    images = [this.product.images];
                  }
                } catch (e) {
                  // Se falhar o parse, tenta usar como string única
                  images = [this.product.images];
                }
              }
            }
            
            // Definir a imagem principal
            if (images && images.length > 0) {
              const firstImage = images[0];
              // Se já é uma URL completa, usar diretamente
              if (firstImage && firstImage.startsWith('http')) {
                this.imageMain = firstImage;
              } else if (firstImage) {
                // Se não é URL completa, construir a URL completa
                this.imageMain = `https://api-ecommerce.maygomes.com${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
              } else {
                this.imageMain = "images/no-image-icon-6.png";
              }
            } else {
              this.imageMain = "images/no-image-icon-6.png";
            }

            // Processar attributes
            if (this.product?.attributes) {
              if (typeof this.product.attributes === 'string') {
                try {
                  this.attributes = JSON.parse(this.product.attributes);
                } catch (e) {
                  this.attributes = this.product.attributes;
                }
              } else {
                this.attributes = this.product.attributes;
              }
            }
            
            this.stock = this.product.stock;

            // Processar todas as imagens para a galeria
            this.images = [];
            if (images && images.length > 0) {
              images.forEach(img => {
                if (!img) return;
                // Se já é uma URL completa, usar diretamente
                if (img.startsWith('http')) {
                  this.images.push(img);
                } else {
                  // Se não é URL completa, construir a URL completa
                  this.images.push(`https://api-ecommerce.maygomes.com${img.startsWith('/') ? '' : '/'}${img}`);
                }
              });
            }
          } ,
          error: (err) => console.error('Erro ao carregar produto:', err)
        });
      }
    });
  }

  addToCart() {
    this.cartService.addToCart(this.product!, this.quantity, this.selectedSize);
  }

  addQuantity(){
    if(this.quantity == this.stock)
    {
      // set plus to off
      return this.quantity;
    }
    return this.quantity++;
  }

    removeQuantity(){
    if(this.quantity == this.stock)
    {
      // set plus to off
      return this.quantity;
    }
    return this.quantity > 1 ? this.quantity-- : this.quantity;
  }

  selectImage(image: string) {
    this.imageMain = image;
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  toggleDescription() {
    this.descriptionExpanded = !this.descriptionExpanded;
  }
}
