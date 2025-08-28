import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { DetailComponent } from './pages/detail/detail.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { CartComponent } from './pages/cart/cart.component';
import { GalleryComponent } from './pages/gallery/gallery.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'products', component: ProductsComponent},
    { path: 'faqs', component: FaqsComponent},
    { path: 'login', component: LoginComponent},
    { path: 'product/detail/:id', component: DetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'gallery', component: GalleryComponent },
];
