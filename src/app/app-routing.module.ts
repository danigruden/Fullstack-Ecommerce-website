import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnalyticsComponent } from './admin/analytics/analytics.component';
import { OrderManagementComponent } from './admin/order-management/order-management.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { UserProfileComponent } from './auth/user-profile/user-profile.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { SingleProductPageComponent } from './single-product-page/single-product-page.component';

const routes: Routes = [
  {path: '', component: ProductListComponent},
  {path: 'cart', component: CartComponent},
  {path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard]},
  {path: 'create', component: ProductCreateComponent, canActivate: [AuthGuard]},
  {path: 'edit/:productId', component: ProductCreateComponent, canActivate: [AuthGuard]},
  {path: 'product/:productId', component: SingleProductPageComponent},
  {path: "login", component: LoginComponent},
  {path: "signup", component: SignupComponent},
  {path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard]},
  {path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard]},
  {path: 'orderManagement', component: OrderManagementComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {

 }
