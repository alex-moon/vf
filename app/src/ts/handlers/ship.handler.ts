import {ModelHandler} from "@/ts/handlers/model.handler";
import {ShipController} from "@/ts/controllers/ship.controller";
import {ShipEntity} from "@/ts/entities/ship.entity";
import {World} from "@/ts/world";

export class ShipHandler extends ModelHandler<ShipController> {
  public getEntity(): ShipEntity {
    return super.getEntity();
  }
  public isFlying() {
    return this.controller.isFlying();
  }
  public startFlying() {
    this.controller.startFlying();
  }
  public move(delta: number, world: World) {
    super.move(delta, world);
  }
}
