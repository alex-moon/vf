import {ModelHandler} from "@/ts/handlers/model.handler";
import {JackController} from "@/ts/controllers/jack.controller";
import {World} from "@/ts/world";
import {Quaternion, Vec3} from "cannon-es";

export class JackHandler extends ModelHandler<JackController> {
  public move(delta: number, world: World) {
    super.move(delta, world);
    const body = this.getBody();

    // first apply force
    const floor = world.getFloor();
    const target = floor.getBody().position;
    const origin = body.position;
    const force = target.clone();
    force.vsub(origin, force);
    force.normalize();
    force.scale(200, force);
    body.applyForce(force);

    // second rotate body
    // @todo this is the bit that's glitching out...
    const down = new Vec3(0, -200, 0);
    body.quaternion.vmult(down, down);
    const downN = down.clone();
    downN.unit(downN);
    const forceN = force.clone();
    forceN.unit(forceN);
    // @todo the problem is that setFromVectors is giving us a quaternion
    // whose euler has a y component - but we need one restricted to two degrees
    // of freedom, i.e. x and z - there should never be a y component.
    // the following is what setFromVectors does (i.e. has same problem)
    // const axis = new Vec3();
    // downN.cross(forceN, axis);
    // const angle = Math.acos(downN.dot(forceN));
    // const rotation = new Quaternion().setFromAxisAngle(axis, angle);
    const rotation = new Quaternion().setFromVectors(downN, forceN);
    body.quaternion.mult(rotation, body.quaternion);
  }
}
