export class NumberHelper {
  public static addMod(a: number, b: number, m: number) {
    return (((a + b) % m) + m) % m;
  }
}
