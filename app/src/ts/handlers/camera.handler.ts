import {Handler} from "@/ts/handlers/handler";
import {CameraController} from "@/ts/controllers/camera.controller";
import {ModelHandler} from "@/ts/handlers/model.handler";

export class CameraHandler extends Handler<CameraController> {
  public setTarget(target: ModelHandler<any>) {
    this.controller.setTarget(target);
  }
  public getTarget() {
    return this.controller.getTarget();
  }
}
