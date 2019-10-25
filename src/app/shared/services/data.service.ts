import { map, flatMap, mergeMap } from 'rxjs/operators'
import { User } from './../model/user';
import { Shipment } from 'src/app/shared/model/shipment.model';
import { Injectable, OnDestroy } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
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
        };
        this.authData.next(user);
        this.shipmentOrders$(null);
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

  // private sub = new Subject<ShipmentOrder>();
  // sub$ = this.sub.asObservable();

  // shipmentOrders$(shipmentId: string): Observable<ShipmentOrder> {
  //   this.fireStore.collection<User>('users').valueChanges().toPromise().then(
  //     users => {
  //       users.forEach(user => {
  //         this.fireStore.doc(
  //           `users/${user.uid}/orders/${shipmentId}`
  //         ).get().toPromise().then(order => {
  //           const so = {order: order.data() as Order, user};
  //           this.sub.next(so);
  //         });
  //       });
  //     }
  //   );
  //   return this.sub$;
  // }

  shipmentOrders$(shipmentId: string) {
    // this.fireStore.collection<User>('users')
    //   .valueChanges().pipe(flatMap(us => us.map( async u => {
    //     const  o = await this.fireStore.doc(`users/${u.uid}/orders/${'eLLf6LpNAp7jtmeGb0ds'}`)
    //       .get().toPromise();
    //       return {order: o.data() as Order, user: u};

    //   })))
    //   .subscribe(o => console.log('o', o));

    this.fireStore.collection<User>('users')
      .valueChanges().pipe(
        mergeMap(users => {
          const a = users.map(user => {
            return this.fireStore.doc<Order>(`users/${user.uid}/orders/${'eLLf6LpNAp7jtmeGb0ds'}`).get();
          })
          return forkJoin(...a).pipe(
            map(o => {
              users.forEach((ori, index) => {
                ori['data'] = o[index].data();
              });
              return users;
            })
          )
        })
      ).subscribe(o => console.log('o', o));


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
