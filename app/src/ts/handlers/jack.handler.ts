import {ModelHandler} from "@/ts/handlers/model.handler";
import {JackController} from "@/ts/controllers/jack.controller";
import {JackEntity} from "@/ts/entities/jack.entity";
import {World} from "@/ts/world";
import {JackState} from "@/ts/entities/jack.intent";

export class JackHandler extends ModelHandler<JackController> {
  public getEntity(): JackEntity {
    return super.getEntity();
  }

  public isOnFoot() {
    return this.getEntity().isOnFoot();
  }

  public enterVehicle(vehicle: ModelHandler<any>) {
    this.controller.enterVehicle(vehicle);
  }

  public exitVehicle() {
    this.controller.exitVehicle();
  }

  private state = 'walking';
  public move(delta: number, world: World) {
    super.move(delta, world);

    if (!this.isOnFoot()) {
      return;
    }

    const body = this.getBody();

    // first apply force
    const force = this.applyGravity(body, world);

    // second rotate body
    if (force) {
      this.rotateToward(body, force);
    }
  }
}
