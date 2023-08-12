import {ArrayHelper} from "@/ts/helpers/array.helper";

export class KeysHelper {
  static keys: string[] = [];

  public static onKeyDown(key: string): boolean {
    if (KeysHelper.keys.includes(key)) {
      return false;
    }
    KeysHelper.keys.push(key);
    return true;
  }

  public static onKeyUp(key: string): boolean {
    if (KeysHelper.keys.includes(key)) {
      ArrayHelper.remove(KeysHelper.keys, key);
      return true;
    }
    return false;
  }
}
