import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Appliance } from './../classes/Appliance';

@Component({
  selector: 'dehumidifier',
  templateUrl: 'assets/html/dehumidifier.html',
  styleUrls: ['assets/css/appliance-panel.css', 'assets/css/dehumidifier.css']
})
export class DehumidifierComponent  {
  @Input() dehumidifier: Appliance;
  @Input() deleteMode: boolean;

  constructor() {
    this.deleteMode = false;
  }
}
