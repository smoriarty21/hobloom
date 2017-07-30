import { Component, Input, EventEmitter, Output } from '@angular/core';
import { LocationUtils } from '../classes/LocationUtils';
import { TemperatureUtils } from '../classes/TemperatureUtils';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'location',
  templateUrl: 'assets/html/location.html',
  styleUrls: ['assets/css/location.css']
})
export class LocationComponent  {
  lat: number;
  lng: number;
  zoom: number;
  currentTemp: number;
  currentHumidity: number;
  currentLocation: string;
  showEditLocation: boolean;
  enabled: boolean;
  @Input() showBlackout: boolean;
  @Output() showBlackoutChanged = new EventEmitter<boolean>();
  locationUtils: LocationUtils = new LocationUtils(51.67385, 7.815982);
  temperatureUtils: TemperatureUtils;

  constructor(private http: Http) {
    this.temperatureUtils = new TemperatureUtils();
    this.lat = this.locationUtils.getLat();
    this.lng = this.locationUtils.getLng();
    this.zoom = 8;
    this.locationUtils.setDisplayName('Swaziland')
    this.currentLocation = this.locationUtils.getDisplayName();
    this.showEditLocation = false;
  }

  private showEditLocationUI() {
    this.showEditLocation = true;
    this.showBlackout = true;
    this.showBlackoutChanged.emit(this.showBlackout);
  }

  private hideEditLocationUI() {
    this.showEditLocation = false;
    this.showBlackout = false;
    this.showBlackoutChanged.emit(this.showBlackout);
  }

  public test() {
    console.log(this.enabled);
  }

  public onEditLocationClick() {
    this.showEditLocationUI();
  }

  public onSetLocationClick() {
    this.lat = this.locationUtils.getLat();
    this.lng = this.locationUtils.getLng();
    this.getNameFromCoords(this.lat, this.lng);
    this.getCurrentLocationEnviroment();
    this.hideEditLocationUI()
  }

  public onCloseLocationClick() {
    this.hideEditLocationUI()
  }

  public mapMarkerDragEnd($event: any) {
    this.locationUtils.setLat($event.coords.lat);
    this.locationUtils.setLng($event.coords.lng);
  }

  private getNameFromCoords(lat: number, lng: number) {
    let coordsString = String(lat) + ',' + String(lng);
    this.http.get('http://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng=' + coordsString).
    map((responseData) => {
      var country = '';
      var locality = '';
      for (var i = 0; i < responseData.json().results[0].address_components.length; i++ ) {
        if (responseData.json().results[0].address_components[i].types.length > 0) {
          for (var x = 0; x < responseData.json().results[0].address_components[i].types.length; x++) {
            if (responseData.json().results[0].address_components[i].types[x] === 'country') {
              country = responseData.json().results[0].address_components[i].long_name;
              continue;
            }
            if (responseData.json().results[0].address_components[i].types[x] === 'locality') {
              locality = responseData.json().results[0].address_components[i].long_name;
              continue;
            }

            if (responseData.json().results[0].address_components[i].types[x] === 'administrative_area_level_1' && locality === '') {
              locality = responseData.json().results[0].address_components[i].long_name;
              continue;
            }
          }
        }
      }
      var displayName = '' + locality + ' ' + country;
      this.currentLocation = displayName;
      return displayName;
    }).
    subscribe( res => this.locationUtils.setDisplayName(res));
  }

  private getCurrentLocationEnviroment() {
    this.http.get('http://api.openweathermap.org/data/2.5/weather?lat=' + this.lat + '&lon=' + this.lng + '&APPID=9e1841b6d75b785e3e5d2b79e957e47b&units=metric').
    map((responseData) => {
      this.currentTemp = this.temperatureUtils.celciusToFarenheit(responseData.json().main.temp);
      this.currentHumidity = responseData.json().main.humidity;
      console.log('Temp: ' + this.currentTemp + ' | Humidity: ' + this.currentHumidity);
      return responseData;
    }).
    subscribe( res => {} );
  }
}
