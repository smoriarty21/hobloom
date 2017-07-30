import { Component, Input } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as GlobalConfig from './../classes/GlobalConfig';

@Component({
  selector: 'heat-settings',
  templateUrl: 'assets/html/heatsettings.html',
  styleUrls: ['assets/css/threshholdsettings.css', 'assets/css/heatsettings.css']
})
export class HeatSettingsComponent  {
  @Input() settings: Array<any>;
  minHeat: string;
  maxHeat: string;

  constructor(private http: Http) {
    this.updateSettings();
    setInterval(() => {
      this.updateSettings();
    }, 10000);
  }

  private updateSettings() {
    if (typeof this.settings === 'undefined' || !this.settings.length) {
      return;
    }
    let update: boolean = false;
    let minh: string = this.minHeat;
    let maxh: string = this.maxHeat;
    this.settings.forEach((setting: any) => {
      if (setting.key === 'MIN_HEAT') {
        if (setting.value !== this.minHeat && typeof this.minHeat !== 'undefined') {
          update = true;
        }
        this.minHeat = setting.value;
        return;
      }
      if (setting.key === 'MAX_HEAT') {
        if (setting.value !== this.maxHeat && typeof this.maxHeat !== 'undefined') {
          update = true;
        }
        this.maxHeat = setting.value;
        return;
      }
    });
    if (update) {
      this.updateSettingsInDB(minh, maxh);
    }
  }

  private updateSettingsInDB(minHeat: string, maxHeat: string) {
    var params = {
      settings: [
        { key: 'MIN_HEAT', value: minHeat },
        { key: 'MAX_HEAT', value: maxHeat }
      ]
    };
    this.http.put(GlobalConfig.BASE_URL + 'settings', params)
      .map( (responseData) => {
        return responseData.json().data;
      })
      .map((settings: Array<any>) => {
        if (settings) {
          settings.forEach((setting) => {
            if (setting.key == "MIN_HEAT") {
              this.minHeat = setting.value;
            } else if (setting.key == "MAX_HEAT") {
              this.maxHeat = setting.value;
            }
          });
          return settings;
        }
      })
      .subscribe( res => this.settings = res);
  }

  public changeHeat(isMax: boolean, increase: boolean) {
    if (isMax && increase) {
      this.maxHeat = String(Number(this.maxHeat) + 1);
      return;
    }
    if (isMax && !increase) {
      if ((Number(this.maxHeat) - 1)  <= Number(this.minHeat)) {
        return;
      }
      this.maxHeat = String(Number(this.maxHeat) - 1);
      return;
    }
    if (!isMax && increase) {
      if((Number(this.minHeat) + 1) >= Number(this.maxHeat)) {
        return;
      }
      this.minHeat = String(Number(this.minHeat) + 1);
      return;
    }
    if (!isMax && !increase) {
      this.minHeat = String(Number(this.minHeat) - 1);
      return;
    }
  }
}
