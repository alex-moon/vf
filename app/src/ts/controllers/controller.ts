import {Entity} from "@/ts/entities/entity";
import * as THREE from "three";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";

export abstract class Controller<E extends Entity> {
  protected entity: E;

  constructor(entity: E) {
    this.entity = entity;
  }

  public getEntity() {
    return this.entity;
  }

  public onKeysChanged($event: KeysChangedEvent): void {
    this.entity.onKeysChanged($event);
  }

  public onPointerMove($event: MouseEvent): void {
    this.entity.onPointerMove($event);
  }

  public onPoint(point: THREE.Vector3): void {
    this.entity.onPoint(point);
  }
}
