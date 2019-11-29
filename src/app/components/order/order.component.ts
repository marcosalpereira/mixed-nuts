import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/shared/model/user';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/services/data.service';
import { Shipment } from 'src/app/shared/model/shipment.model';
import { Order, OrderStatus } from 'src/app/shared/model/order.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  appTitle = 'Mixed Nuts Ordering System';
  user: User;
  orderAmount = 0;
  authDataSub: Subscription;

  shipmentsSub: Subscription;
  activeShipment: Shipment;
  shipments: Shipment[] = [];
  orderSub: Subscription;
  shipmentOrders: Order[];
  totalShipmentOrder: number;
  shipmentOrdersSub: Subscription;
  itemRecemSelecionado = false;

  disableShortName = false;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.authDataSub = this.dataService.authData$.subscribe(user => {
      this.user = user;
      this.getShipments();
    });
  }

  changeOrderStatus(order: Order) {
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.DELIVERED;
      } else if  (order.status === OrderStatus.DELIVERED) {
        order.status = OrderStatus.PAID;
      } else {
        order.status = OrderStatus.PENDING;
      }
      this.dataService.updateOrderStatus(order.uid, this.activeShipment.id, order.status);
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
      this.shipmentOrdersSubUnsubcribe();
      this.shipmentOrdersSub = this.dataService.shipmentOrders$(this.activeShipment.id)
        .subscribe(orders => {
          this.shipmentOrders = orders;
          this.totalShipmentOrder = 0;
          this.orderAmount = 0;
          if (orders) {
            orders.forEach(order => this.totalShipmentOrder += order.amount);
            const userOrder = orders.find(order => order.uid === this.user.uid);
            this.orderAmount = userOrder ? userOrder.amount : 0;
          }
        }
      );
    }
  }

  private shipmentOrdersSubUnsubcribe() {
    if (this.shipmentOrdersSub) {
      this.shipmentOrdersSub.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.authDataSub) {
      this.authDataSub.unsubscribe();
    }
    this.shipmentsUnsubscribe();
    this.ordersUnsubscribe();
    this.shipmentOrdersSubUnsubcribe();
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

  onOrderClick(amount: number) {
    this.orderAmount = amount;
    this.dataService.placeOrder(this.user, this.activeShipment, this.orderAmount);
    this.itemRecemSelecionado = true;
    setTimeout( () => this.itemRecemSelecionado = false, 20000);
  }

  login() {
    this.dataService.googleAuth();
  }

  logout() {
    this.dataService.loggout();
  }
}
