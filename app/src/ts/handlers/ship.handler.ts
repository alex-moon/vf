import {ModelHandler} from "@/ts/handlers/model.handler";
import {ShipController} from "@/ts/controllers/ship.controller";
import {ShipEntity} from "@/ts/entities/ship.entity";

export class ShipHandler extends ModelHandler<ShipController> {
  public getEntity(): ShipEntity {
    return super.getEntity();
  }
  public isFlying() {
    return this.getEntity().isFlying();
  }
  public startFlying() {
    this.getEntity().startFlying();
  }
}
