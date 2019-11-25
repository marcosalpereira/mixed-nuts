import { Order } from './order.model';

export enum ShipmentStatus {
    OPEN = 'OPEN',
    BUYING = 'BUYING',
    CLOSED = 'CLOSED'
}

export interface Shipment {
    id: string;
    date: string;
    status: ShipmentStatus;
}
