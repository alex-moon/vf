import {Controller} from "@/ts/controllers/controller";
import {Camera, Quaternion, Vector3} from "three";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {ModelHandler} from "@/ts/handlers/model.handler";
import {Vec3} from "cannon-es";

export class CameraController extends Controller<CameraEntity> {
  SCALE_MULTIPLE = 4;

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

    const target = this.getTarget();
    const pov = target.getPov();
    const vector = new Vector3(0, 0, -this.calculateDistance());
    vector.applyQuaternion(pov.rotation);
    const position = pov.position.clone();
    position.add(vector);

    const rotation = pov.rotation.clone();
    rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));

    const body = this.getBody();
    body.position.set(position.x, position.y, position.z);
    body.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  protected calculateDistance() {
    const target = this.getTarget();
    const object = target.getObject();
    const dimensions = new Vector3();
    object.getWorldScale(dimensions);
    return dimensions.length() * this.SCALE_MULTIPLE;
  }
}
