import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'detail',
  imports: [NavbarComponent, FooterComponent, ToastModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {
  productExternalId!: number;
  product?: Product;
  imageMain: string="images/no-image-icon-6.png";
  images: string[] = ["no-image-icon-6.png","no-image-icon-6.png","no-image-icon-6.png"];
  attributes: any = {};
  quantity: number = 1;
  stock: number | undefined;

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
            this.imageMain = images[0];

            this.attributes = JSON.parse(this.product?.attributes.toString());
            this.stock = this.product.stock;

            if(images.length > 1){
              this.images = [];
              images.forEach(img => {
                this.images.push(img);              
            });
            }
          } ,
          error: (err) => console.error('Erro ao carregar produto:', err)
        });
      }
    });
  }

  addToCart() {
    this.cartService.addToCart(this.product!, this.quantity);
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
}
