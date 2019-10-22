import { Injectable, OnDestroy } from '@angular/core';
import { User } from '../model/user';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { Subject, Observable, Subscription } from 'rxjs';
import { Shipment } from '../model/shipment.model';
import { OrderStatus, Order } from '../model/order.model';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  private authData = new Subject<User>();
  authData$ = this.authData.asObservable();
  authStateSub: Subscription;

  constructor(
    private fireStore: AngularFirestore,
    private fireAuth: AngularFireAuth
  ) {
    this.authStateSub = this.fireAuth.authState.subscribe(userData => {
      if (userData) {
        const user: User = {
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
          uid: userData.uid,
        };
        this.authData.next(user);
      } else {
        this.authData.next(null);
      }
    });
  }

  ngOnDestroy() {
    if (this.authStateSub) {
      this.authStateSub.unsubscribe();
    }
  }

  shipments$(): Observable<Shipment[]> {
    return this.fireStore.collection<Shipment>('shipments').valueChanges();
  }

  orders$(userUid: string): Observable<Order[]> {
    const userDoc = this.fireStore.collection('users').doc(userUid);
    return userDoc.collection<Order>('orders').valueChanges();
  }

  googleAuth(): void {
    this.authLogin(new auth.GoogleAuthProvider());
  }

  loggout() {
    this.fireAuth.auth.signOut();
    this.authData.next(null);
  }

  private authLogin(provider: auth.AuthProvider): void {
    this.fireAuth.auth
      .signInWithPopup(provider)
      .then(result => {
        this.authData.next(result.user);
        this.setUserData(result.user);
      })
      .catch(error => {
        window.alert(error);
      });
  }

  private setUserData(fbuser: firebase.User): void {
    const ref: AngularFirestoreDocument<any> = this.fireStore.doc(
      `users/${fbuser.uid}`
    );
    const user: User = {
      uid: fbuser.uid,
      email: fbuser.email,
      displayName: fbuser.displayName,
      photoURL: fbuser.photoURL,
    };
    ref.set(user);
  }

  placeOrder(user: User, shipment: Shipment, orderAmount: number) {
    const order: Order = {
      shipmentUid: shipment.uid,
      shipmentDate: shipment.date,
      amount: orderAmount,
      status: OrderStatus.PENDING
    };
    const ref: AngularFirestoreDocument<any> = this.fireStore.doc(
      `users/${user.uid}/orders/${shipment.uid}`
    );
    ref.set(order, { merge: true });
  }
}
