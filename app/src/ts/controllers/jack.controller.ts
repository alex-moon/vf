import {JackEntity} from "@/ts/entities/jack.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {Euler, Object3D, Quaternion} from "three";
import {Direction} from "@/ts/enums/direction";
import {RotationHelper} from "@/ts/helpers/rotation.helper";
import {Vec3} from "cannon-es";

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
    this.head.rotation.order = 'YXZ'; // @todo this is a hack
    const root = model.scene.getObjectByName('Root');
    if (!root) {
      throw new Error('Could not get Root of Jack');
    }
    this.root = root;
  }

  public move(delta: number) {
    super.move(delta);

    const intent = this.entity.getIntent();

    this.body.quaternion.mult(intent.pov.rotation);
    const euler = new Vec3();
    intent.pov.rotation.toEuler(euler);
    euler.y = 0;
    intent.pov.rotation.setFromEuler(euler.x, euler.y, euler.z);
    this.head.quaternion.set(intent.pov.rotation.x, intent.pov.rotation.y, intent.pov.rotation.z, intent.pov.rotation.w).normalize();

    // @todo intent direction is only used for wasd movement - this is confusing
    if (intent.direction !== null) {
      this.root.rotation.y = intent.direction;
      RotationHelper.ye(this.head.rotation, -intent.direction);

      if (
        intent.direction < Direction.E
        && intent.direction > Direction.W
      ) {
        RotationHelper.ye(this.root.rotation, Math.PI);
        RotationHelper.ye(this.head.rotation, -Math.PI);
      }
    }

    // @todo handle intersections! :) ideally in the handler
  }
}
