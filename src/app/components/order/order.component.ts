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

  constructor(public authService: AuthService) {}

  ngOnInit() {
  }

  onSubmit() {
  }

}
