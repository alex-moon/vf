import {JackEntity} from "@/ts/entities/jack.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {NumberHelper} from "@/ts/helpers/number.helper";

export class JackController extends ModelController<JackEntity> {
  public onPointerMove($event: MouseEvent) {
    super.onPointerMove($event);
    this.model.scene.rotation.y = NumberHelper.addMod(
      this.model.scene.rotation.y,
      -$event.movementX * 0.01,
      2 * Math.PI
    );
  }
}
