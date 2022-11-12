import {JackEntity} from "@/ts/entities/jack.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {Object3D} from "three";
import {Direction} from "@/ts/enums/direction";
import {Body, Quaternion, Vec3} from "cannon-es";
import {RotationHelper} from "@/ts/helpers/rotation.helper";
import {ModelHandler} from "@/ts/handlers/model.handler";

export class JackController extends ModelController<JackEntity> {
  protected head!: Object3D;
  protected root!: Object3D;
  protected vehicle: ModelHandler<any>|null = null;

  public setModel(model: Model) {
    super.setModel(model);
    const head = model.scene.getObjectByName('Head');
    if (!head) {
      throw new Error('Could not get Head of Jack');
    }
    this.head = head;
    this.head.rotation.order = 'YXZ';
    const root = model.scene.getObjectByName('Root');
    if (!root) {
      throw new Error('Could not get Root of Jack');
    }
    this.root = root;
  }

  public enterVehicle(vehicle: ModelHandler<any>) {
    this.entity.enterVehicle();
    this.vehicle = vehicle;
    this.body.type = Body.KINEMATIC;
    this.object.visible = false;
  }

  public move(delta: number) {
    super.move(delta);

    if (this.vehicle) {
      this.body.position = this.vehicle.getPov().position;
      return;
    }

    const velocity = this.getVelocity();
    this.body.velocity.x = velocity.x;
    this.body.velocity.y = velocity.y;
    this.body.velocity.z = velocity.z;

    const intent = this.entity.getIntent();

    // split the intended rotation into x and y components
    const euler = new Vec3();
    intent.pov.quaternion.toEuler(euler);
    const y = new Quaternion().setFromEuler(0, euler.y, 0).normalize();
    const x = new Quaternion().setFromEuler(euler.x, 0, 0).normalize();

    // rotate the body
    this.body.quaternion.mult(y, this.body.quaternion);

    // rotate the head
    this.head.quaternion.set(x.x, x.y, x.z, x.w);

    // handle wasd movement @todo this is confusing
    if (intent.direction !== null) {
      this.root.rotation.y = intent.direction;
      // @todo head rotation is fucked
      // this.head.rotation.y = -intent.direction;

      if (
        intent.direction < Direction.E
        && intent.direction > Direction.W
      ) {
        RotationHelper.y(this.root.quaternion, Math.PI);
        // RotationHelper.y(this.head.quaternion, -Math.PI);
      }
    }

    // reset intent pov quaternion @todo not this class' responsibility
    intent.pov.quaternion.copy(x);
  }
}
