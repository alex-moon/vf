import {AsteroidController} from "@/ts/controllers/asteroid.controller";
import {Handler} from "@/ts/handlers/handler";
import {BeltCube} from "@/ts/helpers/belt.helper";

export class AsteroidHandler extends Handler<AsteroidController> {
  protected cube?: BeltCube;

  public setCube(cube: BeltCube) {
    this.cube = cube;
  }

  public getCube() {
    return this.cube;
  }
}
