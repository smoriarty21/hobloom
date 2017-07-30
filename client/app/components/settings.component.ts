import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import * as GlobalConfig from './../classes/GlobalConfig';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'settings',
  templateUrl: 'assets/html/settings.html',
  styleUrls: [ 'assets/css/bootstrap.min.css', 'assets/css/settings.css' ],
})

export class SettingsComponent  {
  @Input() showHumiditySettings: boolean;
  @Output() sendHumiditySettingsUpdate = new EventEmitter<boolean>();
  @Output() sendMockLocationsUpdate = new EventEmitter<boolean>();
  @Output() closeWindows = new EventEmitter<boolean>();

  humiditySettingsEnabled: boolean;
  temperatureSettingsEnabled: boolean;
  mockLocationsEnabled: boolean;
  showDashboard: boolean;

  constructor(private http: Http) {
    this.showDashboard = true;
    this.humiditySettingsEnabled = this.showHumiditySettings;
    this.temperatureSettingsEnabled = false;
    this.mockLocationsEnabled = true;
  }

  public updateHumiditySettings(): void {
    var params = {};
    if (this.sendHumiditySettingsUpdate) {
      params = {
        settings: [
          { key: 'SHOW_SET_HUMIDITY', value: '1' }
        ]
      };
    } else {
      params = {
        settings: [
          { key: 'SHOW_SET_HUMIDITY', value: '0' }
        ]
      };
    }
    this.http.put(GlobalConfig.BASE_URL + 'settings', params)
    .map((responseData) => {
      return responseData.json().data;
    })
    .subscribe( res => {} );
    this.sendHumiditySettingsUpdate.emit(this.humiditySettingsEnabled);
  }

  public closeSettings() {
    this.closeWindows.emit();
  }

  public updateMockLocations() {
    this.sendMockLocationsUpdate.emit();
  }
}
