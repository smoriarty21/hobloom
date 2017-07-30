import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Appliance } from './../classes/Appliance';

@Component({
  selector: 'light',
  templateUrl: 'assets/html/light.html',
  styleUrls: ['assets/css/light.css']
})
export class LightComponent  {
  @Input() light: Appliance;
  @Input() deleteMode: boolean;

  constructor() {
    this.deleteMode = false;
  }
}
