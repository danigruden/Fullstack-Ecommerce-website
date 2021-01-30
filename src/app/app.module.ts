import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductCreateComponent} from './products/product-create/product-create.component';
import { HeaderComponent } from './header/header.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthInterceptor } from './auth/auth-interceptor';
import { ErrorInterceptor } from './error-interceptor';
import { ErrorComponent } from './error/error.component';
import { AngularMaterialModule } from './angular-material.module';
import { SingleProductPageComponent } from './products/single-product-page/single-product-page.component';
import { FooterComponent } from './footer/footer.component';
import { CartComponent } from './cart/cart.component';
import {ToastrModule} from 'ngx-toastr';
import { CheckoutComponent } from './checkout/checkout.component';
import { UserProfileComponent } from './auth/user-profile/user-profile.component';
import { AnalyticsComponent } from './admin/analytics/analytics.component';
import { OrderManagementComponent } from './admin/order-management/order-management.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ContactPageComponent } from './contact-page/contact-page.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductCreateComponent,
    HeaderComponent,
    ProductListComponent,
    LoginComponent,
    SignupComponent,
    ErrorComponent,
    SingleProductPageComponent,
    FooterComponent,
    CartComponent,
    CheckoutComponent,
    UserProfileComponent,
    AnalyticsComponent,
    OrderManagementComponent,
    ContactPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    AngularMaterialModule,
    ToastrModule.forRoot(),
    NgxSliderModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}],

  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule { }
