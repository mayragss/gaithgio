import { Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'products', component: ProductsComponent},
];
