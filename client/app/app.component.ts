import { Component } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Router } from './classes/Router';
import { LogData } from './classes/LogData';
import { Sensor } from './classes/Sensor';
import { Appliance } from './classes/Appliance';
import { BeagleBoneBlack } from './classes/BeagleBoneBlack';
import * as GlobalConfig from './classes/GlobalConfig';

@Component({
  selector: 'my-app',
  templateUrl: 'assets/html/dashboard.html',
  styleUrls: [ 'assets/css/bootstrap.min.css', 'assets/css/dashboard.css' ]
})

export class AppComponent  {
  currentDeleteId: any;
  selectedDeviceType: any;
  router: Router;
  appliances: Array<Appliance>;
  lights: Array<Appliance>;
  humidifiers: Array<Appliance>;
  heaters: Array<Appliance>;
  airConditioners: Array<Appliance>;
  dehumidifiers: Array<Appliance>;
  fans: Array<Appliance>;
  sensors: Array<Sensor>;
  settings: Array<any>;
  deviceTypes: Array<any>;
  logTableData: Array<any>;
  applianceTypes: Array<string>;
  addDeviceType: Array<string>;
  sensorTypes: Array<string>;
  allPins: Array<string>;
  startDayTimes: Array<string>;
  endDayTimes: Array<string>;
  currentAppliance: Appliance;
  currentSensor: Sensor;
  bbb: BeagleBoneBlack;
  humidity: number;
  temperature: number;
  dayStart: number;
  dayEnd: number;
  currentCycle: string;
  selectedDayStart: string;
  selectedDayEnd: string;
  selectedDayStartChange: string;
  selectedDayEndChange: string;
  createDeviceType: string;
  confirmDialogText: string;
  currentDeleteName: string;
  createDevicePin: string;
  addDeviceNameInput: string;
  showBlackout: boolean;
  showEditAppliance: boolean;
  showConfirmDialog: boolean;
  showEditSensor: boolean;
  showCreateAppliance: boolean;
  showCreateSensor: boolean;
  showSettings: boolean;
  showHumiditySettings: boolean;
  showHeatSettings: boolean;
  //showMockLocations: boolean;
  showDeviceAddContainer: boolean;
  deleteMode: boolean;
  showAddDeviceTypeSelect: boolean;
  showConfirmDelete: boolean;
  showCycleTimeSettings: boolean;

  constructor(private http: Http) {
    this.router = new Router();
    this.showBlackout = false;
    this.showEditAppliance = false;
    this.showConfirmDialog = false;
    this.showCreateAppliance = false;
    this.showCreateSensor = false;
    this.showEditSensor = false;
    this.showSettings = false;
    this.currentAppliance = null;
    this.currentSensor = null;
    this.showDeviceAddContainer = false;
    this.showAddDeviceTypeSelect = false;
    this.confirmDialogText = '';
    this.applianceTypes = [ 'light', 'exhaust', 'intake', 'humidifier' ];
    this.sensorTypes = [ 'dht11', 'dht22', 'fire' ];
    this.deviceTypes = [ 'Select Device Type', 'Sensor', 'Appliance' ];
    this.selectedDeviceType = this.deviceTypes[0];
    this.addDeviceType = [ 'Select Sensor Type', 'Temp/Humidity', 'Fire' ];
    this.createDeviceType = this.addDeviceType[0];
    this.bbb = new BeagleBoneBlack();
    this.allPins = this.bbb.getAllPins();
    this.allPins.unshift('Select Pin');
    this.createDevicePin = this.allPins[0];
    this.addDeviceNameInput = '';
    this.deleteMode = false;
    this.currentDeleteId = null;
    this.currentDeleteName = '';
    this.showConfirmDelete = false;

    this.getCurrentCycle();
    setInterval(() => {
      this.getCurrentCycle();
    }, 5 * 60000);
    this.getAppliances();
    this.getSensors();
    this.getLogData();
    this.getSettings();
    setInterval(() => {
      this.getAppliances();
      this.getSensors();
      if (this.router.isLog) {
        this.getLogData();
      }
    }, 30000);
    setInterval(() => {
      this.getEnviromentInfo();
    }, 64000);
    this.getEnviromentInfo();
  }

