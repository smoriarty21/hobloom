export class LogData {
  id: number;
  timestamp: string;
  humidity: number;
  temperature: number;
  appliances_on: string;
  appliances_off: string;

  constructor(id: number, temp: number, humidity: number, appliances_on: string, appliances_off: string, time: string) {
    this.id = id;
    this.temperature = temp;
    this.humidity = humidity;
    this.appliances_on = appliances_on;
    this.appliances_off = appliances_off;
    this.timestamp = time;
  }
}
