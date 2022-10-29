import {JackEntity} from "@/ts/entities/jack.entity";
import {JackController} from "@/ts/controllers/jack.controller";
import {BoxController} from "@/ts/controllers/box.controller";
import {BoxEntity} from "@/ts/entities/box.entity";
import {View} from "@/ts/view";
import {Controller} from "@/ts/controllers/controller";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CameraController} from "@/ts/controllers/camera.controller";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {PointEvent} from "@/ts/events/point.event";
import {Quaternion, Raycaster, Vector3} from "three";
import {Intersection} from "three/src/core/Raycaster";

export class World {
  protected view: View;
  protected controllers: Controller<any>[] = [];
  protected floor!: BoxController;
  protected jack!: JackController;
  protected camera!: CameraController;
  protected ready = false;

  protected raycaster = new Raycaster();

  constructor(view: View) {
    this.view = view;
    this.view.setWorld(this);
  }

  public init() {
    Promise.all([
      this.loadFloor(),
      this.loadJack(),
      this.loadCamera(),
    ]).then(() => {
      this.ready = true;
    });
  }

  public isReady() {
    return this.ready;
  }

  public getCamera() {
    return this.camera;
  }

  public getJack() {
    return this.jack;
  }

  protected loadCamera() {
    const entity = new CameraEntity();
    entity.setTarget(this.jack);
    this.camera = new CameraController(entity);
    this.controllers.push(this.camera);
    return this.view.load(this.camera);
  }

  protected loadJack() {
    this.jack = new JackController(new JackEntity());
    this.controllers.push(this.jack);
    return this.view.load(this.jack);
  }

  protected loadFloor() {
    this.floor = new BoxController(new BoxEntity(
      '/floor.png',
      1000,
      0,
      1000
    ));
    this.controllers.push(this.floor);
    return this.view.load(this.floor);
  }

  public onKeysChanged($event: KeysChangedEvent) {
    this.controllers.forEach(controller => controller.onKeysChanged($event));
  }

  public onPointerMove($event: MouseEvent) {
    this.controllers.forEach(controller => controller.onPointerMove($event));
  }

  public onPoint($event: PointEvent) {
    this.controllers.forEach(controller => controller.onPoint($event));
  }

  public move(delta: number) {
    this.controllers.forEach((controller) => {
      controller.move(delta, this);
    });
  }

  // @todo this is something you'd handle in the handler?
  public intersects(
    controller: Controller<any>,
    origin: Vector3,
    vector: Vector3,
    buffer: number = 0,
    exclude: Controller<any>[] = []
  ): Vector3|null {
    const objects = this.controllers
      .filter(candidate => candidate != controller && !exclude.includes(candidate))
      .map(candidate => candidate.getIntersectable());
    const length = vector.length();
    this.raycaster.set(origin, vector);
    const intersections = this.raycaster.intersectObjects(objects);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const distance = intersection.distance;
      if (distance - buffer < length) {
        this.debugIntersection(intersection);
        const multiple = (distance - buffer) / length;
        const resultant = vector.clone();
        resultant.multiplyScalar(multiple);
        const target = origin.clone();
        return target.add(resultant);
      }
    }
    return null;
  }

  protected debugIntersection(intersection: Intersection<any>) {
    (window as any).cunt = intersection;
    console.log('intersection on cunt');
  }
}
