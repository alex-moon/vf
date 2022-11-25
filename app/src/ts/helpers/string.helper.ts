export class StringHelper {
  public static ucwords(str: string): string {
    return str.toLowerCase().replace(/(?<= )[^\s]|^./g, a=>a.toUpperCase())
  }
}
