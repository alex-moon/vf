/**
 * Rationale: a handler takes the intent of a controller and applies to it the
 * external forces to which it will be subject in the world
 *
 * Question: why not do this in the world? Well, because certain kinds of entities
 * will behave differently when subject to forces - the primary example is cameras,
 * which are not subject to gravity or friction and don't collide the same way as others
 */
import {World} from "@/ts/world";
import {Controller} from "@/ts/controllers/controller";
import {Body, Vec3} from "cannon-es";
import {Object3D} from "three";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {PointEvent} from "@/ts/events/point.event";

export abstract class Handler<C extends Controller<any>> {
  protected controller: C;

  public constructor(controller: C) {
    this.controller = controller;
  }

  public move(delta: number, world: World) {
    this.controller.move(delta);
    const object = this.controller.getObject();
    const body = this.controller.getBody();
    const offset = this.getOffset();
    object.position.set(
      body.position.x + offset.x,
      body.position.y + offset.y,
      body.position.z + offset.z
    );
    object.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
  }

  protected getOffset() {
    return new Vec3(0, 0, 0);
  }

  public getEntity() {
    return this.controller.getEntity();
  }

  public hasObject(object: Object3D, parent ?: Object3D) {
    if (!parent) {
      parent = this.getObject();
    }
    if (parent === object) {
      return true;
    }
    for (const child of parent.children) {
      if (this.hasObject(object, child)) {
        return true;
      }
    }
    return false;
  }

  public setObject(object: Object3D) {
    this.controller.setObject(object);
  }

  public getObject() {
    return this.controller.getObject();
  }

  public setBody(body: Body) {
    this.controller.setBody(body);
  }

  public getBody() {
    return this.controller.getBody();
  }

  public onKeysChanged($event: KeysChangedEvent): void {
    this.controller.onKeysChanged($event);
  }

  public onPointerMove($event: MouseEvent): void {
    this.controller.onPointerMove($event);
  }

  public onPoint(point: PointEvent): void {
    this.controller.onPoint(point);
  }
}
