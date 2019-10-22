
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
