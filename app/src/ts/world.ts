import {JackEntity} from "@/ts/entities/jack.entity";
import {JackHandler} from "@/ts/handlers/jack.handler";
import {View} from "@/ts/view";
import {Handler} from "@/ts/handlers/handler";
import {KeysChangedEvent} from "@/ts/events/keys-changed.event";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {PointEvent} from "@/ts/events/point.event";
import {Clock, Object3D, Raycaster, Vector3} from "three";
import {Physics} from "@/ts/physics";
import {KeysHelper} from "@/ts/helpers/keys.helper";
import {JackController} from "@/ts/controllers/jack.controller";
import {CameraController} from "@/ts/controllers/camera.controller";
import CannonDebugger from 'cannon-es-debugger';
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {AsteroidEntity} from "@/ts/entities/asteroid.entity";
import {AsteroidController} from "@/ts/controllers/asteroid.controller";
import {ShipHandler} from "@/ts/handlers/ship.handler";
import {ShipController} from "@/ts/controllers/ship.controller";
import {ShipEntity} from "@/ts/entities/ship.entity";
import {MouseHelper} from "@/ts/helpers/mouse.helper";
import {BeltCube, BeltHelper} from "@/ts/helpers/belt.helper";
import {Debug} from "@/ts/helpers/debug";
import {SunHandler} from "@/ts/handlers/sun.handler";
import {SunController} from "@/ts/controllers/sun.controller";
import {SunEntity} from "@/ts/entities/sun.entity";
import {HudUi} from "@/ts/ui/hud.ui";
import {Vec3} from "cannon-es";
import {Ui} from "@/ts/ui/ui";

export class World {
  static UPDATE_NEAREST_PERIOD = 1 / 2;

  protected view: View;
  protected physics: Physics;
  protected clock: Clock;
  protected handlers: Handler<any>[] = [];

  protected asteroids: {[key: string]: AsteroidHandler} = {};
  protected nearest: AsteroidHandler|null = null;
  protected nearestUpdated?: number;

  protected sun!: SunHandler;
  protected jack!: JackHandler;
  protected ship!: ShipHandler;
  protected camera!: CameraHandler;

  protected ready = false;
  protected selected: Handler<any>|null = null;

  protected debugger ?: {update: () => void;};
  protected raycaster = new Raycaster();

  protected uis: Ui[] = [];

  constructor(view: View, physics: Physics) {
    this.clock = new Clock;
    this.view = view;
    this.physics = physics;
  }

  public init($element: HTMLDivElement) {
    this.physics.init();
    this.view.init($element);
    Promise.all([
      this.loadSun(),
      this.loadJack(),
      this.loadShip(),
      this.loadCamera(),
    ]).then(() => {
      if (Debug.CANNON_DEBUGGER) {
        // @ts-ignore
        this.debugger = new CannonDebugger(
          this.view.getScene(),
          this.physics.getWorld(),
          {}
        );
      }
      this.bindEvents();
      this.animate();
      this.start();
      this.initUi($element);
    });
  }

  public isReady() {
    return this.ready;
  }

  public getJack() {
    return this.jack;
  }

  public getShip() {
    return this.ship;
  }

