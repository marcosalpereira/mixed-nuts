import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Order } from 'src/app/shared/model/order.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  order: Order = {amount: 0};
  orders: Order[] = [
    { date: new Date(), amount: 1 },
    { date: new Date(), amount: 2 },
    { date: new Date(), amount: 1 },
    { date: new Date(), amount: 1 },
    { date: new Date(), amount: 1 },
    { date: new Date(), amount: 1 },
    { date: new Date(), amount: 1 },
    { date: new Date(), amount: 1 },
  ];

  constructor(public authService: AuthService) {}

  ngOnInit() {
  }

  onClick(amount: number) {
    this.order.amount = amount;
  }

}
