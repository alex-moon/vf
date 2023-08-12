import {Entity} from "@/ts/entities/entity";

export class ConvexEntity extends Entity {
  public texture: string;
  public vertices: number[][];
  public faces: number[][];

  constructor(texture: string, vertices: number[][], faces: number[][]) {
    super();
    this.texture = texture;
    this.vertices = vertices;
    this.faces = faces;
  }
}
