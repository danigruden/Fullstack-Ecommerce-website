import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy{

  constructor(private cartService : CartService) { }

  inCart;
  numInCart;
  cartTotal = 0;
  private cartListenerSub: Subscription;
  private cartTotalListenerSub: Subscription;


  ngOnInit(): void {
    this.inCart = this.cartService.getSavedCartData();
    this.cartListenerSub = this.cartService.getNewCartData()
    .subscribe(cartData  => {
      this.inCart = cartData;
      this.numInCart = this.inCart.length;
    });

    if(this.inCart !== null && this.inCart !== undefined){
      this.numInCart = this.inCart.length;
      }else{
        this.numInCart = 0;
      }

      this.cartTotal = this.cartService.getSavedCartTotal();
      if(this.cartTotal == null){
        this.cartTotal = 0;
      }

      this.cartTotalListenerSub = this.cartService.getNewCartTotal()
      .subscribe(newCartTotal => {
        this.cartTotal = Number(newCartTotal);
      })

  }

  onAddOneToCart(prodId: string,title: string, imgPath: string, currentProdPrice: number){
    this.cartService.addToCart(prodId,title,imgPath,currentProdPrice);
  }

  onRemoveOneFromCart(prodId){
    this.cartService.removeOneFromCart(prodId);
  }

  onDeleteFromCart(prodId: string){
    this.cartService.deleteFromCart(prodId);
  }

  ngOnDestroy(){
    this.cartListenerSub.unsubscribe();
    this.cartTotalListenerSub.unsubscribe();
  }

}
