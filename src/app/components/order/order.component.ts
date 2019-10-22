import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/shared/model/user';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/services/data.service';
import { Shipment } from 'src/app/shared/model/shipment.model';
import { Order } from 'src/app/shared/model/order.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  user: User;
  orders: Order[];
  orderAmount = 0;
  authDataSub: Subscription;

  lastShipmentSub: Subscription;
  lastShipment: Shipment;

  constructor(
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.authDataSub = this.dataService.authData$.subscribe(
      user => {
        this.user = user;
        this.orders = user.orders;
        this.updateState();
      }
    );

    this.lastShipmentSub = this.dataService.shipments$().subscribe(
      shipments => {
        this.lastShipment = shipments.find(shipment => shipment.open);
        this.updateState();
      }
    );

  }

  updateState(): void {
    if (!this.lastShipment || !this.user) {
      setTimeout( () => this.updateState(), 500);
    } else {
      if (this.orders) {
        const order = this.orders.find(o => o.shipmentUid === this.lastShipment.uid);
        this.orderAmount = order ? order.amount : 0;
      }
    }

  }

  ngOnDestroy() {
    this.authDataSub.unsubscribe();
    this.lastShipmentSub.unsubscribe();
  }

  onClick(amount: number) {
    this.orderAmount = amount;
    this.dataService.placeOrder(this.user, this.lastShipment, this.orderAmount);
  }

  login() {
    this.dataService.googleAuth();
  }

  logout() {
    this.dataService.loggout();
  }

}
