import {Entity} from "@/ts/entities/entity";

export class SphereEntity extends Entity {
  public texture: string;
  public radius: number;

  constructor(texture: string, radius: number) {
    super();
    this.texture = texture;
    this.radius = radius;
  }
}
