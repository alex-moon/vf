import {OreType} from "@/ts/enums/ore-type";

export class OreStore {
  private store = {
    [OreType.CARBON]: 0,
    [OreType.SILICA]: 0,
    [OreType.METAL]: 0,
    [OreType.WATER]: 0,
  };

  public get(type: OreType) {
    return this.store[type];
  }

  public add(type: OreType) {
    this.store[type]++;
  }

  public use(type: OreType, amount: number) {
    if (this.store[type] < amount) {
      throw new Error('Cannot use more ' + type + ' than you have');
    }
    this.store[type] -= amount;
  }

  public iterate() {
    const result = [];
    for (const key of Object.keys(this.store)) {
      result.push([key as string, this.store[key as OreType]]);
    }
    return result;
  }
}
