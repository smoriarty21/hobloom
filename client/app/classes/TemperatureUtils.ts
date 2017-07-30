export class TemperatureUtils {

  constructor() {
  }

  public celciusToFarenheit(temp: number): number {
    return temp * 9 / 5 + 32;
  }
}
