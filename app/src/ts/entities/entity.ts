import * as THREE from 'three';
import {Intent} from "@/ts/entities/intent";

export abstract class Entity {
  public model: any;

  protected abstract path: string;
  protected abstract animations: string[];
  protected abstract intent: Intent;
  public getPath() {
    return this.path;
  }
  public getAnimation(key: string|null = null) {
    if (key === null) {
      key = this.intent.state;
    }
    return this.animations.indexOf(key);
  }
  public getIntent() {
    return this.intent;
  }
  public onKeyUp($event: KeyboardEvent): void {}
  public onKeyDown($event: KeyboardEvent): void {}
  public onPointerMove($event: MouseEvent): void {}
  public onPoint(point: THREE.Vector3): void {}
}
