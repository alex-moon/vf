import {Handler} from "@/ts/handlers/handler";
import {SunController} from "@/ts/controllers/sun.controller";

export class SunHandler extends Handler<SunController> {
  getDescription(): string {
    return "Sun";
  }
}
