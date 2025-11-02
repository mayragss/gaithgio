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
            const images: any[] = JSON.parse(this.product?.images.toString());
            
            // Definir a imagem principal
            if (images && images.length > 0) {
              const firstImage = images[0];
              // Se já é uma URL completa, usar diretamente
              if (firstImage.startsWith('http')) {
                this.imageMain = firstImage;
              } else {
                // Se não é URL completa, construir a URL completa
                this.imageMain = `https://api-ecommerce.maygomes.com${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
              }
            } else {
              this.imageMain = "images/no-image-icon-6.png";
            }

            this.attributes = JSON.parse(this.product?.attributes.toString());
            this.stock = this.product.stock;

            // Processar todas as imagens para a galeria
            if(images && images.length > 1){
              this.images = [];
              images.forEach(img => {
                // Se já é uma URL completa, usar diretamente
                if (img.startsWith('http')) {
                  this.images.push(img);
                } else {
                  // Se não é URL completa, construir a URL completa
                  this.images.push(`https://api-ecommerce.maygomes.com${img.startsWith('/') ? '' : '/'}${img}`);
                }
              });
            } else {
              this.images = [];
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
