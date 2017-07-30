import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'clock',
  templateUrl: 'assets/html/clock.html',
  styleUrls: ['assets/css/clock.css']
})
export class ClockComponent  {
  currentDateObj: Date;
  date: string;
  time: string;

  constructor() {
    this.updateClock();
    setInterval(() => {
      this.updateClock();
    }, 3000);
  }


  private formatAMPM(date: Date): string {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var minuteString = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minuteString + ' ' + ampm;
    return strTime;
  }

  private updateClock() {
    let monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    this.currentDateObj = new Date();
    this.date = monthNames[this.currentDateObj.getMonth()] + ' ' + String(this.currentDateObj.getDate()) + ', ' + String(this.currentDateObj.getFullYear());
    this.time = this.formatAMPM(this.currentDateObj);
  }
}
