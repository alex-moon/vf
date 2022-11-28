import {Intent} from "@/ts/entities/intent";

export enum JackState {
  DEFAULT = 'default',
  FALLING = 'falling',
  IDLE = 'idle',
  RUNNING = 'running',
  VEHICLE = 'vehicle',
}

export class JackIntent extends Intent {
  speed: number = 0;
  direction: number|null = 0;
}
