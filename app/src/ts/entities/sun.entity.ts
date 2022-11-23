import {Entity} from "@/ts/entities/entity";

export class SunEntity extends Entity {
  public radius: number;

  constructor(radius: number) {
    super();
    this.radius = radius;
  }
}
