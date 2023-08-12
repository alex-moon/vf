import {OreController} from "@/ts/controllers/ore.controller";
import {Handler} from "@/ts/handlers/handler";
import {StringHelper} from "@/ts/helpers/string.helper";

export class OreHandler extends Handler<OreController> {
  private mined = false;
  public mine() {
    this.mined = true;
  }
  public isMined() {
    return this.mined;
  }
  public getDescription(): string {
    const entity = this.getEntity();
    return StringHelper.ucwords(entity.type + " ore");
  }
}
