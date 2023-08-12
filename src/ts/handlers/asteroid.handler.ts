import {AsteroidController} from "@/ts/controllers/asteroid.controller";
import {Handler} from "@/ts/handlers/handler";
import {BeltCube} from "@/ts/helpers/belt.helper";
import {World} from "@/ts/world";
import {StringHelper} from "@/ts/helpers/string.helper";

export class AsteroidHandler extends Handler<AsteroidController> {
  protected cube?: BeltCube;

  public setCube(cube: BeltCube) {
    this.cube = cube;
  }

  public getCube() {
    return this.cube;
  }

  public getOres() {
    return this.controller.getOres();
  }

  public move(delta: number, world: World) {
    super.move(delta, world);
    for (const ore of this.getOres()) {
      const asteroidBody = this.getBody();
      const oreBody = ore.getBody();
      oreBody.position.copy(asteroidBody.position);
      oreBody.quaternion.copy(asteroidBody.quaternion);
    }
  }

  getDescription(): string {
    return this.getCube()?.name + "\n" + StringHelper.ucwords(this.getEntity().type + "-type asteroid");
  }
}
