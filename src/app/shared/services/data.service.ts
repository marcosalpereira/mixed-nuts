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
import { OrderStatus } from '../model/order.model';

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
    this.authStateSub = this.fireAuth.authState.subscribe(async userData => {
      if (userData) {
        const user = await this.getUser(userData.uid);
        this.authData.next(user);
      } else {
        this.authData.next(null);
      }
    });
  }

  private async getUser(uid: string): Promise<User> {
    const userDoc = this.fireStore.collection('users').doc(uid);
    return userDoc.get().toPromise().then(doc => Promise.resolve(doc.data() as User));
  }

  ngOnDestroy() {
    if (this.authStateSub) {
      this.authStateSub.unsubscribe();
    }
  }

  shipments$(): Observable<Shipment[]> {
    return this.fireStore.collection<Shipment>('shipments').valueChanges();
  }

  googleAuth(): void {
    this.authLogin(new auth.GoogleAuthProvider());
  }

  loggout() {
    this.fireAuth.auth.signOut();
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
    const userRef: AngularFirestoreDocument<any> = this.fireStore.doc(
      `users/${fbuser.uid}`
    );
    const user: User = {
      uid: fbuser.uid,
      email: fbuser.email,
      displayName: fbuser.displayName,
      photoURL: fbuser.photoURL,
      orders: []
    };
    userRef.set(user);
  }

  placeOrder(user: User, shipment: Shipment, orderAmount: number) {
    if (!user.orders) {
      user.orders = [];
    }
    const orderIndex = user.orders.findIndex(
      o => o.shipmentUid === shipment.uid
    );
    if (orderIndex !== -1) {
      user.orders[orderIndex].amount = orderAmount;
    } else {
      user.orders.push({
        shipmentUid: shipment.uid,
        shipmentDate: shipment.date,
        amount: orderAmount,
        status: OrderStatus.PENDING
      });
    }
    this.fireStore
      .collection('users')
      .doc(user.uid)
      .set(user);
  }
}
