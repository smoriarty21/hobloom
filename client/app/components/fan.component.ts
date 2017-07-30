import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Appliance } from './../classes/Appliance';

@Component({
  selector: 'fan',
  templateUrl: 'assets/html/fan.html',
  styleUrls: ['assets/css/fan.css']
})
export class FanComponent  {
  @Input() fan: Appliance;
  @Input() deleteMode: boolean;

  constructor() {
    this.deleteMode = false;
  }
}
