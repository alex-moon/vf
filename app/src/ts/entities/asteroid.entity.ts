import {AsteroidHelper} from "@/ts/helpers/asteroid.helper";
import {Entity} from "@/ts/entities/entity";
import {AsteroidType} from "@/ts/enums/asteroid-type";
import {OreHelper} from "@/ts/helpers/ore.helper";

export class AsteroidEntity extends Entity {
  public texture: string;
  public radius: number;
  public hulls: {vertices: [number, number, number][], faces: number[][]}[] = [];
  public type: AsteroidType;
  public ores: {vertices: [number, number, number][], faces: number[][]}[] = [];

  constructor(texture: string, radius: number, hash: number) {
    super();
    this.texture = texture;
    this.radius = radius;
    this.hulls = AsteroidHelper.get(radius, hash, 16);
    this.type = AsteroidHelper.type(hash);
    this.ores = OreHelper.get(hash, this.getVertices(), this.type);
  }

  private getVertices() {
    const vertices = [];
    for (const hull of this.hulls) {
      for (const vertex of hull.vertices) {
        vertices.push(vertex);
      }
    }
    return vertices;
  }
}
