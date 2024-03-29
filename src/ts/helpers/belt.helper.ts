import {Vec3} from "cannon-es";
import {MathUtils} from "three";
import {MathHelper} from "@/ts/helpers/math.helper";
import {NameHelper} from "@/ts/helpers/name.helper";

export class BeltCube {
  static EDGE = 3e4;

  readonly name: string;
  readonly xi: number;
  readonly yi: number;
  readonly zi: number;

  constructor(xi: number, yi: number, zi: number) {
    this.xi = xi;
    this.yi = yi;
    this.zi = zi;
    this.name = NameHelper.get(this.hash());
  }

  public hash(): number {
    return MathHelper.cantor(this.xi, MathHelper.cantor(this.yi, this.zi));
  }

  public asteroidPosition(): Vec3 {
    const hash = this.hash();
    const x = MathUtils.seededRandom(hash);
    const y = MathUtils.seededRandom(hash * 2);
    const z = MathUtils.seededRandom(hash * 3);
    const result = this.getCenter();
    result.x += x * BeltCube.EDGE / 2;
    result.y += y * BeltCube.EDGE / 2;
    result.z += z * BeltCube.EDGE / 2;
    return result;
  }

  public asteroidRadius(): number {
    const exponent = MathUtils.seededRandom(this.hash());
    const value = Math.pow(50, exponent);
    // ATTENTION: min here MUST be at least
    // sqrt((6 * 100) / (4 * pi)) = 6.91
    // where the 6 is the minimum number of points on a sphere
    // because the minimal sphere is a cube
    return MathHelper.clamp(value, 7, 50);
  }

  public getMin(): Vec3 {
    return new Vec3(
      this.xi * BeltCube.EDGE,
      this.yi * BeltCube.EDGE,
      this.zi * BeltCube.EDGE
    );
  }

  public getCenter(): Vec3 {
    return new Vec3(
      this.xi * BeltCube.EDGE + BeltCube.EDGE / 2,
      this.yi * BeltCube.EDGE + BeltCube.EDGE / 2,
      this.zi * BeltCube.EDGE + BeltCube.EDGE / 2
    );
  }

  public getMax(): Vec3 {
    return new Vec3(
      this.xi * BeltCube.EDGE + BeltCube.EDGE,
      this.yi * BeltCube.EDGE + BeltCube.EDGE,
      this.zi * BeltCube.EDGE + BeltCube.EDGE
    );
  }
}

export class BeltHelper {
  static INNER_RADIUS = 3e7; // 2 AU
  static OUTER_RADIUS = 4.5e7; // 3 AU
  static NEAREST = 0; // 1;

  public static isIn(point: Vec3): boolean {
    // first get the center of the circular section of the torus at this angle
    const xz = new Vec3(point.x, 0, point.z);
    const distance = xz.length();
    // "planar radius" i.e. distance from sun to point halfway between inner and outer radius
    const planar = (BeltHelper.OUTER_RADIUS + BeltHelper.INNER_RADIUS) / 2;
    const center = xz.scale(planar / distance);

    // second get the distance from the given point to that center
    // "axial radius" i.e. the radius of the section of the torus
    const axial = (BeltHelper.OUTER_RADIUS - BeltHelper.INNER_RADIUS) / 2;
    return point.distanceTo(center) < axial;
  }

  public static getCube(point: Vec3): BeltCube {
    const xi = Math.floor(point.x / BeltCube.EDGE);
    const yi = Math.floor(point.y / BeltCube.EDGE);
    const zi = Math.floor(point.z / BeltCube.EDGE);
    return new BeltCube(xi, yi, zi);
  }

  public static getNearest(point: Vec3): BeltCube[] {
    const center = BeltHelper.getCube(point);

    const cubes = [];
    const n = BeltHelper.NEAREST;
    for (let xi = -n; xi <= n; xi ++) {
      for (let yi = -n; yi <= n; yi ++) {
        for (let zi = -n; zi <= n; zi ++) {
          cubes.push(new BeltCube(
            center.xi + xi,
            center.yi + yi,
            center.zi + zi
          ));
        }
      }
    }

    return cubes;
  }
}
