import {Vector3} from "three";

export class PointEvent {
  point: Vector3;
  constructor(point: Vector3) {
    this.point = point;
  }
}
