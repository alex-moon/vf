import {Controller} from "@/ts/controllers/controller";
import {Camera} from "three";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {Quaternion, Vec3} from "cannon-es";
import {CannonHelper} from "@/ts/helpers/cannon.helper";

export class CameraController extends Controller<CameraEntity> {
  SCALE_MULTIPLE = 15;

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
    quaternion.vmult(new Vec3(0, 0, -this.calculateDistance()), vector);
    const position = pov.position.clone();
    position.addScaledVector(1, vector, position);
    body.position.copy(position);

    // @todo this is the bit that's struggling - how to do this differently?
    // CannonHelper.lookAt(body, pov.position);
    body.quaternion.copy(pov.quaternion);
    body.quaternion.mult(
      new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI),
      body.quaternion
    );
  }

  protected calculateDistance() {
    const target = this.getTarget();
    const body = target.getBody();
    return body.boundingRadius * this.SCALE_MULTIPLE;
  }
}
