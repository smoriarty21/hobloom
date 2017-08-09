import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AppComponent }  from './app.component';
import { SensorComponent }  from './components/sensor.component';
import { ApplianceComponent }  from './components/appliance.component';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { SliderModule } from 'primeng/primeng';
import { LightComponent } from "./components/light.component";
import { ClockComponent } from "./components/clock.component";
import { HumidifierComponent } from "./components/humidifier.component";
import { HeaterComponent } from "./components/heater.component";
import { AirConditionComponent } from "./components/airconditioner.component";
import { FanComponent } from "./components/fan.component";
import { HumidityReadingComponent } from "./components/humidityreading.component";
import { TemperatureReadingComponent } from "./components/temperature.component";
import { HumiditySettingsComponent } from "./components/humiditysettings.component";
import { HeatSettingsComponent } from "./components/heatsettings.component";
import { CurrentCycleComponent } from "./components/currentcycle.component";
import { DehumidifierComponent } from "./components/dehumidifier.component";
import { LocationComponent } from "./components/location.component";
import { SettingsComponent } from "./components/settings.component";
import { AgmCoreModule } from 'angular2-google-maps/core';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule,
    FormsModule,
    ChartsModule,
    SliderModule,
    AgmCoreModule
  ],
  declarations: [
    AppComponent,
    SensorComponent,
    ApplianceComponent,
    LightComponent,
    ClockComponent ,
    HumidifierComponent,
    HeaterComponent,
    AirConditionComponent,
    HumidityReadingComponent,
    HeatSettingsComponent,
    TemperatureReadingComponent,
    FanComponent,
    DehumidifierComponent,
    HumiditySettingsComponent,
    CurrentCycleComponent,
    LocationComponent,
    SettingsComponent
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
