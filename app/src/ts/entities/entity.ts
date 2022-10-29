import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {PointEvent} from "@/ts/events/point.event";

/**
 * Rationale: an entity controls things like movement at the scale of local space
 */
export abstract class Entity {
  public onKeysChanged($event: KeysChangedEvent): void {}
  public onPointerMove($event: MouseEvent): void {}
  public onPoint(point: PointEvent): void {}
}
