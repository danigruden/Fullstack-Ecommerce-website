import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { OrderService } from 'src/app/checkout/order.service';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent implements OnInit {
  userOrdersData;
  isLoading = false;

  constructor(
    private userOrdersService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

        this.userOrdersService.getAllOrders().subscribe((userOrders) => {
          this.userOrdersData = userOrders;
          this.userOrdersData.ordersData.forEach((order) => {
            let orderPrice = 0;
            order.productsOrdered.forEach((product) => {
              orderPrice = orderPrice + product.price * product.quantity;
            });
            order.total = orderPrice;
          });
        });
    this.isLoading = false;
  }
}
