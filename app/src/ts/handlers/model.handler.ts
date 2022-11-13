import {Handler} from "@/ts/handlers/handler";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {AnimationMixer} from "three";
import {Vec3, Body, Quaternion} from "cannon-es";
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

  protected applyGravity(body: Body, world: World, scale: number = 1) {
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
    ) * scale;
    force.scale(gravity, force);
    body.applyForce(force);
    return force;
  }

  protected rotateToward(body: Body, force: Vec3) {
    const downN = new Vec3(0, -1, 0);
    const forceN = force.clone();
    forceN.unit(forceN);
    body.quaternion.conjugate().vmult(forceN, forceN);
    const rotation = new Quaternion().setFromVectors(downN, forceN);
    body.quaternion.mult(rotation, body.quaternion);
  }

  private gravity(m1: number, m2: number, r: number) {
    const G = 6.674e-6;
    return (G * m1 * m2) / (r * r);
  }
}
