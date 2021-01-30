import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/checkout/order.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
  userOrdersData;
  isLoading = false;
  chart = [];

  constructor(
    private userOrdersService: OrderService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
        this.userOrdersService.getAllOrders(null,null).subscribe((userOrders) => {
          this.userOrdersData = userOrders;
          this.userOrdersData.ordersData.forEach((order) => {
            let orderPrice = 0;
            order.productsOrdered.forEach((product) => {
              orderPrice = orderPrice + product.price * product.quantity;
            });
            order.total = orderPrice;
          });

          let orderTotals: Array<number> = [];
          let orderDates: Array<Date> = [];
          this.userOrdersData.ordersData.forEach((order) => {
            let pushThis: boolean = true;
            let dateToPush = new Date(order.orderDate);
            for (let i = 0; i < orderDates.length; i++) {
              if (
                dateToPush.getFullYear() == orderDates[i].getFullYear() &&
                dateToPush.getMonth() == orderDates[i].getMonth() &&
                dateToPush.getDate() == orderDates[i].getDate()
              ) {
                orderTotals[i] = orderTotals[i] + order.total;
                pushThis = false;
              }
            }
            if (pushThis) {
              orderTotals.push(order.total);
              orderDates.push(dateToPush);
            }
          });

          let graphDates: Array<String> = [];

          orderDates.forEach((date) => {
            graphDates.push(date.toDateString());
          });

          this.chart = new Chart('canvas', {
            type: 'bar',
            data: {
              labels: graphDates,
              borderColor: '#fffff',
              datasets: [
                {
                  data: orderTotals,
                  backgroundColor: '#FF8B00',
                  hoverBackgroundColor: '#FF4600',
                  borderColor: '#000000',
                  borderWidth: 1,
                  fill: false,
                  barThickness: 12,
                },
              ],
            },
            options: {
              legend: {
                display: false,
              },
              scales: {
                xAxes: [
                  {
                    display: true,
                    offset: true,
                    type: 'time',
                    time: {
                      unit: 'month',
                    },
                  },
                ],
                yAxes: [
                  {
                    display: true,
                  },
                ],
              },
            },
          });
        });
    this.isLoading = false;
  }
}
