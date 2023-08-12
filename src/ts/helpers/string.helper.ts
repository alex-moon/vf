export class StringHelper {
  public static ucwords(str: string): string {
    return str.toLowerCase().replace(/(?<= )[^\s]|^./g, a=>a.toUpperCase())
  }

  public static formatNumber(value: number): string {
    if (value > 999) {
      return Math.round(value / 1000) + 'k';
    }
    return '' + value;
  }
}