  private setupCycleTimesSettings() {
    this.startDayTimes = new Array<string>();
    this.endDayTimes = new Array<string>();
    var daystartSet: boolean = false;
    for (var i = 0; i < 25; i++) {
      if (i == this.dayStart) {
        daystartSet = true;
        if (i < 10) {
          this.selectedDayStart = "0" + String(i) + ":00";
        } else {
          this.selectedDayStart = String(i) + ":00";
        }

      }
      if (i < 10) {
        this.startDayTimes.push("0" + String(i) + ":00");
      } else {
        this.startDayTimes.push(String(i) + ":00");
      }

      if (daystartSet && i != this.dayStart) {
        if (i == this.dayEnd) {
          if (i < 10) {
            this.selectedDayEnd = "0" + String(i) + ":00";
          } else {
            this.selectedDayEnd = String(i) + ":00";
          }
        }
        if (i < 10) {
          this.endDayTimes.push("0" + String(i) + ":00");
          continue;
        }
        this.endDayTimes.push(String(i) + ":00");
      }
    }
  }

  private getCurrentCycle() {
    this.http.get(GlobalConfig.BASE_URL + 'cycle').
    map( (responseData) => {
      return responseData.json().data;
    }).
    map((response: any) => {
      return response.current_cycle;
    }).
    subscribe( res => this.currentCycle = res);
  }

  public showAddDeviceContainer() {
    this.closeAllWindows();
    this.showBlackout = true;
    this.showDeviceAddContainer = true;
  }

  public showSettingsUI() {
    this.showBlackout = true;
    this.showSettings = true;
  }

  public showCycleTimesUI() {
    this.showBlackout = true;
    this.showCycleTimeSettings = true;
  }

  public hideChangeCycleTimeUI() {
    this.showBlackout = false;
    this.showCycleTimeSettings = false;
  }

  public showAddDeviceUI() {
    this.showBlackout = true;
    this.showAddDeviceTypeSelect = true;
  }

  public hideAddDeviceUI() {
    this.closeAllWindows();
  }

  public closeAllWindows(): void {
    this.showBlackout = false;
    this.showSettings = false;
    this.showAddDeviceTypeSelect = false;
    this.showDeviceAddContainer = false;
    this.showConfirmDelete = false;
    this.showCycleTimeSettings = false;
  }

  public showConfirmDeleteDialog() {
    this.showConfirmDelete = true;
    this.showBlackout = true;
  }

  public goToAddSensorType() {
    if (this.selectedDeviceType == this.deviceTypes[0]) {
      return;
    }
    if (this.selectedDeviceType == this.deviceTypes[1]) {
      // Sensor
      this.addDeviceType = [ 'Select Sensor Type', 'Temp/Humidity', 'Fire' ];
    }
    if (this.selectedDeviceType == this.deviceTypes[2]) {
      // Appliance
      this.addDeviceType = [ 'Select Sensor Type', 'Humidifier', 'Dehumidifier', 'Light', 'Intake Fan', 'Exhaust Fan', 'Heater', 'A/C', 'Far Red Light' ];
    }
    this.createDeviceType = this.addDeviceType[0];
    this.closeAllWindows();
    this.showAddDeviceContainer();
  }

