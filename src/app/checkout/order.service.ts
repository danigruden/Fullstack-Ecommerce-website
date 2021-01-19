import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Order } from './order.model';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../cart/cart.service';

const BACKEND_URL = environment.apiUrl + '/orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  /*
  private order: Order[] = [];
  private ordersUpdated = new Subject<{
    products: Order[];
    productCount: number;
  }>();
*/

  constructor(
    private http: HttpClient,
    public router: Router,
    private toastr: ToastrService,
    private cartService: CartService
  ) {}

  createOrder(productsOrdered: Array<{}>) {
    //const orderData = new FormData();
    //orderData.append('productsOrdered', JSON.stringify(productsOrdered));
    const orderData: Order = {
      productsOrdered: productsOrdered,
    };

    this.http
      .post<{ message: string; order: Order }>(BACKEND_URL, orderData)
      .subscribe(
        (res) => {
          this.cartService.clearCart();
          this.toastr.success(
            'View all your orders on "My profile"',
            'Order successfull!',
            {
              closeButton: true,
              positionClass: 'toast-top-center',
              timeOut: 6000,
            }
          );
          this.router.navigate(['/']);
        },
        (err) => {
          console.log(err);
          this.toastr.error('Order failed', '', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          });
        }
      );
  }


  getUserOrders() {
    return this.http
      .get<{ message: string; ordersData: Array<{ customerEmail: string,
      customerId: string,
      productsOrdered: Array <{id: string,title: string,category: string,price: number,quantity: number}>,
      orderDate: Date, deliveredStatus: boolean}>  }>(BACKEND_URL+"/user");
  }

  getAllOrders() {
    return this.http
      .get<{ message: string; ordersData: Array<{ customerEmail: string,
      customerId: string,
      productsOrdered: Array <{id: string,title: string,category: string,price: number,quantity: number}>,
      orderDate: Date, deliveredStatus: boolean}>  }>(BACKEND_URL+"/all");
  }

}
