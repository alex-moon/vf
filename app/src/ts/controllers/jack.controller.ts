import {JackEntity} from "@/ts/entities/jack.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {NumberHelper} from "@/ts/helpers/number.helper";
import {Model} from "@/ts/interfaces/model";
import {Euler, Object3D} from "three";

export class JackController extends ModelController<JackEntity> {
  protected head ?: Object3D;
  protected root ?: Object3D;

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

    const intent = this.entity.getIntent();

    if (this.head) {
      this.head.rotation.setFromQuaternion(intent.pov.rotation);
    }

    const euler = new Euler().setFromQuaternion(intent.pov.rotation);
    this.model.scene.rotation.y = NumberHelper.addMod(
      this.model.scene.rotation.y,
      euler.y,
      2 * Math.PI
    );
    euler.y = 0;
    intent.pov.rotation.setFromEuler(euler);

    if (this.root) {
      if (intent.direction !== null) {
        this.root.rotation.y = intent.direction;

        if (this.head) {
          this.head.rotation.y = NumberHelper.addMod(
            this.head.rotation.y,
            -intent.direction,
            2 * Math.PI
          );
        }
      }
    }
  }
}
