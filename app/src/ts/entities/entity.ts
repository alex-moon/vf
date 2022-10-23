import * as THREE from 'three';
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";

export abstract class Entity {
  public onKeysChanged($event: KeysChangedEvent): void {}
  public onPointerMove($event: MouseEvent): void {}
  public onPoint(point: THREE.Vector3): void {}
}
