import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'humidity-reading',
  templateUrl: 'assets/html/humidityreading.html',
  styleUrls: ['assets/css/humidityreading.css']
})
export class HumidityReadingComponent  {
  @Input() humidity: number;

  constructor() {

  }
}
