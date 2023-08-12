import {Handler} from "@/ts/handlers/handler";
import {BoxController} from "@/ts/controllers/box.controller";

export class BoxHandler extends Handler<BoxController> {
  getDescription(): string {
    return "Unidentified object";
  }
}
