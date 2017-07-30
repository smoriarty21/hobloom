import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Appliance } from './../classes/Appliance';

@Component({
  selector: 'air-conditioner',
  templateUrl: 'assets/html/airconditioner.html',
  styleUrls: ['assets/css/appliance-panel.css', 'assets/css/airconditioner.css']
})
export class AirConditionComponent  {
  @Input() ac: Appliance;
  @Input() deleteMode: boolean;

  constructor() {
    this.deleteMode = false;
  }
}
