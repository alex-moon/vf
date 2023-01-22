import {OreType} from "@/ts/enums/ore-type";

export class OreStore {
  private store = {
    [OreType.CARBON]: 0,
    [OreType.SILICA]: 0,
    [OreType.METAL]: 0,
    [OreType.WATER]: 0,
  };

  public add(type: OreType) {
    this.store[type]++;
  }

  public use(type: OreType, amount: number) {
    if (this.store[type] < amount) {
      throw new Error('Cannot use more ' + type + ' than you have');
    }
    this.store[type] -= amount;
  }
}
