import {Direction, DirectionKey} from "@/ts/enums/direction";

export class DirectionHelper {
  static delta = 0.0001;

  public static is(value: number, direction: Direction) {
    return Math.abs(direction - value) < DirectionHelper.delta;
  }

  public static fromKey(key: DirectionKey|null) {
    if (!key) {
      return null;
    }

    switch (key) {
      case DirectionKey.N:
        return Direction.N;
      case DirectionKey.E:
        return Direction.E;
      case DirectionKey.S:
        return Direction.S;
      case DirectionKey.W:
        return Direction.W;
      default:
        throw new Error('Invalid direction key: ' + key);
    }
  }

  public static fromKeys(zKey: DirectionKey|null, xKey: DirectionKey|null) {
    const z = DirectionHelper.fromKey(zKey);
    const x = DirectionHelper.fromKey(xKey);
    if (z === null) {
      return x;
    }
    if (x === null) {
      return z;
    }
    // @todo bullshit
    if (z === 0 && x > Math.PI) {
      return (x + (2 * Math.PI)) / 2;
    }
    return (x + z) / 2;
  }
}
