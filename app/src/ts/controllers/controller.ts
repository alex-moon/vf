import {Entity} from "@/ts/entities/entity";

export abstract class Controller<E extends Entity> {
  protected entity: E;

  constructor(entity: E) {
    this.entity = entity;
  }
}
