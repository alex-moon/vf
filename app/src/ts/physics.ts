import * as CANNON from 'cannon-es';
import {Handler} from "@/ts/handlers/handler";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {BoxHandler} from "@/ts/handlers/box.handler";
import {CameraHandler} from "@/ts/handlers/camera.handler";
import {SphereHandler} from "@/ts/handlers/sphere.handler";

export class Physics {
  protected world: CANNON.World;

  constructor() {
    this.world = new CANNON.World();
  }

  public init() {
  }

  public load(handler: Handler<any>): Promise<void> {
    if (handler instanceof ModelHandler) {
      return this.loadModel(handler);
    }
    if (handler instanceof BoxHandler) {
      return this.loadBox(handler);
    }
    if (handler instanceof SphereHandler) {
      return this.loadSphere(handler);
    }
    if (handler instanceof CameraHandler) {
      return this.loadCamera(handler);
    }
    return new Promise((resolve, reject) => reject());
  }

  protected loadModel(handler: ModelHandler<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const body = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(
          entity.box.width / 2,
          entity.box.height / 2,
          entity.box.depth / 2
        )),
      });
      body.position.set(0, 0, 0);
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadBox(handler: BoxHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const body = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(
          entity.width / 2,
          entity.height / 2,
          entity.depth / 2
        )),
      });
      body.position.set(0, 0, 0);
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadSphere(handler: SphereHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = handler.getEntity();
      const body = new CANNON.Body({
        shape: new CANNON.Sphere(entity.radius),
      });
      body.position.set(0, -entity.radius, 0);
      body.quaternion.set(-1, 0, 0, 1).normalize();
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }

  protected loadCamera(handler: CameraHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      const body = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1)),
      });
      body.position.set(0, 5, -20);
      body.quaternion.set(-0.2, 0, 0, 1).normalize();
      this.world.addBody(body);
      handler.setBody(body);
      resolve();
    });
  }
}
