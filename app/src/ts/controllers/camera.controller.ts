import {Controller} from "@/ts/controllers/controller";
import {Camera, Euler, Vector3} from "three";
import {CameraEntity} from "@/ts/entities/camera.entity";

export class CameraController extends Controller<CameraEntity> {
  protected camera!: Camera;
  public setCamera(camera: Camera) {
    this.camera = camera;
  }
  public getCamera() {
    return this.camera;
  }
  public move(delta: number) {
    const target = this.entity.getTarget();
    if (target) {
      const model = target.getModel();
      if (model) {
        const scene = model.scene;
        const direction = new Euler(0, scene.rotation.y, 0);
        const result = new Vector3(0, 1.5, -5);
        result.applyEuler(direction);
        const target = new Vector3(
          scene.position.x,
          scene.position.y + 1,
          scene.position.z
        );
        const position = target.clone();
        this.camera.position.copy(position.add(result));
        this.camera.lookAt(target);
      }
    }
  }
}
