import { Component, OnInit, effect } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'detail',
  imports: [NavbarComponent, FooterComponent, ToastModule, CommonModule, TranslatePipe],
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
  translatedDescription: string = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private languageService: LanguageService,
    private translationService: TranslationService
  ) {
    // Effect para atualizar a descrição traduzida quando o idioma mudar
    effect(() => {
      const currentLang = this.languageService.currentLanguage();
      if (this.product) {
        this.updateDescription(currentLang);
      }
    });
  }

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
              this.attributes = this.parseAttributes(this.product.attributes);
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

            // Atualizar descrição traduzida
            this.updateDescription(this.languageService.currentLanguage());
          } ,
          error: (err) => console.error('Erro ao carregar produto:', err)
        });
      }
    });
  }

  private updateDescription(currentLang: 'pt' | 'en'): void {
    if (!this.product) {
      this.translatedDescription = '';
      return;
    }

    // Se há campos description_pt e description_en separados
    if (this.product.description_pt && this.product.description_en) {
      this.translatedDescription = currentLang === 'pt' ? this.product.description_pt : this.product.description_en;
      return;
    }
    
    // Se description é um objeto com pt e en
    if (typeof this.product.description === 'object' && this.product.description !== null) {
      const descObj = this.product.description as { pt?: string; en?: string };
      if (descObj.pt && descObj.en) {
        this.translatedDescription = currentLang === 'pt' ? descObj.pt : descObj.en;
        return;
      }
      // Fallback: se só tem um idioma, usa o que tiver
      if (descObj.pt) {
        this.translatedDescription = descObj.pt;
        if (currentLang === 'en') {
          this.translateDescription(descObj.pt);
        }
        return;
      }
      if (descObj.en) {
        this.translatedDescription = descObj.en;
        return;
      }
    }
    
    // Se description é uma string simples (sempre em português)
    if (typeof this.product.description === 'string') {
      const description = this.product.description;
      if (currentLang === 'pt') {
        this.translatedDescription = description;
      } else {
        // Traduzir para inglês
        this.translateDescription(description);
      }
      return;
    }
    
    this.translatedDescription = '';
  }

  private translateDescription(text: string): void {
    // Primeiro tenta pegar do cache
    const cached = this.translationService.translatePtToEnSync(text);
    if (cached !== text) {
      this.translatedDescription = cached;
      return;
    }

    // Se não está em cache, faz a tradução assíncrona
    this.translatedDescription = text; // Mostra o texto original enquanto traduz
    this.translationService.translatePtToEn(text).subscribe({
      next: (translated) => {
        this.translatedDescription = translated;
      },
      error: (err) => {
        console.warn('Erro ao traduzir descrição:', err);
        this.translatedDescription = text; // Mantém o texto original em caso de erro
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

  /**
   * Seleciona o tamanho a partir do tamanho exibido (convertido)
   * Precisa mapear de volta para o tamanho original quando necessário
   */
  selectSizeFromDisplay(displaySize: string) {
    const currentLang = this.languageService.currentLanguage();
    
    // Se o idioma for EN, precisa mapear de volta para o tamanho original
    if (currentLang === 'en') {
      if (displaySize === 'L') {
        this.selectedSize = 'G';
      } else if (displaySize === 'XL') {
        this.selectedSize = 'GG';
      } else {
        this.selectedSize = displaySize;
      }
    } else {
      // Se o idioma for PT, usa diretamente
      this.selectedSize = displaySize;
    }
  }

  /**
   * Verifica se um tamanho (exibido) está selecionado
   */
  isSizeSelected(displaySize: string): boolean {
    const currentLang = this.languageService.currentLanguage();
    
    // Se o idioma for PT, compara diretamente
    if (currentLang === 'pt') {
      return this.selectedSize === displaySize;
    }
    
    // Se o idioma for EN, precisa verificar a conversão
    if (displaySize === 'L' && this.selectedSize === 'G') {
      return true;
    }
    if (displaySize === 'XL' && this.selectedSize === 'GG') {
      return true;
    }
    
    return this.selectedSize === displaySize;
  }

  /**
   * Converte tamanhos brasileiros para internacionais apenas quando o idioma for EN
   * PT: G e GG (mantém como vem do backend)
   * EN: L e XL (converte)
   */
  convertSize(size: string): string {
    const currentLang = this.languageService.currentLanguage();
    
    // Se o idioma for PT, mantém como está
    if (currentLang === 'pt') {
      return size;
    }
    
    // Se o idioma for EN, converte
    if (size === 'G') {
      return 'L';
    }
    if (size === 'GG') {
      return 'XL';
    }
    return size;
  }

  /**
   * Retorna os tamanhos convertidos baseado no idioma atual
   */
  getSizes(): string[] {
    if (!this.attributes || !this.attributes['size'] || !Array.isArray(this.attributes['size'])) {
      return [];
    }
    return this.attributes['size'].map((size: string) => this.convertSize(size));
  }

  toggleDescription() {
    this.descriptionExpanded = !this.descriptionExpanded;
  }

  getDescription(): string {
    return this.translatedDescription || '';
  }

  /**
   * Faz o parse recursivo dos atributos que podem ter múltiplas camadas de escape JSON
   */
  private parseAttributes(attributes: any): any {
    if (!attributes) {
      return {};
    }

    // Se já é um objeto, retorna diretamente
    if (typeof attributes === 'object' && attributes !== null && !Array.isArray(attributes)) {
      return attributes;
    }

    // Se é string, tenta fazer parse recursivo
    if (typeof attributes === 'string') {
      let currentValue: any = attributes.trim();
      let maxAttempts = 10; // Limite de segurança para evitar loop infinito
      let attempts = 0;
      let lastValidObject: any = null;

      while (attempts < maxAttempts) {
        try {
          const parsed = JSON.parse(currentValue);
          
          // Se o resultado é uma string, continua tentando fazer parse
          if (typeof parsed === 'string') {
            currentValue = parsed.trim();
            attempts++;
            continue;
          }
          
          // Se o resultado é um objeto, verifica se tem a estrutura esperada
          if (typeof parsed === 'object' && parsed !== null) {
            lastValidObject = parsed;
            
            // Se tem as propriedades esperadas (size, color), retorna
            if (parsed.size || parsed.color || (Object.keys(parsed).length > 0 && !parsed.toString)) {
              return parsed;
            }
            
            // Se não tem propriedades úteis, pode ser que ainda precise de mais um parse
            // Mas só continua se o objeto não tem propriedades ou se parece ser um wrapper
            if (Object.keys(parsed).length === 0) {
              break;
            }
            
            // Tenta fazer stringify e parse novamente
            currentValue = JSON.stringify(parsed);
            attempts++;
            continue;
          }
          
          // Se chegou aqui, retorna o que foi parseado
          return parsed;
        } catch (e) {
          // Se falhou o parse e já temos um objeto válido, retorna ele
          if (lastValidObject) {
            return lastValidObject;
          }
          // Se falhou na primeira tentativa, retorna objeto vazio
          return {};
        }
      }
      
      // Se saiu do loop e tem um objeto válido, retorna ele
      if (lastValidObject) {
        return lastValidObject;
      }
    }

    return {};
  }
}
