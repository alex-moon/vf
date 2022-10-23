import {Entity} from "@/ts/entities/entity";

export class BoxEntity extends Entity {
  public texture: string;
  public width: number;
  public height: number;
  public depth: number;

  constructor(texture: string, width: number, height: number, depth: number) {
    super();
    this.texture = texture;
    this.width = width;
    this.height = height;
    this.depth = depth;
  }
}
