import {Controller} from "@/ts/controllers/controller";
import {Camera, Vector3} from "three";
import {CameraEntity} from "@/ts/entities/camera.entity";
import {World} from "@/ts/world";

export class CameraController extends Controller<CameraEntity> {
  SCALE_MULTIPLE = 4;

  protected camera!: Camera;
  public setCamera(camera: Camera) {
    this.camera = camera;
  }

  public getCamera() {
    return this.camera;
  }

  public getIntersectable() {
    return this.camera;
  }

  public getTarget() {
    return this.entity.getTarget();
  }

  public move(delta: number, world: World) {
    const target = this.getTarget();
    const pov = target.getPov();
    const vector = new Vector3(0, 0, -this.calculateDistance());
    vector.applyQuaternion(pov.rotation);
    const position = pov.position.clone();

    const intersection = world.intersects(this, position, vector, 0.5, [target]);
    if (intersection) {
      position.copy(intersection);
    } else {
      position.add(vector);
    }

    // sanity check
    const sanity = position.clone();
    if (sanity.y < 0) {
    }

    this.camera.position.copy(position);
    this.camera.lookAt(pov.position);
  }

  protected calculateDistance() {
    const target = this.entity.getTarget();
    const model = target.getModel();
    const dimensions = new Vector3();
    model.scene.getWorldScale(dimensions);
    return dimensions.length() * this.SCALE_MULTIPLE;
  }
}
