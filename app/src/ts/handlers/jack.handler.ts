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
    const force = origin.clone();
    force.vsub(target, force);
    force.scale(-50, force);
    body.applyForce(force);

    // second rotate body
    const down = new Vec3(0, -1, 0);
    body.quaternion.vmult(down, down);
    const rotation = new Quaternion().setFromVectors(down, force);
    body.quaternion.mult(rotation, body.quaternion);
  }
}
