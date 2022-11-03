import {Entity} from "@/ts/entities/entity";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {PointEvent} from "@/ts/events/point.event";
import {Object3D} from "three";
import {Body} from "cannon-es";

/**
 * Rationale: an entity controls things like movement at the scale of global space
 */
export abstract class Controller<E extends Entity> {
  protected entity: E;
  protected body!: Body;
  protected object!: Object3D;

  constructor(entity: E) {
    this.entity = entity;
  }

  public getEntity() {
    return this.entity;
  }

  public setObject(object: Object3D) {
    this.object = object;
  }

  public getObject() {
    return this.object;
  }

  public setBody(body: Body) {
    this.body = body;
  }

  public getBody() {
    return this.body;
  }

  public move(delta: number) {}

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
