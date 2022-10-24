import {Controller} from "@/ts/controllers/controller";
import {Camera, Vector3} from "three";
import {CameraEntity} from "@/ts/entities/camera.entity";

export class CameraController extends Controller<CameraEntity> {
  protected camera!: Camera;
  public setCamera(camera: Camera) {
    this.camera = camera;
  }
  public getCamera() {
    return this.camera;
  }
  public getTarget() {
    return this.entity.getTarget();
  }
  public move(delta: number) {
    const target = this.entity.getTarget();
    if (target) {
      const pov = target.getPov();
      if (pov) {
        const vector = new Vector3(0, 0, -5);
        vector.applyQuaternion(pov.rotation);
        const position = pov.position.clone();
        position.add(vector);
        this.camera.position.copy(position);
        this.camera.lookAt(pov.position);
      }
    }
  }
}
