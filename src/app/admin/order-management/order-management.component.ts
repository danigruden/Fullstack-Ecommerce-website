import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/checkout/order.service';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent implements OnInit {
  userOrdersData;
  isLoading = false;
  oneStatusChanged = false;

  currentPage: number = 1;
  totalOrders: number = 10;
  ordersPerPage: number = 20;
  ordersPerPageOptions = [10, 15, 20, 30, 40];

  statusForm = this.fb.group({
    newStatus: [''],
  });

  constructor(
    private ordersService: OrderService,
    public fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.ordersService.getAllOrders(this.ordersPerPage,this.currentPage)
    .subscribe((userOrders) => {
      this.userOrdersData = userOrders;
      this.totalOrders = userOrders.numOfOrders;
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

  onChangePage(pageEvent: PageEvent) {
    this.ordersPerPage = pageEvent.pageSize;
    this.currentPage = pageEvent.pageIndex + 1;
    console.log(this.ordersPerPage + "  " +  this.currentPage);

    this.isLoading = true;
    this.ordersService.getAllOrders(this.ordersPerPage,this.currentPage)
    .subscribe((userOrders) => {
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
    window.scrollTo({ top: 210, behavior: 'smooth' })
  }

  onSubmit(id: string) {
    if (this.statusForm.value.newStatus == '') {
      return;
    } else {
      this.onProductUpdate(id, this.statusForm.value.newStatus);
      this.statusForm.value.newStatus = [''];
    }
  }

  statusChanged(idOfChange: string){
    if(!this.oneStatusChanged){
      this.userOrdersData.ordersData.forEach((order) => {
        if(idOfChange==order._id){
          order.changed = true;
          this.oneStatusChanged = true;
        }
      });
    }
  }

  onProductUpdate(id: string, newStatusUpdate: string) {
    this.isLoading = true;
    this.ordersService
      .updateOrder(id, newStatusUpdate)
      .subscribe((response) => {
        console.log(response);
        if (response.message === 'Updating order successful!') {
          this.toastr.success('', 'Order update successfull!', {
            closeButton: true,
            positionClass: 'toast-top-full-width',
            timeOut: 3000,
          });
          this.ordersService.getAllOrders(this.ordersPerPage,this.currentPage)
          .subscribe((userOrders) => {
            this.userOrdersData = userOrders;
            this.userOrdersData.ordersData.forEach((order) => {
              let orderPrice = 0;
              order.productsOrdered.forEach((product) => {
                orderPrice = orderPrice + product.price * product.quantity;
              });
              order.total = orderPrice;
            });
            this.statusForm = this.fb.group({
              newStatus: [''],
            });
            this.oneStatusChanged = false;
            this.isLoading = false;
          });
        }
      });
  }
}
