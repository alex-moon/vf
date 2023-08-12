import {Handler} from "@/ts/handlers/handler";
import {SphereController} from "@/ts/controllers/sphere.controller";

export class SphereHandler extends Handler<SphereController> {
  getDescription(): string {
    return "Unidentified object";
  }
}
