import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { CartService } from "../cart/cart.service";
import { ProductFilterService } from "../products/product-filter.service";
import { ProductListComponent } from "../products/product-list/product-list.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy{
  userIsAuthenticated = false;
  currentUserEmail;
  currentUserType;

  private authListenerSub: Subscription;
  private keywordFilterSub: Subscription;
  private cartListenerSub: Subscription;
  private cartTotalListenerSub: Subscription;

  constructor(private authService: AuthService, private productfilterService: ProductFilterService, private cartService: CartService ,private router: Router){}

  keywordHeader = "";
  inHeaderCart;
  numInCart;
  headerCartTotal = 0;

  ngOnInit(){
    this.headerCartTotal = this.cartService.getSavedCartTotal();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.currentUserEmail = this.authService.getUserEmail();
      if(this.userIsAuthenticated){
        this.authService.getUserType().subscribe(response => {
          this.currentUserType = response.userType;
        });
      }
      else{
        this.currentUserType="unauthenticated";
      }
    });

    if(this.userIsAuthenticated){
      this.authService.getUserType().subscribe(response => {
        this.currentUserType = response.userType;
      });
    }else{
      this.currentUserType="unauthenticated";
    }

    this.currentUserEmail =  this.authService.getUserEmail();

    this.keywordFilterSub = this.productfilterService.getKeywordUpdateListener()
    .subscribe(keyword => {
      this.keywordHeader = keyword.toString();
    });

    this.inHeaderCart = this.cartService.getSavedCartData();

    this.headerCartTotal = this.cartService.getSavedCartTotal();
    if(this.headerCartTotal == null){
      this.headerCartTotal = 0;
    }

    this.cartListenerSub = this.cartService.getNewCartData()
    .subscribe(cartData  => {
      this.inHeaderCart = cartData;
      this.numInCart = this.inHeaderCart.length;
    });

    this.cartTotalListenerSub = this.cartService.getNewCartTotal()
    .subscribe(newCartTotal => {
      this.headerCartTotal = Number(newCartTotal);
    })

    if(this.inHeaderCart !== null && this.inHeaderCart !== undefined){
      this.numInCart = this.inHeaderCart.length;
      }else{
        this.numInCart = 0;
      }

  }

  onClearCart(){
    this.cartService.clearCart();
  }

  onDeleteFromCart(id: string){
    this.cartService.deleteFromCart(id);
  }

  searchByKeywordHeader(headerKeyword: string){
    if(this.router.url !== "/"){
      this.productfilterService.setSearchedPriceRange(0, null);
      this.productfilterService.electricCategory = false;
      this.productfilterService.acousticCategory = false;
      this.productfilterService.amplifiersCategory = false;
      this.productfilterService.setCategories(null);
    }
    this.productfilterService.theKeyword(headerKeyword);
  }

  onEnterAdmin(routeNav: string){
    this.authService.getUserType()
    .subscribe(response => {
      if(response.userType == "admin"){
        this.router.navigate([routeNav]);
      }
    });
  }

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy(){
    this.authListenerSub.unsubscribe();
    this.keywordFilterSub.unsubscribe();
    this.cartListenerSub.unsubscribe();
    this.cartTotalListenerSub.unsubscribe();
  }
}
