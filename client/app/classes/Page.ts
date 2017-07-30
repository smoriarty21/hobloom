export class Page {
  label: string;
  showing: boolean;

  constructor(label: string) {
    this.label = label;
    this.showing = false;
  }

  public getLabel(): string {
    return this.label;
  }

  public setShowing(showing: boolean) {
    this.showing = showing;
  }

  public getShowing(): boolean {
    return this.showing;
  }
}
