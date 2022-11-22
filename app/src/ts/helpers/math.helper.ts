export class MathHelper {
  public static addMod(a: number, b: number, m: number) {
    return (((a + b) % m) + m) % m;
  }

  public static clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  public static random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  public static cantor(a: number, b: number) {
    return (a + b + 1) * (a + b) / 2 + b;
  }
}
