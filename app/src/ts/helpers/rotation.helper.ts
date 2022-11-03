import {Euler, Quaternion} from "three";

export class RotationHelper {
  public static xe(euler: Euler, scalar: number) {
    const rotation = new Quaternion().setFromEuler(euler);
    RotationHelper.x(rotation, scalar);
    euler.setFromQuaternion(rotation);
  }
  public static ye(euler: Euler, scalar: number) {
    const rotation = new Quaternion().setFromEuler(euler);
    RotationHelper.y(rotation, scalar);
    euler.setFromQuaternion(rotation);
  }
  public static ze(euler: Euler, scalar: number) {
    const rotation = new Quaternion().setFromEuler(euler);
    RotationHelper.z(rotation, scalar);
    euler.setFromQuaternion(rotation);
  }
  public static x(rotation: Quaternion, scalar: number) {
    const euler = new Euler(scalar, 0, 0);
    RotationHelper.multiply(rotation, euler);
  }
  public static y(rotation: Quaternion, scalar: number) {
    const euler = new Euler(0, scalar, 0);
    RotationHelper.multiply(rotation, euler);
  }
  public static z(rotation: Quaternion, scalar: number) {
    const euler = new Euler(0, 0, scalar);
    RotationHelper.multiply(rotation, euler);
  }
  private static multiply(rotation: Quaternion, euler: Euler) {
    const quaternion = new Quaternion().setFromEuler(euler);
    rotation.multiply(quaternion);
  }
}
