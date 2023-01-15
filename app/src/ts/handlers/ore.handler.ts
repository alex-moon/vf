import {OreController} from "@/ts/controllers/ore.controller";
import {Handler} from "@/ts/handlers/handler";

export class OreHandler extends Handler<OreController> {
  private mined = false;
  public mine() {
    this.mined = true;
  }
  public isMined() {
    return this.mined;
  }
}
