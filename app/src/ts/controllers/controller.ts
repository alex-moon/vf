import {Entity} from "@/ts/entities/entity";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {PointEvent} from "@/ts/events/point.event";
import {Object3D} from "three";
import {World} from "@/ts/world";

/**
 * Rationale: an entity controls things like movement at the scale of global space
 */
export abstract class Controller<E extends Entity> {
  protected entity: E;

  constructor(entity: E) {
    this.entity = entity;
  }

  public getEntity() {
    return this.entity;
  }

  public abstract getIntersectable(): Object3D;

  public move(delta: number, world: World) {}

  public onKeysChanged($event: KeysChangedEvent): void {
    this.entity.onKeysChanged($event);
  }

  public onPointerMove($event: MouseEvent): void {
    this.entity.onPointerMove($event);
  }

  public onPoint(point: PointEvent): void {
    this.entity.onPoint(point);
  }
}
