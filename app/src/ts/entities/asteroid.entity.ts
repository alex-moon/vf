import {ConvexEntity} from "@/ts/entities/convex.entity";
import {AsteroidHelper} from "@/ts/helpers/asteroid.helper";

export class AsteroidEntity extends ConvexEntity {
  public radius: number;

  constructor(texture: string, radius: number) {
    const {vertices, faces} = AsteroidHelper.get(radius);
    super(texture, vertices, faces);
    this.radius = radius;
  }
}
