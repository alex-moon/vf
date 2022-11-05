import {JackEntity} from "@/ts/entities/jack.entity";
import {JackHandler} from "@/ts/handlers/jack.handler";
import {View} from "@/ts/view";
import {Handler} from "@/ts/handlers/handler";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {PointEvent} from "@/ts/events/point.event";
import {Clock, Raycaster, Vector3} from "three";
import {SphereHandler} from "@/ts/handlers/sphere.handler";
import {SphereEntity} from "@/ts/entities/sphere.entity";
import {Physics} from "@/ts/physics";
import {KeysHelper} from "@/ts/helpers/keys.helper";
import {JackController} from "@/ts/controllers/jack.controller";
import {SphereController} from "@/ts/controllers/sphere.controller";
import {CameraController} from "@/ts/controllers/camera.controller";
import CannonDebugger from 'cannon-es-debugger';
import {BoxHandler} from "@/ts/handlers/box.handler";
import {BoxEntity} from "@/ts/entities/box.entity";
import {BoxController} from "@/ts/controllers/box.controller";

export class World {
  protected view: View;
  protected physics: Physics;
  protected clock: Clock;
  protected handlers: Handler<any>[] = [];
  protected floor!: BoxHandler;
  protected jack!: JackHandler;
  protected camera!: CameraHandler;
  protected ready = false;

  protected debugger ?: {update: () => void;};
  protected raycaster = new Raycaster();

  constructor(view: View, physics: Physics) {
    this.clock = new Clock;
    this.view = view;
    this.physics = physics;
  }

  public init($element: HTMLDivElement) {
    this.view.init($element);
    Promise.all([
      this.loadFloor(),
      this.loadJack(),
      this.loadCamera(),
    ]).then(() => {
      // @ts-ignore
      this.debugger = new CannonDebugger(
        this.view.getScene(),
        this.physics.getWorld(),
        {}
      );
      this.bindEvents();
      this.animate();
    });
  }

  public isReady() {
    return this.ready;
  }

  public getJack() {
    return this.jack;
  }

  protected loadCamera() {
    this.camera = new CameraHandler(new CameraController(new CameraEntity()));
    this.camera.setTarget(this.jack);
    this.handlers.push(this.camera);
    return Promise.all([
      this.physics.load(this.camera),
      this.view.load(this.camera),
    ]);
  }

  protected loadJack() {
    this.jack = new JackHandler(new JackController(new JackEntity()));
    this.handlers.push(this.jack);
    return Promise.all([
      this.physics.load(this.jack),
      this.view.load(this.jack),
    ]);
  }

  protected loadFloor() {
    // this.floor = new SphereHandler(new SphereController(new SphereEntity(
    this.floor = new BoxHandler(new BoxController(new BoxEntity(
      '/floor.png',
      1000,
      1,
      1000
    )));
    this.handlers.push(this.floor);
    return Promise.all([
      this.physics.load(this.floor),
      this.view.load(this.floor),
    ]);
  }

  private bindEvents() {
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("mousemove", this.onPointerMove.bind(this), false);
  }

  private onKeyDown($event: KeyboardEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    if (KeysHelper.onKeyDown($event.key)) {
      this.onKeysChanged(new KeysChangedEvent(KeysHelper.keys));
    }
  }

  private onKeyUp($event: KeyboardEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    if (KeysHelper.onKeyUp($event.key)) {
      this.onKeysChanged(new KeysChangedEvent(KeysHelper.keys));
    }
  }

  private onPointerMove($event: MouseEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    this.handlers.forEach(handler => handler.onPointerMove($event));
  }

  public onKeysChanged($event: KeysChangedEvent) {
    this.handlers.forEach(handler => handler.onKeysChanged($event));
  }

  public onPoint($event: PointEvent) {
    this.handlers.forEach(handler => handler.onPoint($event));
  }

  public move(delta: number) {
    this.handlers.forEach((handler) => {
      handler.move(delta, this);
    });
  }

  // // @todo this is something you'd handle in the handler?
  public intersects(
    handler: Handler<any>,
    origin: Vector3,
    vector: Vector3,
    buffer: number = 0,
    exclude: Handler<any>[] = []
  ): Vector3|null {
    const objects = this.handlers
      .filter(candidate => candidate != handler && !exclude.includes(candidate))
      .map(candidate => candidate.getObject());
    const length = vector.length();
    this.raycaster.set(origin, vector);
    const intersections = this.raycaster.intersectObjects(objects);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const distance = intersection.distance;
      if (distance - buffer < length) {
        const multiple = (distance - buffer) / length;
        const resultant = vector.clone();
        resultant.multiplyScalar(multiple);
        const target = origin.clone();
        return target.add(resultant);
      }
    }
    return null;
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();
    this.move(delta);
    this.view.animate(this.camera);
    this.physics.animate(delta);
    this.debugger?.update();
  }
}
