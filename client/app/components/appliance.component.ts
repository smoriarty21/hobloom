import { Component } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Appliance } from './../classes/Appliance';
import * as GlobalConfig from './../classes/GlobalConfig';

@Component({
  selector: 'appliance',
  templateUrl: 'assets/html/appliance.html',
})
export class ApplianceComponent  {
  appliances: Array<Appliance>;

  constructor(private http: Http) {
    this.getAppliances();
    setInterval(() => {
      this.getAppliances();
    }, 10000);
  }

  private getAppliances() {
    this.http.get(GlobalConfig.BASE_URL + 'appliance')
      .map( (responseData) => {
        return responseData.json().data;
      })
      .map((appliances: Array<any>) => {
        let result:Array<Appliance> = [];
        if (appliances) {
          appliances.forEach((appliance) => {
            result.push(new Appliance(appliance.id, appliance.type, appliance.pin, appliance.running, appliance.name));
          });
          return result;
        }
      })
      .subscribe( res => this.appliances = res);
  }
}
