import { OrderHistory } from './../../common/order-history';
import { Component, OnInit } from '@angular/core';
import { OrderHistoryService } from '../../services/order-history';

@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistoryComponent implements OnInit {
  orderHistoryList: OrderHistory[] = [];
  constructor(private orderHistoryService: OrderHistoryService) {}

  ngOnInit(): void {
    this.getOrderHistory();
  }

  getOrderHistory() {
    const userEmail = JSON.parse(sessionStorage.getItem('userEmail'));
    if (userEmail) {
      this.orderHistoryService.getOrderHistory(userEmail).subscribe(
        response => {
          this.orderHistoryList = response._embedded.orders;
          console.log('Order History: ', this.orderHistoryList);
        }
      );
    } else {
      console.warn('No user email found in session storage.');
    }
  }
}
