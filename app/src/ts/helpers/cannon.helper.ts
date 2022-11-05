import {Body, Vec3} from "cannon-es";
import {Object3D, Vector3} from "three";

export class CannonHelper {
  public static lookAt(body: Body, position: Vec3) {
    const object = new Object3D();
    object.position.set(body.position.x, body.position.y, body.position.z);
    object.lookAt(new Vector3(position.x, position.y, position.z));
    body.quaternion.set(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w);
  }
}
