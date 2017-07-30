export class Sensor {
  id: string;
  type: string;
  pin: string;
  name: string;
  last_reading_time: string;
  last_reading: SensorReading;

  constructor(id: string, type: string, pin: string, name: string, last_reading_time: string, last_reading: SensorReading) {
    this.id = id;
    this.type = type;
    this.pin = pin;
    this.name = name;
    this.last_reading_time = last_reading_time;
    this.last_reading = last_reading;
  }

  private getPrettyType(): string {
    if (this.type == "dht11" || this.type == "dht22") {
      return this.type.charAt(0).toUpperCase() + this.type.charAt(1).toUpperCase() + this.type.charAt(2).toUpperCase() + this.type.slice(3);
    }
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }

  public getTemp(): number {
    return Math.floor(this.last_reading.fahrenheit);
  }

  public getHumidity(): number {
    return this.last_reading.humidity;
  }

  public getType(): string {
    return this.type;
  }
}

interface SensorReading {
  celsius: number;
  fahrenheit: number;
  humidity: number;
}
