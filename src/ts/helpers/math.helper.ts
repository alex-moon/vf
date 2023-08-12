import {MathUtils} from "three";

export class MathHelper {
  private static c: {[key: string]: number} = {};

  public static addMod(a: number, b: number, m: number) {
    return (((a + b) % m) + m) % m;
  }

  public static clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  public static random(min: number, max: number, seed ?: number) {
    let rand = Math.random();
    if (seed) {
      MathHelper.c['' + seed] = MathHelper.c['' + seed] || 0;
      const c = MathHelper.c['' + seed] ++;
      rand = MathUtils.seededRandom(seed + c);
    }
    return rand * (max - min) + min;
  }

  public static cantor(a: number, b: number) {
    return (a + b + 1) * (a + b) / 2 + b;
  }

  public static rescale(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
    return (toMax - toMin) * (value - fromMin) / (fromMax - fromMin) + toMin;
  }

  public static seededRandom(seed: number) {
    return MathHelper.random(0, 1, seed);
  }
}
