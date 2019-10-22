import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/shared/model/user';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/services/data.service';
import { Shipment } from 'src/app/shared/model/shipment.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  user: User;
  orderAmount = 0;
  authDataSub: Subscription;

  lastShipmentSub: Subscription;
  lastShipment: Shipment;

  constructor(
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.authDataSub = this.dataService.authData$.subscribe(
      user => this.setUser(user));

    this.lastShipmentSub = this.dataService.shipments$().subscribe(
      shipments => this.lastShipment = shipments.find(shipment => shipment.open)
    );

  }

  setUser(user: User): void {
    this.user = user;
  }

  ngOnDestroy() {
    this.authDataSub.unsubscribe();
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
