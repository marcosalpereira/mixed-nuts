
export enum OrderStatus {
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    PAID = 'PAID'
}

export interface Order {
    shipment: string;
    user: string;
    amount: number;
    status: OrderStatus;
}
