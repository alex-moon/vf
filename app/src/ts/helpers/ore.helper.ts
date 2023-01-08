import qh from 'quickhull3d';
import {Euler, Vector3} from 'three';
import {MathHelper} from "@/ts/helpers/math.helper";
import {AsteroidType} from "@/ts/enums/asteroid-type";
import {OreType} from "@/ts/enums/ore-type";

export interface OreRepresentation {
  type: OreType,
  vertices: [number, number, number][],
  faces: number[][],
  vertex: [number, number, number],
}

export class OreHelper {
  static RADIUS = 1;
  static STEPS = 4;
  static SMOOTHNESS = 0.7;
  static ORE_P = 0.2;
  static TYPES = {
    [AsteroidType.C]: {
      [OreType.CARBON]: 0.8,
      [OreType.WATER]: 0.2,
    },
    [AsteroidType.S]: {
      [OreType.SILICA]: 0.8,
      [OreType.METAL]: 0.2,
    },
    [AsteroidType.M]: {
      [OreType.METAL]: 1,
    },
  }

  public static get(seed: number, vertices: [number, number, number][], type: AsteroidType) {
    const result = [];
    for (const vertex of vertices) {
      const isOre = MathHelper.seededRandom(seed);
      if (isOre > OreHelper.ORE_P) {
        continue;
      }
      const oreType = MathHelper.seededRandom(seed);
      const oreTypes = OreHelper.TYPES[type] as any;
      for (const key of Object.keys(oreTypes)) {
        const p = oreTypes[key];
        if (oreType < p) {
          const ore = OreHelper.getForVertex(seed, vertex, key as OreType);
          result.push(ore);
          break;
        }
      }
    }
    return result;
  }

  public static getForVertex(
    seed: number,
    vertex: [number, number, number],
    type: OreType
  ): OreRepresentation {
    const steps = OreHelper.STEPS;
    const angle = Math.PI / steps;

    const vertices: [number, number, number][] = [];
    for (let x = 0; x <= steps; x++) {
      for (let y = 0; y <= steps * 2; y++) {
        const southPole = Math.PI / 2;
        const northPole = -southPole;
        const euler = new Euler(
          northPole + x * angle,
          y * angle,
          0,
          'YXZ'
        );
        const distance = OreHelper.distance(seed);
        const vector = new Vector3(0, 0, distance);
        vector.applyEuler(euler);
        vertices.push([
          vertex[0] + vector.x,
          vertex[1] + vector.y,
          vertex[2] + vector.z,
        ]);
      }
    }

    return {
      type,
      vertex,
      vertices,
      faces: qh(vertices),
    };
  }

  private static distance(seed: number) {
    return OreHelper.RADIUS * (
      MathHelper.seededRandom(seed)
      * (1 - OreHelper.SMOOTHNESS)
      + OreHelper.SMOOTHNESS
    );
  }
}
