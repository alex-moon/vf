import {JackEntity} from "@/ts/entities/jack.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {NumberHelper} from "@/ts/helpers/number.helper";
import {Model} from "@/ts/interfaces/model";
import {Euler, Object3D} from "three";
import {World} from "@/ts/world";

export class JackController extends ModelController<JackEntity> {
  protected head!: Object3D;
  protected root!: Object3D;

  public setModel(model: Model) {
    super.setModel(model);
    const head = model.scene.getObjectByName('Head');
    if (!head) {
      throw new Error('Could not get Head of Jack');
    }
    this.head = head;
    const root = model.scene.getObjectByName('Root');
    if (!root) {
      throw new Error('Could not get Root of Jack');
    }
    this.root = root;
  }

  public move(delta: number, world: World) {
    super.move(delta, world);

    const intent = this.entity.getIntent();

    this.head.rotation.setFromQuaternion(intent.pov.rotation);

    const euler = new Euler().setFromQuaternion(intent.pov.rotation);
    this.model.scene.rotation.y = NumberHelper.addMod(
      this.model.scene.rotation.y,
      euler.y,
      2 * Math.PI
    );
    euler.y = 0;
    intent.pov.rotation.setFromEuler(euler);

    // @todo intent direction should never be null
    // we are using it to indicate no movement, but that's not correct
    if (intent.direction !== null) {
      this.root.rotation.y = intent.direction;
      // @todo do with quaternion multiplication
      this.head.rotation.y = NumberHelper.addMod(
        this.head.rotation.y,
        -intent.direction,
        2 * Math.PI
      );
    }

    // @todo handle intersections! :) ideally in the handler
  }
}
