import { Injectable } from '@angular/core';
import { User } from '../model/user';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { Subject, Observable } from 'rxjs';
import { Shipment } from '../model/shipment.model';
import { OrderStatus } from '../model/order.model';
import { filter } from 'minimatch';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private authData = new Subject<User>();
  authData$ = this.authData.asObservable();

  constructor(
    private fireStore: AngularFirestore,
    private fireAuth: AngularFireAuth,
  ) {
    this.fireAuth.authState.subscribe(userData => {
      if (userData) {
        const user: User = {
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
          uid: userData.uid,
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.authData.next(user);
      } else {
        localStorage.removeItem('user');
        this.authData.next(null);
      }
    });
  }

  // https://itnext.io/how-to-crud-in-angular-firebase-firestore-456353d7c62

  shipments$(): Observable<Shipment[]> {
    return this.fireStore.collection<Shipment>('shipments').valueChanges();
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  // Sign in with Google
  googleAuth(): void {
    this.authLogin(new auth.GoogleAuthProvider());
  }

  loggout() {
    this.fireAuth.auth.signOut();
  }

  // Auth logic to run auth providers
  private authLogin(provider): void {
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
    const userRef: AngularFirestoreDocument<any> = this.fireStore.doc(`users/${fbuser.uid}`);
    const user: User = {
      uid: fbuser.uid,
      email: fbuser.email,
      displayName: fbuser.displayName,
      photoURL: fbuser.photoURL
    };
    userRef.set(user);
  }

  placeOrder(user: User, shipment: Shipment, orderAmount: number) {
    if (!user.orders) { user.orders = []; }
    const orderIndex = user.orders.findIndex(o => o.shipmentUid === shipment.uid);
    console.log({orderIndex})
    if (orderIndex !== -1) {
      user.orders[orderIndex].amount = orderAmount;
    } else {
      user.orders.push({
        shipmentUid: shipment.uid,
        shipmentDate: shipment.date,
        amount: orderAmount,
        status: OrderStatus.PENDING,
      });
    }
    console.log( {user})
    this.fireStore.collection('users')
       .doc(user.uid)
       .set(user);
  }


}
