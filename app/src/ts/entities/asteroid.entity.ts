import {AsteroidHelper} from "@/ts/helpers/asteroid.helper";
import {Entity} from "@/ts/entities/entity";

export class AsteroidEntity extends Entity {
  public texture: string;
  public radius: number;
  public hulls: {vertices: [number, number, number][], faces: number[][]}[] = [];

  constructor(texture: string, radius: number, hash: number) {
    super();
    this.texture = texture;
    this.radius = radius;
    this.hulls = AsteroidHelper.get(radius, hash);
  }
}
