import {JackEntity} from "@/ts/entities/jack.entity";
import {ModelController} from "@/ts/controllers/model.controller";
import {Model} from "@/ts/interfaces/model";
import {Object3D, SpotLight} from "three";
import {Direction} from "@/ts/enums/direction";
import {Body, Quaternion, Vec3} from "cannon-es";
import {RotationHelper} from "@/ts/helpers/rotation.helper";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {JackIntent} from "@/ts/entities/jack.intent";

export class JackController extends ModelController<JackEntity> {
  protected head!: Object3D;
  protected root!: Object3D;
  protected light!: SpotLight;
  protected lightTarget!: Object3D;
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

    this.light = new SpotLight(0x99ccff, 5, 100, Math.PI/4, 1);
    this.getObject().add(this.light);
    this.lightTarget = new Object3D();
    this.getObject().add(this.lightTarget);
    this.light.target = this.lightTarget;
    this.moveLight();
  }

  public enterVehicle(vehicle: ModelHandler<any>) {
    this.entity.enterVehicle();
    this.vehicle = vehicle;
    this.body.type = Body.STATIC;
    this.object.visible = false;
  }

  public exitVehicle() {
    if (this.vehicle) {
      this.entity.exitVehicle();
      const vehicleEntity = this.vehicle.getEntity();
      const vehicleBody = this.vehicle.getBody();
      this.vehicle = null;
      this.body.type = Body.DYNAMIC;
      this.object.visible = true;

      // get position in space in front of the ship door
      const relative = new Vec3(
        0,
        -vehicleEntity.box.height / 2,
        vehicleEntity.box.depth
      );
      vehicleBody.quaternion.vmult(relative, relative);
      const position = vehicleBody.position.clone();
      position.addScaledVector(1, relative, position);
      this.body.position.copy(position);
      this.body.quaternion.copy(vehicleBody.quaternion);
    }
  }

  private moveLight() {
    const intent = this.entity.getIntent();
    this.light.position.set(intent.pov.position.x, intent.pov.position.y, intent.pov.position.z);
    const to = intent.pov.position.clone();
    const vector = new Vec3(0, 0, 7);
    intent.pov.quaternion.vmult(vector, vector);
    to.addScaledVector(1, vector, to);
    this.lightTarget.position.set(to.x, to.y, to.z);
  }

  public getVelocity() {
    const intent = this.entity.getIntent();
    const rotation = this.body.quaternion.clone();
    rotation.mult(new Quaternion().setFromAxisAngle(
      new Vec3(0, 1, 0),
      intent.direction || 0
    ), rotation);
    const velocity = new Vec3(0, 0, intent.speed);
    rotation.vmult(velocity, velocity);
    return velocity;
  }

  public move(delta: number) {
    super.move(delta);

    if (this.vehicle) {
      const pov = this.vehicle.getPov()
      this.body.position.copy(pov.position);
      this.body.quaternion.copy(pov.quaternion);
      return;
    }

    const velocity = this.getVelocity();
    this.body.velocity.x = velocity.x;
    this.body.velocity.y = velocity.y;
    this.body.velocity.z = velocity.z;

    const intent = this.entity.getIntent() as JackIntent;

    // split the intended rotation into x and y components
    const euler = new Vec3();
    intent.pov.quaternion.toEuler(euler);
    const y = new Quaternion().setFromEuler(0, euler.y, 0).normalize();
    const x = new Quaternion().setFromEuler(euler.x, 0, 0).normalize();

    // rotate the body
    this.body.quaternion.mult(y, this.body.quaternion);

    this.moveLight();

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
