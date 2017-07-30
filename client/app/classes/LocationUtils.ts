export class LocationUtils {
  lat: number;
  lng: number;
  displayName: string;

  constructor(lat: number, lng: number) {
    this.displayName = '';
    this.lat = lat;
    this.lng = lng;
  }

  public getLat(): number {
    return this.lat;
  }

  public setLat(lat: number) {
    this.lat = lat;
  }

  public getLng(): number {
    return this.lng;
  }

  public setLng(lng: number) {
    this.lng = lng;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public setDisplayName(name: string) {
    this.displayName = name;
  }
}
