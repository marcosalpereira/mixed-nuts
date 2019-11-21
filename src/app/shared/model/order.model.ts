
export enum OrderStatus {
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    PAID = 'PAID'
}

export interface Order {
    uid: string;
    amount: number;
    status: OrderStatus;

    _userName: string;
}

