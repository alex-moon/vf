import qh from 'quickhull3d';
import {Euler, Vector3} from 'three';

export class AsteroidHelper {
  static RESOLUTION = 10;
  static SMOOTHNESS = 0.5;
  static VARIANCE = 0.05;

  public static get(radius: number, seed: string, numPoints?: number) {
    if (numPoints === undefined) {
      numPoints = Math.floor((4 * Math.PI * radius * radius) / (this.RESOLUTION * this.RESOLUTION));
    }
    const steps = Math.floor(Math.sqrt(numPoints));
    const angle = Math.PI / steps;

    // first build the 2D array
    const vertices: [number, number, number][][] = [];
    const distances: number[][] = [];
    let distance = radius;
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
        const nearby: number[] = [];
        if (!distances[x]) {
          distances[x] = [];
        }
        if (x != 0) {
          nearby.push(distances[x-1][y]);
          if (y != 0) {
            nearby.push(distances[x-1][y-1]);
          }
        }
        if (y != 0) {
          nearby.push(distances[x][y-1]);
        }
        if (x === steps - 1) {
          nearby.push(radius);
        }
        if (y === steps * 2 - 1) {
          nearby.push(radius);
        }
        distance = (
          x === 0
          || y === 0
          || x === steps
          || y === steps * 2
        ) ? radius : AsteroidHelper.distance(radius, nearby);
        distances[x][y] = distance;
        const vector = new Vector3(0, 0, distance);
        vector.applyEuler(euler);
        if (!vertices[x]) {
          vertices[x] = [];
        }
        vertices[x][y] = [
          vector.x,
          vector.y,
          vector.z,
        ];
      }
    }

    // next build the hulls
    const hulls: {vertices: [number, number, number][], faces: number[][]}[] = [];
    for (let x = 0; x <= steps; x++) {
      for (let y = 0; y <= steps * 2; y++) {
        const xni = (x === steps) ? 0 : (x + 1);
        const yni = (y === steps * 2) ? 0 : (y + 1);
        const points = [
          vertices[x][y],
          vertices[xni][y],
          vertices[x][yni],
          vertices[xni][yni],
          [0, 0, 0],
        ] as [number, number, number][];
        hulls.push({
          vertices: points,
          faces: qh(points),
        });
      }
    }
    return hulls;
  }

  private static distance(radius: number, nearby: number[]) {
    if (nearby.length === 0) {
      return radius * (Math.random() * (1 - AsteroidHelper.SMOOTHNESS) + AsteroidHelper.SMOOTHNESS);
    }
    let previous = nearby.reduce((a, b) => a + b, 0) / nearby.length;
    const next = previous + (2 * Math.random() - 1) * AsteroidHelper.VARIANCE * radius;
    if (next > radius) {
      return radius;
    }
    if (next < AsteroidHelper.SMOOTHNESS * radius) {
      return AsteroidHelper.SMOOTHNESS * radius;
    }
    return next;
  }
}