  public getAsteroid() {
    if (this.ship.getAsteroid()) {
      return this.ship.getAsteroid();
    }
    if (this.selected instanceof AsteroidHandler) {
      return this.selected;
    }
    return this.nearest;
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

  protected loadSun() {
    this.sun = new SunHandler(new SunController(new SunEntity(7e4)));
    this.handlers.push(this.sun);
    return Promise.all([
      this.physics.load(this.sun),
      this.view.load(this.sun),
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

  protected loadShip() {
    this.ship = new ShipHandler(new ShipController(new ShipEntity()));
    this.handlers.push(this.ship);
    return Promise.all([
      this.physics.load(this.ship),
      this.view.load(this.ship),
    ]);
  }

  private bindEvents() {
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("mousemove", this.onPointerMove.bind(this), false);
    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    this.ship.getBody().addEventListener('collide', this.collide.bind(this));
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

  private onMouseDown($event: MouseEvent) {
    if (!this.view.isLocked()) {
      return;
    }
    if (this.selected && $event.button === MouseHelper.RIGHT) {
      this.use();
    }
  }

  private onKeysChanged($event: KeysChangedEvent) {
    this.handlers.forEach(handler => handler.onKeysChanged($event));
  }

  private onPoint($event: PointEvent) {
    this.handlers.forEach(handler => handler.onPoint($event));
  }

  // @todo this is why you need a global pubsub
  private collide($event: any) {
    // @todo there are some bogus collide events happening
    if (this.ship.isLanding()) {
      this.ship.land();
      this.jack.exitVehicle();
      this.camera.setTarget(this.jack);
    }
  }

  private move(delta: number) {
    this.handlers.forEach((handler) => {
      handler.move(delta, this);
    });
  }

  // not used anywhere but this is really the only place you can do this
  // @todo how would you do this better?
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
    this.moveEverything();
    this.move(delta);
    this.view.animate(delta, this.camera);
    this.physics.animate(delta);
    this.debugger?.update();
    this.updateSelected();
    this.loadAsteroids();
    this.uis.forEach((ui) => {
      ui.draw(this);
    });
  }

  private moveEverything() {
    const origin = this.ship.getBody().position;
    this.handlers.forEach((handler) => {
      if (handler !== this.ship) {
        const p = handler.getBody().position;
        p.addScaledVector(-1, origin, p);
      }
    });
    origin.set(0, 0, 0);

    const now = this.clock.getElapsedTime();
    if (!this.nearestUpdated || (now - this.nearestUpdated) > World.UPDATE_NEAREST_PERIOD) {
      console.log('updating nearest');
      this.nearestUpdated = now;
      this.nearest = null;
      let distance = Infinity;
      Object.values(this.asteroids).forEach((asteroid) => {
        const diff = new Vec3();
        asteroid.getBody().position.vsub(this.ship.getBody().position, diff);
        if (diff.length() < distance) {
          distance = diff.length();
          this.nearest = asteroid;
        }
      });
    }
  }

  private updateSelected() {
    this.raycaster.setFromCamera({x: 0, y: 0}, this.camera.getObject());
    const objects = this.handlers.map(candidate => candidate.getObject());
    const intersections = this.raycaster.intersectObjects(objects);
    for (const intersection of intersections) {
      const handler = this.handlerForObject(intersection.object);
      if (handler && this.isSelectable(handler)) {
        this.selected = handler;
        this.view.setSelected(handler.getObject());
        return;
      }
    }
    this.selected = null;
    this.view.clearSelected();
  }

  private handlerForObject(object: Object3D) {
    for (const handler of this.handlers) {
      if (handler.hasObject(object)) {
        return handler;
      }
    }
    return null;
  }

  private isSelectable(handler: Handler<any>) {
    if (handler === this.ship) {
      return this.ship.isLanded();
    }
    if (handler instanceof AsteroidHandler) {
      return this.ship.isFlying();
    }
    return false;
  }

  private use() {
    if (!this.selected) {
      return;
    }

    if (this.selected === this.ship) {
      if (this.ship.isLanded() && this.jack.isOnFoot()) {
        this.jack.enterVehicle(this.ship);
        this.ship.startLaunching();
        this.camera.setTarget(this.ship);
      }
    }
    if (this.selected instanceof AsteroidHandler) {
      if (this.ship.isFlying()) {
        const cube = this.selected.getCube();
        this.ship.startLanding(this.selected);
        this.camera.cut();
      }
    }
  }

  private initUi($element: HTMLDivElement) {
    this.uis.push(new HudUi($element));
  }

  private start() {
    this.jack.enterVehicle(this.ship);
    this.ship.startFlying();
    this.camera.setTarget(this.ship);
  }

  protected loadAsteroids() {
    const position = this.ship.getBody().position.clone();
    this.subOrigin(position);
    const cubes = BeltHelper.getNearest(position);

    // first load what we don't have
    const keep = [];
    for (const cube of cubes) {
      const hash = cube.hash();
      keep.push('' + hash);
      if (Object.keys(this.asteroids).includes('' + hash)) {
        continue;
      }
      this.loadAsteroid(cube);
    }

    // now unload what we don't need any more
    for (const key of Object.keys(this.asteroids)) {
      if (!keep.includes(key)) {
        this.unloadAsteroid(this.asteroids[key]);
        delete this.asteroids[key];
      }
    }
  }

  protected unloadAsteroid(handler: AsteroidHandler) {
    this.physics.unload(handler);
    this.view.unload(handler);
  }

  protected loadAsteroid(cube: BeltCube) {
    const asteroid = new AsteroidHandler(new AsteroidController(new AsteroidEntity(
      '/asteroid.png',
      cube.asteroidRadius(),
      cube.hash()
    )));
    asteroid.setCube(cube);
    this.asteroids['' + cube.hash()] = asteroid;
    this.handlers.push(asteroid);
    Promise.all([
      this.physics.load(asteroid),
      this.view.load(asteroid),
    ]).then(() => {
      const position = cube.asteroidPosition();
      this.addOrigin(position);
      asteroid.getBody().position.copy(position);
    });
  }

  protected addOrigin(position: Vec3) {
    position.addScaledVector(1, this.sun.getBody().position, position);
  }

  protected subOrigin(position: Vec3) {
    position.addScaledVector(-1, this.sun.getBody().position, position);
  }
}
