import {AsteroidController} from "@/ts/controllers/asteroid.controller";
import {Handler} from "@/ts/handlers/handler";
import {BeltCube} from "@/ts/helpers/belt.helper";
import {World} from "@/ts/world";
import {OreEntity} from "@/ts/entities/ore.entity";
import {Vec3} from "cannon-es";

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
      const body = this.getBody();
      const entity = ore.getEntity() as OreEntity;
      const offset = new Vec3(entity.vertex[0], entity.vertex[1], entity.vertex[2]);
      body.quaternion.vmult(offset, offset);
      ore.getBody().position.set(
        body.position.x + offset.x,
        body.position.y + offset.y,
        body.position.z + offset.z,
      );
    }
  }
}
