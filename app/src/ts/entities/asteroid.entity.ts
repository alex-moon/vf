import {AsteroidHelper} from "@/ts/helpers/asteroid.helper";
import {Entity} from "@/ts/entities/entity";
import {AsteroidType} from "@/ts/enums/asteroid-type";
import {OreHelper} from "@/ts/helpers/ore.helper";
import {TextureHelper} from "@/ts/helpers/texture.helper";
import {OreHandler} from "@/ts/handlers/ore.handler";
import {OreEntity} from "@/ts/entities/ore.entity";
import {OreController} from "@/ts/controllers/ore.controller";

export class AsteroidEntity extends Entity {
  public texture: string = TextureHelper.get('asteroid');
  public radius: number;
  public vertices: [number, number, number][] = [];
  public hulls: {vertices: [number, number, number][], faces: number[][]}[] = [];
  public type: AsteroidType;
  public ores: OreHandler[] = [];

  constructor(radius: number, hash: number) {
    super();
    this.radius = radius;
    const {vertices, hulls} = AsteroidHelper.get(radius, hash, 16);
    this.vertices = vertices;
    this.hulls = hulls;
    this.type = AsteroidHelper.type(hash);
    this.ores = OreHelper.get(hash, this.vertices, this.type)
      .map(raw => new OreHandler(new OreController(new OreEntity(raw))));
  }
}
