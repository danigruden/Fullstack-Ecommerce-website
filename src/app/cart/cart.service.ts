import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/products';

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private toastr: ToastrService, private http: HttpClient) {}

  inCart: Array<{
    id: string;
    title: string;
    imagePath: string;
    currentPrice: number;
    quantity: number;
  }> = [];

  cartTotal;

  toastrTimeout = 1500;
  private cartUpdated = new Subject();
  private cartTotalUpdated = new Subject();

  /*
  private checkedProdPrices: Array<{
    id: string;
    title: string;
    currentPrice: number;
  }> = [];
*/

  getProductsPrice(productsId: Array<[]>) {
    let params="";
    for (let i = 0; i < productsId.length; i++) {
      let singleParam = 'id=' + productsId[i];
      params = params + singleParam +"&";
    }
    return this.http
      .get<{ message: string; documents: any }>(BACKEND_URL + '/prices/idList?' + params);
  }

  addToCart(
    prodId: string,
    prodTitle: string,
    imgPath: string,
    currentProdPrice: number,
  ) {
    let alreadyInCart = false;
    this.inCart = JSON.parse(localStorage.getItem('cartItems'));
    this.cartTotal = JSON.parse(localStorage.getItem('cartTotal'));
    if (this.inCart === null) {
      this.inCart = [];
    }
    let currentPrice;
      currentPrice = currentProdPrice;
    this.inCart.findIndex((value, index) => {
      if (value.id == prodId) {
        if (alreadyInCart == false) {
          this.inCart[index].quantity++;
          this.inCart[index].currentPrice = currentPrice;
          this.toastr.success(
            'Successfully added to cart!',
            '1 X ' + this.inCart[index].title,
            {
              timeOut: this.toastrTimeout,
              positionClass: 'toast-top-left',
            }
          );
          alreadyInCart = true;
        }
      }
    });

    if (alreadyInCart == false) {
      this.inCart.push({
        id: prodId,
        title: prodTitle,
        imagePath: imgPath,
        currentPrice: currentPrice,
        quantity: 1,
      });
      this.toastr.success('Successfully added to cart!', '1 X ' + prodTitle, {
        timeOut: this.toastrTimeout,
        positionClass: 'toast-top-left',
      });
    }
    this.cartUpdated.next(this.inCart);
    localStorage.setItem('cartItems', JSON.stringify(this.inCart));

    this.cartTotal = this.cartTotal + currentPrice;
    this.cartTotalUpdated.next(this.cartTotal);
    localStorage.setItem('cartTotal', this.cartTotal);
  }

  removeOneFromCart(prodId: string) {
    this.inCart = JSON.parse(localStorage.getItem('cartItems'));
    this.cartTotal = JSON.parse(localStorage.getItem('cartTotal'));

    let alreadyRemoved = false;
    this.inCart.findIndex((value, index) => {
      if (value.id == prodId) {
        if (alreadyRemoved == false) {
          if (this.inCart[index].quantity > 1) {
            this.inCart[index].quantity--;
            this.cartTotal = this.cartTotal - this.inCart[index].currentPrice;
            this.toastr.info(
              'One removed from cart!',
              this.inCart[index].title,
              {
                timeOut: this.toastrTimeout,
                positionClass: 'toast-top-left',
              }
            );
          } else {
            this.deleteFromCart(prodId);
          }
          alreadyRemoved = true;
        }
      }
    });
    this.cartUpdated.next(this.inCart);
    localStorage.setItem('cartItems', JSON.stringify(this.inCart));
    this.cartTotalUpdated.next(this.cartTotal);
    localStorage.setItem('cartTotal', this.cartTotal);
  }

  clearCart(){
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartTotal');
    this.cartUpdated.next([]);
    this.cartTotalUpdated.next(0);
  }

  getNewCartData() {
    console.log('Got cart data');
    return this.cartUpdated.asObservable();
  }

  getSavedCartData() {
    return JSON.parse(localStorage.getItem('cartItems'));
  }

  getNewCartTotal() {
    return this.cartTotalUpdated.asObservable();
  }
  getSavedCartTotal() {
    return JSON.parse(localStorage.getItem('cartTotal'));
  }

  deleteFromCart(prodId: string) {
    this.inCart = JSON.parse(localStorage.getItem('cartItems'));
    this.cartTotal = JSON.parse(localStorage.getItem('cartTotal'));

    this.inCart.forEach((value, index) => {
      if (value.id == prodId) {
        this.toastr.info(
          'Removed from cart!',
          this.inCart[index].quantity + ' X ' + this.inCart[index].title,
          {
            timeOut: this.toastrTimeout,
            positionClass: 'toast-top-left',
          }
        );
        this.cartTotal =
          this.cartTotal -
          this.inCart[index].quantity * this.inCart[index].currentPrice;
        this.inCart.splice(index, 1);
      }
    });
    this.cartUpdated.next(this.inCart);
    localStorage.setItem('cartItems', JSON.stringify(this.inCart));
    this.cartTotalUpdated.next(this.cartTotal);
    localStorage.setItem('cartTotal', this.cartTotal);
  }
}
