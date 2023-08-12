export class ArrayHelper {
  public static remove(list: any[], element: any) {
    list.splice(list.indexOf(element), 1);
  }
}
