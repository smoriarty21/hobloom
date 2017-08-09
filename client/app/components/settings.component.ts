import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import * as GlobalConfig from './../classes/GlobalConfig';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'settings',
  templateUrl: 'assets/html/settings.html',
  styleUrls: [ 'assets/css/bootstrap.min.css', 'assets/css/settings.css' ],
})

export class SettingsComponent implements OnChanges {
  @Input() showHumiditySettings: boolean;
  @Input() showHeatSettings: boolean;
  @Output() sendHumiditySettingsUpdate = new EventEmitter<boolean>();
  @Output() sendHeatSettingsUpdate = new EventEmitter<boolean>();
  @Output() closeWindows = new EventEmitter<boolean>();

  humiditySettingsEnabled: boolean;
  temperatureSettingsEnabled: boolean;
  showDashboard: boolean;

  constructor(private http: Http) {
    this.showDashboard = true;
    this.humiditySettingsEnabled = this.showHumiditySettings;
    this.temperatureSettingsEnabled = this.showHeatSettings;
  }

  public ngOnChanges() {
    this.humiditySettingsEnabled = this.showHumiditySettings;
    this.temperatureSettingsEnabled = this.showHeatSettings;
  }

  public updateHumiditySettings(): void {
    var params = {
      settings: [
        { key: 'CONTROL_HUMIDITY', value: !this.showHumiditySettings }
      ]
    };
    this.http.put(GlobalConfig.BASE_URL + 'settings', params)
    .map((responseData) => {
      return responseData.json().data;
    })
    .subscribe( res => {} );
    this.sendHumiditySettingsUpdate.emit(this.humiditySettingsEnabled);
  }

  public updateHeatSettings(): void {
    var params = {
      settings: [
        { key: 'CONTROL_HEAT', value: !this.showHeatSettings }
      ]
    };
    this.http.put(GlobalConfig.BASE_URL + 'settings', params)
      .map((responseData) => {
        return responseData.json().data;
      })
      .subscribe( res => {} );
    this.sendHeatSettingsUpdate.emit(this.temperatureSettingsEnabled);
  }

  public closeSettings() {
    this.closeWindows.emit();
  }
}