  /*public updateMockLocationsUI(event: boolean) {
    this.showMockLocations = event;
  }*/

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
      .map((appliances: Array<Appliance>) => {
        this.updateLights(appliances);
        this.humidifiers = this.getApplianceByType(appliances, 'humidifier');
        this.heaters = this.getApplianceByType(appliances, 'heater');
        this.airConditioners = this.getApplianceByType(appliances, 'ac');
        this.dehumidifiers = this.getApplianceByType(appliances, 'dehumidifier');
        this.fans = this.getFans(appliances);
        return appliances;
      })
      .subscribe( res => this.appliances = res);
  }

  private getSensors() {
    this.http.get(GlobalConfig.BASE_URL + 'sensor')
      .map( (responseData) => {
        return responseData.json().data;
      })
      .map((sensors: Array<any>) => {
        let result:Array<Sensor> = [];
        if (sensors) {
          let temp = 0;
          let humidity = 0;
          let dht_sensors = 0;

          sensors.forEach((sensor) => {
            let sensorObj = new Sensor(sensor.id, sensor.type, sensor.pin, sensor.name, sensor.last_reading_time, sensor.last_reading);
            if ((sensor.type === 'dht11' || sensor.type === 'dht22') && sensor.last_reading && sensor.last_reading.humidity && sensor.last_reading.fahrenheit) {
              dht_sensors++;
              temp += sensorObj.getTemp();
              humidity += sensorObj.getHumidity();
            }
            result.push(sensorObj);
          });
          this.temperature = Math.floor(temp / dht_sensors);
          this.humidity = Math.floor(humidity / dht_sensors);
          return result;
        }
      })
      .subscribe(res => this.sensors = res);
  }

  getLogData() {
    this.http.get(GlobalConfig.BASE_URL + 'report')
    .map((responseData) => {
      if (responseData.json().data.length) {
        return responseData.json().data.reverse();
      }
      return {};
    })
    .map((resData: Array<any>) => {
      let result:Array<LogData> = [];
      if (resData.length > 0) {
        resData.forEach((d) => {
          result.push(new LogData(d.id, d.temperature, d.humidity, d.appliances_on, d.appliances_off, d.timestamp));
        });
        return result;
      }
    })
    .subscribe(res => this.logTableData = res);
  }

  getFans(appliances: Array<Appliance>) {
    let fans = Array();
    if (typeof appliances == 'undefined') {
      return;
    }
    appliances.forEach((appliance: Appliance) => {
      if (appliance.type == 'exhaust' || appliance.type == 'intake') {
        fans.push(appliance);
      }
    });
    return fans;
  }

  getApplianceByType(appliances: Array<Appliance>, type: String) {
    let arr = Array();
    if (typeof appliances == 'undefined') {
      return;
    }
    appliances.forEach((appliance: Appliance) => {
      if (appliance.getType() === type) {
        arr.push(appliance);
      }
    });
    return arr;
  }

  public updateHumiditySettingsUI(event: boolean) {
    this.showHumiditySettings = !event;
  }

  public updateHeatSettingsUI(event: boolean) {
    this.showHeatSettings = !event;
  }

  private getSettings() {
    this.http.get(GlobalConfig.BASE_URL + 'settings')
      .map( (responseData) => {
        return responseData.json().data;
      })
      .map( (responseData) => {
        for (var i = 0; i < responseData.length; i++) {
          if (responseData[i].key === 'CONTROL_HUMIDITY') {
            this.showHumiditySettings = responseData[i].value == 'true';
            console.log(this.showHumiditySettings);
          } else if (responseData[i].key === 'CONTROL_HEAT') {
            this.showHeatSettings = responseData[i].value == 'true';
          } else if (responseData[i].key === 'START_DAY') {
            this.dayStart = responseData[i].value;
          } else if (responseData[i].key === 'END_DAY') {
            this.dayEnd = responseData[i].value;
          }
        }
        this.setupCycleTimesSettings();
        return responseData;
      })
      .subscribe( res => this.settings = res);
  }

  private updateLights(appliances: Array<Appliance>) {
    this.lights = new Array<Appliance>();
    if (typeof appliances == 'undefined') {
      return;
    }
    if (appliances.length) {
      appliances.forEach((appliance: any) => {
        if (appliance.getType() == 'light' || appliance.getType() == 'far_red_light') {
          this.lights.push(appliance);
        }
      });
    }
  }

  public onEditLocationClick(event: boolean) {
    this.showBlackout = event;
  }

  public onAddDeviceClick() {
    if (this.addDeviceNameInput == '' || this.createDevicePin == this.allPins[0] || this.createDeviceType == this.addDeviceType[0]) {
      return;
    }
    this.updateAssetOnServer();
    this.closeAllWindows();
  }

  private updateAssetOnServer() {
    var type = '';
    switch (this.createDeviceType) {
      case ('Temp/Humidity'):
        type = 'dht22';
        break;
      case ('Fire'):
        type = 'fire';
        break;
      case ('Humidifier'):
        type = 'humidifier';
        break;
      case ('Dehumidifier'):
        type = 'dehumidifier';
        break;
      case ('Intake Fan'):
        type = 'intake';
        break;
      case ('Exhaust Fan'):
        type = 'exhaust';
        break;
      case ('Far Red Light'):
        type = 'far_red_light';
        break;
      case ('Heater'):
        type = 'heater';
        break;
      case ('A/C'):
        type = 'ac';
        break;
      case ('Light'):
        type = 'light';
        break;
    }
    var params = {
      pin: this.createDevicePin,
      type: type,
      name: this.addDeviceNameInput
    };
    this.http.post(GlobalConfig.BASE_URL + 'asset', params)
    .map( (responseData) => {
      return responseData.json().data;
    })
    .map( (responseData) => {
      this.getAppliances();
      this.getSensors();
      return responseData;
    })
    .subscribe( res => this.settings = res);
  }

  public showDeletePanels() {
    this.deleteMode = this.deleteMode != true;
  }

  public deleteClick(id: any, name: string) {
    if (!this.deleteMode) {
      return;
    }
    this.currentDeleteId = id;
    this.currentDeleteName = name;
    this.showConfirmDeleteDialog();
  }

  public deleteAsset() {
    this.http.delete(GlobalConfig.BASE_URL + 'asset/' + this.currentDeleteId)
    .map(() => {
      this.getAppliances();
      this.getSensors();
      this.closeAllWindows();
    })
    .subscribe( res => {} );
  }

  public onDayEndChange(value: string) {
    this.selectedDayEndChange = value;
  }

  public onDayStartChange(value: string) {
    this.selectedDayStartChange = value;
  }

  public updateCycleTimeSettings() {
    var settings: Array<any> = [];
    if (typeof this.selectedDayStartChange != 'undefined') {
      if (this.selectedDayStartChange.indexOf(this.selectedDayStart) == -1) {
        var time = this.selectedDayStartChange.split(':')[1].trim();
        if (time.startsWith('0')) {
          time = time.split('0')[1];
        }
        console.log(time);
        settings.push({ key: 'START_DAY', value: time });
      }
    }

    if (typeof this.selectedDayEndChange != 'undefined') {
      if (this.selectedDayEndChange.indexOf(this.selectedDayEnd) == -1) {
        var time = this.selectedDayEndChange.split(':')[1].trim();
        if (time.startsWith('0')) {
          time = time.split('0')[1];
        }
        console.log(time);
        settings.push({ key: 'END_DAY', value: time });
      }
    }
    var params = {
      settings: settings
    };
    this.http.put(GlobalConfig.BASE_URL + 'settings', params)
    .map( (responseData) => {
      return responseData.json().data;
    })
    .map((settings: Array<any>) => {
      if (settings) {
        settings.forEach((setting) => {
          if (setting.key == "START_DAY") {
            this.dayStart = setting.value;
          } else if (setting.key == "END_DAY") {
            this.dayEnd = setting.value;
          }
        });
        return settings;
      }
    })
    .subscribe( res => this.settings = res);
  }

  public lineChartData:Array<any> = [ { data: [ 80 ] }, { data: [ 80 ] } ];
  public lineChartLabels:Array<any> = [''];
  public lineChartOptions:any = {
    responsive: true,
    legend: { display: false }
  };
  public lineChartColors:Array<any> = [
    {
      backgroundColor: 'rgba(0,122,255,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    {
      backgroundColor: 'rgba(255,82,79,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

  private getEnviromentInfo() {
    this.lineChartLabels = [];
    this.http.get(GlobalConfig.BASE_URL + 'report/enviroment').
    map( (responseData) => {
      return responseData.json().data;
    }).
    map((response: any) => {
      this.lineChartData = [
        {data: response.humidity},
        {data: response.temp }
      ];
      for (var i = 0; i < this.lineChartData[0].data.length; i++) {
        this.lineChartLabels.push('');
      }
      return this.lineChartData;
    }).
    subscribe( res => {});
  }
}
