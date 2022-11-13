import {Quaternion, Vec3} from "cannon-es";
import {Intent} from "@/ts/entities/intent";

export enum ShipState {
  DEFAULT = 'default',
  LANDED = 'landed',
  FLYING = 'flying',
  LANDING = 'landing',
  LAUNCHING = 'launching',
}

export enum DoorState {
  DEFAULT = 'default',
  CLOSED = 'closed',
  CLOSING = 'closing',
  OPEN = 'open',
  OPENING = 'opening',
}

export class ShipIntent extends Intent {
  acceleration: Vec3 = new Vec3(0, 0, 0);
  quaternion: Quaternion = new Quaternion().normalize();
  angularVelocity: Vec3 = new Vec3(0, 0, 0);
  doorState: DoorState = DoorState.OPEN;
}
