import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Appliance } from './../classes/Appliance';

@Component({
  selector: 'humidifier',
  templateUrl: 'assets/html/humidifier.html',
  styleUrls: ['assets/css/humidifier.css']
})
export class HumidifierComponent  {
  @Input() humidifier: Appliance;
  @Input() deleteMode: boolean;

  constructor() {
    this.deleteMode = false;
  }
}
