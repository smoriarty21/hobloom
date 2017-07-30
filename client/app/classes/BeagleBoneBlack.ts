export class BeagleBoneBlack {
  possiblePins: Array<string>;

  constructor() {
    this.possiblePins = [
      'P8_7',
      'P8_8',
      'P8_9',
      'P8_10',
      'P8_11',
      'P8_12',
      'P8_14',
      'P8_15',
      'P8_16',
      'P8_17',
      'P8_18',
      'P8_26',
      'P9_12',
      'P9_15',
      'P9_23',
      'P9_25',
      'P9_27',
      'P9_30',
      'P9_41'
    ];
  }

  public getAllPins(): Array<string> {
    return this.possiblePins;
  }
}
