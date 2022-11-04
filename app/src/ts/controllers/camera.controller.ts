import {Controller} from "@/ts/controllers/controller";
import {Camera, Vector3} from "three";
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

    // @todo move to handler
    // const intersection = world.intersects(this, position, vector, 0.5, [target]);
    // if (intersection) {
    //   position.copy(intersection);
    // } else {
       position.add(vector);
    // }
    //
    // // sanity check
    // const sanity = position.clone();
    // if (sanity.y < 0) {
    // }

    const body = this.getBody();
    body.position.set(position.x, position.y, position.z);
    body.quaternion.set(pov.rotation.x, pov.rotation.y, pov.rotation.z, pov.rotation.w);
  }

  protected calculateDistance() {
    const target = this.getTarget();
    const object = target.getObject();
    const dimensions = new Vector3();
    object.getWorldScale(dimensions);
    return dimensions.length() * this.SCALE_MULTIPLE;
  }
}
