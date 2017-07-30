export class Appliance {
  id: string;
  name: string;
  type: string;
  pin: string;
  running: boolean;

  constructor(id: string, type: string, pin: string, running: boolean, name: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.pin = pin;
    this.running = running;
  }

  public getType(): string {
    return this.type;
  }

  public getName(): string {
    return this.name;
  }

  public isRunning(): boolean {
    return this.running;
}

  private getPrettyType(): string {
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }
}
