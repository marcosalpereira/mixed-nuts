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

  shipmentsSub: Subscription;
  activeShipment: Shipment;
  shipments: Shipment[];
  orderSub: Subscription;
  shipmentOrders: ShipmentOrder[];
  totalShipmentOrder: number;
  shipmentOrdersSub: Subscription;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.authDataSub = this.dataService.authData$.subscribe(user => {
      this.user = user;
      if (user) {
        this.getShipments();
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

  private getShipments() {
    this.shipmentsUnsubscribe();
    this.shipmentsSub = this.dataService
      .shipments$()
      .subscribe(shipments => {
        this.shipments = shipments;
        this.selectShipment(shipments.find(shipment =>
          shipment.status === 'OPEN' ||
          shipment.status === 'BUYING'));
      });
  }

  onShipmentClick(shipment: Shipment) {
    this.selectShipment(shipment);
  }

  private selectShipment(shipment: Shipment) {
    this.activeShipment = shipment;
    this.shipmentOrders = null;
    this.totalShipmentOrder = 0;
    if (shipment) {
      const shipmentOrdersSub = this.dataService.shipmentOrders$(this.activeShipment.id)
        .subscribe(shipmentsOrders => {
          this.shipmentOrders = shipmentsOrders;
          shipmentsOrders.forEach(so => this.totalShipmentOrder += so.order ? so.order.amount : 0);
          shipmentOrdersSub.unsubscribe();
        }
      );
    }
  }

  // private getOrdersHistory(user: User) {
  //   this.ordersUnsubscribe();
  //   this.orderSub = this.dataService.userOrders$(user.uid).subscribe(orders => {
  //     this.orders = orders;
  //     this.updateState();
  //   });
  // }

  // updateState(): void {
  //   if (!this.activeShipment || !this.orders) {
  //     setTimeout(() => this.updateState(), 500);
  //   } else {
  //     if (this.orders) {
  //       const order = this.orders.find(
  //         o => o.shipmentUid === this.activeShipment.id
  //       );
  //       this.orderAmount = order ? order.amount : 0;
  //     }
  //   }
  // }

  ngOnDestroy() {
    if (this.authDataSub) {
      this.authDataSub.unsubscribe();
    }
    this.shipmentsUnsubscribe();
    this.ordersUnsubscribe();
  }

  private ordersUnsubscribe() {
    if (this.orderSub) {
      this.orderSub.unsubscribe();
    }
  }

  private shipmentsUnsubscribe() {
    if (this.shipmentsSub) {
      this.shipmentsSub.unsubscribe();
    }
  }

  onClick(amount: number) {
    this.orderAmount = amount;
    this.dataService.placeOrder(this.user, this.activeShipment, this.orderAmount);
  }

  login() {
    this.dataService.googleAuth();
  }

  logout() {
    this.dataService.loggout();
  }
}
