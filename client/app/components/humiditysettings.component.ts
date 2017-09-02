import { Component, Input } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as GlobalConfig from './../classes/GlobalConfig';

@Component({
  selector: 'humidity-settings',
  templateUrl: 'assets/html/humiditysettings.html',
  styleUrls: ['assets/css/threshholdsettings.css']
})
export class HumiditySettingsComponent  {
  @Input() settings: Array<any>;
  minHumidity: string;
  maxHumidity: string;

  constructor(private http: Http) {
    /*this.updateSettings();
    setInterval(() => {
      this.updateSettings();
    }, 30 * 1000);*/
    setInterval(() => {
      this.getSettings();
    }, 12 * 1000);
  }

  private updateSettings() {
    if (typeof this.settings === 'undefined' || !this.settings.length) {
      return;
    }
    let update: boolean = false;
    let minh: string = this.minHumidity;
    let maxh: string = this.maxHumidity;
    this.settings.forEach((setting: any) => {
      if (setting.key === 'MIN_HUMIDITY') {
        if (setting.value !== this.minHumidity && typeof this.minHumidity !== 'undefined') {
          update = true;
        }
        this.minHumidity = setting.value;
        return;
      }
      if (setting.key === 'MAX_HUMIDITY') {
        if (setting.value !== this.maxHumidity && typeof this.maxHumidity !== 'undefined') {
          update = true;
        }
        this.maxHumidity = setting.value;
        return;
      }
    });
    if (update) {
      this.updateSettingsInDB(minh, maxh);
    }
  }

  private updateSettingsInDB(minHumidity: string, maxHumidity: string) {
    var params = {
      settings: [
        { key: 'MIN_HUMIDITY', value: minHumidity },
        { key: 'MAX_HUMIDITY', value: maxHumidity }
      ]
    };
    this.http.put(GlobalConfig.BASE_URL + 'settings', params)
      .map( (responseData) => {
        return responseData.json().data;
      })
      .map((settings: Array<any>) => {
        if (settings) {
          settings.forEach((setting) => {
            if (setting.key == "MIN_HUMIDITY") {
              this.minHumidity = setting.value;
            } else if (setting.key == "MAX_HUMIDITY") {
              this.maxHumidity = setting.value;
            }
          });
          return settings;
        }
      })
      .subscribe( res => this.settings = res);
  }

  private getSettings() {
    this.http.get(GlobalConfig.BASE_URL + 'settings')
      .map( (responseData) => {
        return responseData.json().data;
      })
      .map( (responseData) => {
        for (var i = 0; i < responseData.length; i++) {
          console.log(responseData[i]);
          if (responseData[i].key === 'MIN_HUMIDITY') {
            this.minHumidity = responseData[i].value;
          } else if (responseData[i].key === 'MAX_HUMIDITY') {
            this.maxHumidity = responseData[i].value;
          }
        }
        return responseData;
      })
      .subscribe( res => this.settings = res);
  }

  public changeHumidity(isMax: boolean, increase: boolean) {
    if (isMax && increase) {
      this.maxHumidity = String(Number(this.maxHumidity) + 1);
      return;
    }
    if (isMax && !increase) {
      if ((Number(this.maxHumidity) - 1)  <= Number(this.minHumidity)) {
        return;
      }
      this.maxHumidity = String(Number(this.maxHumidity) - 1);
      return;
    }
    if (!isMax && increase) {
      if((Number(this.minHumidity) + 1) >= Number(this.maxHumidity)) {
        return;
      }
      this.minHumidity = String(Number(this.minHumidity) + 1);
      return;
    }
    if (!isMax && !increase) {
      this.minHumidity = String(Number(this.minHumidity) - 1);
      return;
    }
  }
}
