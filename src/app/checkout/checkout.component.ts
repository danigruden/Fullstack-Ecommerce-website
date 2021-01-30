import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart/cart.service';
import { OrderService } from './order.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  constructor(private cartService: CartService, private orderService: OrderService) {}

  isLoading = false;
  inCart = [];
  cartDataToCheck: Array<any> = [];
  finalCheckoutData = [];

  total = 0;

  ngOnInit(): void {
    this.inCart = this.cartService.getSavedCartData();
    if( this.inCart !== null){
    this.inCart.forEach((element) => {
      //console.log(element.id)
      this.cartDataToCheck.push(element.id);
    });
  }

    this.isLoading = true;
    this.cartService.getProductsPrice(this.cartDataToCheck)
    .subscribe(response => {
        response.documents.forEach(element => {
          let obj = {};
          let quantity;
          let currentPrice;
          currentPrice = element.currentProdPrice;
          this.inCart.findIndex((value, index) => {
            if (value.id == element._id) {
              if(this.inCart[index].quantity <= 1 || typeof this.inCart[index].quantity !== 'number') {
                this.inCart[index].quantity = 1;
              }
              quantity = this.inCart[index].quantity.toFixed();
            }})

          obj["id"] = element._id;
          obj["title"] = element.title;
          obj["category"] = element.category;
          obj["price"] = currentPrice;
          obj["quantity"] = quantity;

          this.finalCheckoutData.push(obj);
          this.total = this.total + currentPrice * quantity;
          this.isLoading = false;

        });
      });
  }

  onCreateOrder(){
    this.isLoading = true;
    this.orderService.createOrder(this.finalCheckoutData);
  }
}
