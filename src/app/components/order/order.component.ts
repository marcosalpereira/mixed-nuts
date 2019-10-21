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
  orderAmount: number;
  authDataSub: Subscription;
  openShipmentSub: Subscription;
  openShipment: Shipment;

  constructor(
    private dataService: DataService,
  ) {}

  ngOnInit() {
    this.authDataSub = this.dataService.authData$.subscribe(
      user => this.setUser(user));

      this.openShipmentSub = this.dataService.openShipment$(
        shipment => this.openShipment = shipment;
      )
  }

  setUser(user: User): void {
    this.user = user;
  }

  ngOnDestroy() {
    this.authDataSub.unsubscribe();
  }

  onClick(amount: number) {
    this.orderAmount = amount;
  }

  login() {
    this.dataService.googleAuth();
  }

}
