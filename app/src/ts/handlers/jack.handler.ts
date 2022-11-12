import {ModelHandler} from "@/ts/handlers/model.handler";
import {JackController} from "@/ts/controllers/jack.controller";
import {JackEntity} from "@/ts/entities/jack.entity";

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
}
