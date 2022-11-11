import {ShipEntity} from "@/ts/entities/ship.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {Quaternion} from "cannon-es";

export class ShipController extends ModelController<ShipEntity> {
  public setModel(model: Model) {
    super.setModel(model);
    // @todo get window and door here or?
  }

  public move(delta: number) {
    super.move(delta);

    const intent = this.entity.getIntent();
    this.body.quaternion.mult(intent.pov.quaternion, this.body.quaternion);

    // reset intent pov quaternion @todo not this class' responsibility
    intent.pov.quaternion = new Quaternion().normalize();
  }
}
