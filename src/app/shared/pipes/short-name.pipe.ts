import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortName'
})
export class ShortNamePipe implements PipeTransform {

  transform(value: string, disabled: boolean): string {
    if (disabled) {
      return value;
    }
    const a = value.split(' ');
    if (a.length > 1) {
      return a[0] + ' ' + a[a.length - 1];
    }
    return value;
  }

}
