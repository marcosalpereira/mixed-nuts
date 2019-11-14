import { Pipe, PipeTransform } from '@angular/core';
import { ShipmentStatus } from '../model/shipment.model';

@Pipe({
  name: 'shipmentStatus'
})
export class ShipmentStatusPipe implements PipeTransform {

  transform(status: ShipmentStatus): string {
    if (status === ShipmentStatus.OPEN) {
      return 'Aberto';
    }
    if (status === ShipmentStatus.BUYING) {
      return 'Comprando';
    }
    if (status === ShipmentStatus.CLOSED) {
      return 'Fechado';
    }
    return null;
  }

}
