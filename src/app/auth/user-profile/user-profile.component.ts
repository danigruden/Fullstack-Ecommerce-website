import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/checkout/order.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  userOrdersData;
  isLoading= false;

  constructor(private userOrdersService: OrderService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.userOrdersService.getUserOrders()
    .subscribe((userOrders) => {
      this.userOrdersData = userOrders;
     this.userOrdersData.ordersData.forEach(order => {
      let orderPrice = 0;
       order.productsOrdered.forEach(product => {
        orderPrice = orderPrice + product.price*product.quantity;
       });
       order.total = orderPrice;
     }
     );
     this.isLoading = false;
    });
  }



}
