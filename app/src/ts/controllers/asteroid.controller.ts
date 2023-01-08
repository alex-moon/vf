import {Controller} from "@/ts/controllers/controller";
import {AsteroidEntity} from "@/ts/entities/asteroid.entity";

export class AsteroidController extends Controller<AsteroidEntity> {
  public getOres() {
    return this.entity.ores;
  }
}
