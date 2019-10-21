import { Order } from './order.model';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  orders?: Order[];
}
