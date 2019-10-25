import { map, flatMap, mergeMap } from 'rxjs/operators';
import { User } from './../model/user';
import { Shipment } from 'src/app/shared/model/shipment.model';
import { Injectable, OnDestroy } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentSnapshot
} from '@angular/fire/firestore';
import { Subject, Observable, Subscription, of, forkJoin } from 'rxjs';
import { OrderStatus, Order, ShipmentOrder } from '../model/order.model';

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
          admin: userData.email.startsWith('marcosalpereira@'), // FIX this later
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

  userOrders$(uid: string): Observable<Order[]> {
    const userDoc = this.fireStore.collection('users').doc(uid);
    return userDoc.collection<Order>('orders').valueChanges();
  }

  shipmentOrders$(shipmentId: string): Observable<ShipmentOrder[]> {
    return this.fireStore.collection<User>('users')
      .valueChanges().pipe(
        mergeMap(users => {
          const orderObservable = users.map(user => {
            return this.fireStore.doc<Order>(`users/${user.uid}/orders/${shipmentId}`).get();
          });
          return forkJoin<DocumentSnapshot<Order>>(...orderObservable).pipe(
            map(ordersDocSnapshot => {
              return users.map((user, index) => {
                return {
                  user, order: ordersDocSnapshot[index].data()
                };
              });
            })
          );
        })
      );
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
      shipmentUid: shipment.id,
      shipmentDate: shipment.date,
      amount: orderAmount,
      status: OrderStatus.PENDING
    };
    const ref: AngularFirestoreDocument<any> = this.fireStore.doc(
      `users/${user.uid}/orders/${shipment.id}`
    );
    ref.set(order, { merge: true });
  }

}
