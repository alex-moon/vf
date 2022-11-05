import {ModelHandler} from "@/ts/handlers/model.handler";
import {JackController} from "@/ts/controllers/jack.controller";
import {World} from "@/ts/world";

export class JackHandler extends ModelHandler<JackController> {
  public move(delta: number, world: World) {
    super.move(delta, world);
    const body = this.controller.getBody();
    const velocity = this.controller.getVelocity();
    body.velocity.copy(velocity);
  }
}
