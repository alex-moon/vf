import {Object3D, Vector3} from "three";

export class RotationHelper {
  // @see https://stackoverflow.com/questions/42812861/three-js-pivot-point/42866733#42866733
  public static rotateAboutPoint(obj: Object3D, point: Vector3, axis: Vector3, theta: number){
    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset
    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
  }
}
