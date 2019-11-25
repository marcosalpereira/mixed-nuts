import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { OrderComponent } from './components/order/order.component';
import { FormsModule } from '@angular/forms';
import { ShipmentStatusPipe } from './shared/pipes/shipment-status.pipe';
import { ShortNamePipe } from './shared/pipes/short-name.pipe';

@NgModule({
  declarations: [
    AppComponent,
    OrderComponent,
    ShipmentStatusPipe,
    ShortNamePipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
