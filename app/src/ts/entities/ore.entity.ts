import {Entity} from "@/ts/entities/entity";
import {OreType} from "@/ts/enums/ore-type";
import {OreRepresentation} from "@/ts/helpers/ore.helper";
import {TextureHelper} from "@/ts/helpers/texture.helper";

export class OreEntity extends Entity {
  public texture: string;
  public vertices: [number, number, number][];
  public faces: number[][] = [];
  public vertex: [number, number, number];
  public type: OreType;

  constructor(raw: OreRepresentation) {
    super();
    this.vertices = raw.vertices;
    this.faces = raw.faces;
    this.type = raw.type;
    this.vertex = raw.vertex;
    this.texture = TextureHelper.get(this.type);
  }
}
