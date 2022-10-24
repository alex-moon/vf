import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {PointEvent} from "@/ts/events/point.event";

export abstract class Entity {
  public onKeysChanged($event: KeysChangedEvent): void {}
  public onPointerMove($event: MouseEvent): void {}
  public onPoint(point: PointEvent): void {}
}
