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

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private authData = new Subject<User>();
  authData$ = this.authData.asObservable();

  private openShipmentSubject = new Subject<Shipment>();
  private _openShipment$ = this.openShipmentSubject.asObservable();

  constructor(
    public fireStore: AngularFirestore,
    public fireAuth: AngularFireAuth,
  ) {
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.authData.next(user);
      } else {
        localStorage.setItem('user', null);
        this.authData.next(null);
      }
    });
  }

  openShipment$(): Observable<Shipment> {

    return this._openShipment$;
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

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  private setUserData(user): void {
    const userRef: AngularFirestoreDocument<any> = this.fireStore.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    userRef.set(userData, {
      merge: true
    });
  }

}
