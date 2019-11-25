import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/shared/model/user';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/services/data.service';
import { Shipment } from 'src/app/shared/model/shipment.model';
import { Order, ShipmentOrder, OrderStatus } from 'src/app/shared/model/order.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  appTitle = 'Mixed Nuts Ordering System';
  user: User;
  orders: Order[];
  orderAmount = 0;
  authDataSub: Subscription;

  lastShipmentSub: Subscription;
  lastShipment: Shipment;
  orderSub: Subscription;
  shipmentOrders: ShipmentOrder[];
  totalShipmentOrder: number;
  shipmentOrdersSub: Subscription;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.authDataSub = this.dataService.authData$.subscribe(user => {
      this.user = user;
      if (user) {
        this.getOrders(user);
        this.getLastShipment();
      } else {
        this.orders = [];
      }
    });
  }

  changeOrderStatus(user: User, order: Order, event: MouseEvent) {

      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.DELIVERED;
      } else if  (order.status === OrderStatus.DELIVERED) {
        order.status = OrderStatus.PAID;
      } else {
        order.status = OrderStatus.PENDING;
      }
      this.dataService.updateOrderStatus(user.uid, order.shipmentUid, order.status);

  }

  private getLastShipment() {
    this.lastShipmentUnsubscribe();

    this.lastShipmentSub = this.dataService
      .shipments$()
      .subscribe(shipments => {
        this.lastShipment = shipments.find(shipment => shipment.status === 'OPEN' || shipment.status === 'BUYING');
        if (this.lastShipment) {
          this.shipmentOrdersSub = this.dataService.shipmentOrders$(this.lastShipment.id).subscribe(
            shipmentsOrders => {
              this.shipmentOrders = shipmentsOrders;
              this.totalShipmentOrder = 0;
              shipmentsOrders.forEach(so => this.totalShipmentOrder += so.order ? so.order.amount : 0);
            });
        }
        this.updateState();
      });
  }

  getOrders(user: User) {
    this.ordersUnsubscribe();
    this.orderSub = this.dataService.userOrders$(user.uid).subscribe(orders => {
      this.orders = orders;
      this.updateState();
    });
  }

  updateState(): void {
    if (!this.lastShipment || !this.orders) {
      setTimeout(() => this.updateState(), 500);
    } else {
      if (this.orders) {
        const order = this.orders.find(
          o => o.shipmentUid === this.lastShipment.id
        );
        this.orderAmount = order ? order.amount : 0;
      }
    }
  }

  ngOnDestroy() {
    if (this.authDataSub) {
      this.authDataSub.unsubscribe();
    }
    this.lastShipmentUnsubscribe();
    this.ordersUnsubscribe();
  }

  private ordersUnsubscribe() {
    if (this.orderSub) {
      this.orderSub.unsubscribe();
    }
  }

  private lastShipmentUnsubscribe() {
    if (this.lastShipmentSub) {
      this.lastShipmentSub.unsubscribe();
    }
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

  migrate() {
    this.dataService.migrate();
  }
}
