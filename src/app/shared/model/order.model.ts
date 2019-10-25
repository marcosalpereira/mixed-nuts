import { Shipment } from './shipment.model';
import { User } from './user';

export enum OrderStatus {
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    PAID = 'PAID'
}

export interface Order {
    shipmentUid: string;
    amount: number;
    status: OrderStatus;

    shipmentDate: string;
}

export interface ShipmentOrder {
    user: User;
    order: Order;
}
