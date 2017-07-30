import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'temperature-reading',
  templateUrl: 'assets/html/tempreading.html',
  styleUrls: ['assets/css/tempreading.css']
})
export class TemperatureReadingComponent  {
  @Input() temperature: number;

  constructor() {

  }
}
