import { Component, Input } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'current-cycle',
  templateUrl: 'assets/html/currentcycle.html',
  styleUrls: ['assets/css/currentcycle.css']
})
export class CurrentCycleComponent  {
  @Input() cycle: string;

  constructor() {
  }
}
