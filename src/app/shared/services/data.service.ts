import { map, flatMap, mergeMap } from 'rxjs/operators';
import { User } from './../model/user';
import { Shipment, ShipmentStatus } from 'src/app/shared/model/shipment.model';
import { Injectable, OnDestroy } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentSnapshot
} from '@angular/fire/firestore';
import { Subject, Observable, Subscription, of, forkJoin } from 'rxjs';
import { OrderStatus, Order} from '../model/order.model';

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
        this.getUserData(userData.uid).then(user => {
          console.log({user});
          this.authData.next(user);
        });
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

  private async getUserData(uid: string): Promise<User> {
    return this.fireStore.doc(`users/${uid}`)
      .get().pipe(
        map(snapshot => snapshot.data() as User)
      ).toPromise();
  }

  shipments$(): Observable<Shipment[]> {
    return this.fireStore.collection<Shipment>('remessas', qfn => qfn.orderBy('order', 'asc'))
      .valueChanges();
  }


  shipmentOrders$(shipmentId: string): Observable<Order[]> {
    const shipmentDoc = this.fireStore.collection('remessas').doc(shipmentId);
    return shipmentDoc.collection<Order>('orders', qfn => qfn.orderBy('_userName', 'asc')).valueChanges();
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
    ref.set(user, {merge: true});
  }

  placeOrder(user: User, shipment: Shipment, orderAmount: number) {
    const order: Order = {
      uid: user.uid,
      amount: orderAmount,
      status: OrderStatus.PENDING,
      _userName: user.displayName
    };
    const ref: AngularFirestoreDocument<any> = this.fireStore.doc(
      `remessas/${shipment.id}/orders/${user.uid}`
    );
    ref.set(order, { merge: true });
  }

  updateOrderStatus(uid: string, shipmentId: string, status: OrderStatus) {
    const ref: AngularFirestoreDocument<any> = this.fireStore.doc(
      `remessas/${shipmentId}/orders/${uid}`
    );
    ref.set({status}, { merge: true });
  }

  updateShipmentStatus(shipmentId: string, status: ShipmentStatus) {
    const ref: AngularFirestoreDocument<any> = this.fireStore.doc(
      `remessas/${shipmentId}`
    );
    ref.set({status}, { merge: true });
  }

}
