import {Controller} from "@/ts/controllers/controller";
import {Camera} from "three";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {Quaternion, Vec3} from "cannon-es";

export class CameraController extends Controller<CameraEntity> {
  SCALE_MULTIPLE = 3;
  MINIMUM = 7;

  protected object!: Camera;
  protected target!: ModelHandler<any>;

  public setObject(object: Camera) {
    super.setObject(object);
  }

  public getObject(): Camera {
    return super.getObject() as Camera;
  }

  public setTarget(target: ModelHandler<any>) {
    this.target = target;
  }

  public getTarget() {
    return this.target;
  }

  public move(delta: number) {
    super.move(delta);
    const body = this.getBody();

    const target = this.getTarget();
    const pov = target.getPov();
    const quaternion = pov.quaternion.clone();

    // first set position
    const vector = new Vec3();
    const distance = this.calculateDistance();
    quaternion.vmult(new Vec3(0, distance / 7, -distance), vector);

    const position = pov.position.clone();
    position.addScaledVector(1, vector, position);
    body.position.lerp(position, 0.1, body.position);

    const to = pov.quaternion.clone();
    to.mult(new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI), to);
    body.quaternion.slerp(to, 0.1, body.quaternion);
  }

  protected calculateDistance() {
    const target = this.getTarget();
    const body = target.getBody();
    const distance = body.boundingRadius * this.SCALE_MULTIPLE;
    return distance < this.MINIMUM ? this.MINIMUM : distance;
  }
}
