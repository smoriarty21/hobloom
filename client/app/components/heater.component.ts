import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Appliance } from './../classes/Appliance';

@Component({
  selector: 'heater',
  templateUrl: 'assets/html/heater.html',
  styleUrls: ['assets/css/appliance-panel.css', 'assets/css/heater.css']
})
export class HeaterComponent  {
  @Input() heater: Appliance;
  @Input() deleteMode: boolean;

  constructor() {
    this.deleteMode = false;
  }
}
