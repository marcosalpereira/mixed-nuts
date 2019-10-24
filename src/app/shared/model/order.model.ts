import { Shipment } from './shipment.model';
import { User } from './user';

export enum OrderStatus {
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    PAID = 'PAID'
}

export interface Order {
    amount: number;
    status: OrderStatus;
}

export interface ShipmentOrder {
    shipment: Shipment;
    user: User;
}
