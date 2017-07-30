import { Component } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Sensor } from './../classes/Sensor';
import * as GlobalConfig from './../classes/GlobalConfig';

@Component({
  selector: 'sensor',
  templateUrl: 'assets/html/sensor.html',
  styleUrls: ['assets/css/sensor.css'],
})
export class SensorComponent  {
  sensors: Array<Sensor>;
  maxHumidity: number;
  minHumidity: number;
  settings: Array<any>;

  constructor(private http: Http) {
    this.getSettings();
    setInterval(() => {
      this.settingsCheckLoop();
    }, 30000);

    this.getSensors();
    setInterval(() => {
      this.getSensors();
    }, 10000);
  }

  private getSensors() {
    this.http.get(GlobalConfig.BASE_URL + 'sensor')
      .map( (responseData) => {
        return responseData.json().data;
      })
      .map((sensors: Array<any>) => {
        let result:Array<Sensor> = [];
        if (sensors) {
          sensors.forEach((sensor) => {
            result.push(new Sensor(sensor.id, sensor.type, sensor.pin, sensor.name, sensor.last_reading_time, sensor.last_reading));
          });
          return result;
        }
      })
      .subscribe( res => this.sensors = res);
  }

  private settingsCheckLoop() {
    if (this.checkForSettingsUpdate()) {
      console.log('update me');
      this.updateSettings();
    }
  }

  private checkForSettingsUpdate() {
    if (this.settings) {
      for (var i = 0; i < this.settings.length; i++) {
        if (this.settings[i].key == "MIN_HUMIDITY") {
          if (Number(this.minHumidity) != Number(this.settings[i].value)) {
            return true;
          }
        } else if (this.settings[i].key == "MAX_HUMIDITY") {
          if (this.maxHumidity != this.settings[i].value) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private updateSettings() {
    console.log('update ap[i call');
    var params = {
      settings: [
        { key: 'MIN_HUMIDITY', value: this.minHumidity },
        { key: 'MAX_HUMIDITY', value: this.maxHumidity }
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

  public changeHumidity(isMax: boolean, increase: boolean) {
    if (isMax && increase) {
      this.maxHumidity = Number(this.maxHumidity) + 1;
      return;
    }
    if (isMax && !increase) {
      if ((Number(this.maxHumidity) - 1)  <= this.minHumidity) {
        return;
      }
      this.maxHumidity = Number(this.maxHumidity) - 1;
      return;
    }
    if (!isMax && increase) {
      if((Number(this.minHumidity) + 1) >= this.maxHumidity) {
        return;
      }
      this.minHumidity = Number(this.minHumidity) + 1;
      return;
    }
    if (!isMax && !increase) {
      this.minHumidity = Number(this.minHumidity) - 1;
      return;
    }
  }
}
