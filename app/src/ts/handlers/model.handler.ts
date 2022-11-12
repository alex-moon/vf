import {Handler} from "@/ts/handlers/handler";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {AnimationMixer} from "three";
import {Quaternion, Vec3} from "cannon-es";
import {Box} from "shapes/Box";
import {World} from "@/ts/world";

export class ModelHandler<C extends ModelController<any>> extends Handler<C> {
  public setModel(model: Model) {
    this.controller.setModel(model);
  }

  public getModel() {
    return this.controller.getModel();
  }

  public setMixer(mixer: AnimationMixer) {
    this.controller.setMixer(mixer);
  }

  public getMixer() {
    return this.controller.getMixer();
  }

  public getPov() {
    return this.controller.getPov();
  }

  protected getOffset() {
    const body = this.controller.getBody();
    const shape = body.shapes[0] as Box;
    const halfHeight = shape.halfExtents.y;
    const offset = new Vec3(0, -halfHeight, 0);
    body.quaternion.vmult(offset, offset);
    return offset;
  }

  public move(delta: number, world: World) {
    super.move(delta, world);
    const body = this.getBody();

    // first apply force
    const asteroid = world.getAsteroid().getBody();
    const target = asteroid.position;
    const origin = body.position;
    const force = target.clone();
    force.vsub(origin, force);
    force.normalize();
    const gravity = this.gravity(
      body.mass,
      asteroid.mass,
      body.position.distanceTo(asteroid.position)
    );
    force.scale(gravity, force);
    body.applyForce(force);

    // second rotate body
    const downN = new Vec3(0, -1, 0);
    const forceN = force.clone();
    forceN.unit(forceN);
    body.quaternion.conjugate().vmult(forceN, forceN);
    const rotation = new Quaternion().setFromVectors(downN, forceN);
    body.quaternion.mult(rotation, body.quaternion);
    // const to = new Quaternion().normalize();
    // to.mult(rotation, to);
    // body.quaternion.slerp(to, 0.1, body.quaternion);
  }

  private gravity(m1: number, m2: number, r: number) {
    const G = 6.674e-6;
    return (G * m1 * m2) / (r * r);
  }
}
