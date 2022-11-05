export class MathHelper {
  public static addMod(a: number, b: number, m: number) {
    return (((a + b) % m) + m) % m;
  }

  public static clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }
}
