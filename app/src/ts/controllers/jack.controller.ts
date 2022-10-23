import {JackEntity} from "@/ts/entities/jack.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {NumberHelper} from "@/ts/helpers/number.helper";
import {Model} from "@/ts/interfaces/model";
import {Object3D, Vector3} from "three";

export class JackController extends ModelController<JackEntity> {
  protected head ?: Object3D;
  protected root ?: Object3D;

  public onPointerMove($event: MouseEvent) {
    super.onPointerMove($event);
    this.model.scene.rotation.y = NumberHelper.addMod(
      this.model.scene.rotation.y,
      -$event.movementX * 0.01,
      2 * Math.PI
    );
  }

  public setModel(model: Model) {
    super.setModel(model);
    this.head = model.scene.getObjectByName('Head');
    this.root = model.scene.getObjectByName('Root');
  }

  public move(delta: number) {
    super.move(delta);

    const model = this.getModel();
    const mixer = this.getMixer();
    if (!model || !mixer) {
      return;
    }

    if (this.root) {
      const intent = this.entity.getIntent();
      if (intent.direction !== null) {
        this.root.rotation.y = intent.direction + (Math.PI / 2);
        if (this.head) {
          this.head.rotation.y = -this.root.rotation.y + (Math.PI / 2);
        }
      }
    }
  }
}
