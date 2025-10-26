import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { DetailComponent } from './pages/detail/detail.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { CartComponent } from './pages/cart/cart.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { MemberDashboardComponent } from './pages/member/member-dashboard.component';
import { MemberLoginComponent } from './pages/member/member-login.component';
import { MemberRegisterComponent } from './pages/member/member-register.component';
import { MemberForgotPasswordComponent } from './pages/member/member-forgot-password.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'products', component: ProductsComponent},
    { path: 'faqs', component: FaqsComponent},
    { path: 'login', component: MemberLoginComponent},
    { path: 'register', component: MemberRegisterComponent},
    { path: 'forgot-password', component: MemberForgotPasswordComponent},
    { path: 'product/detail/:id', component: DetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'gallery', component: GalleryComponent },
    // Member routes
    { path: 'member/dashboard', component: MemberDashboardComponent, canActivate: [AuthGuard] },
    { path: 'member', redirectTo: '/login', pathMatch: 'full' },
    // 404 - Wildcard route (must be last)
    { path: '**', component: NotFoundComponent }
];
