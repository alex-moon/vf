import qh from 'quickhull3d';
import {Euler, Vector3} from 'three';

export class AsteroidHelper {
  static RESOLUTION = 10;
  static SMOOTHNESS = 0.9;

  public static get(radius: number, numPoints?: number) {
    if (numPoints === undefined) {
      numPoints = Math.floor((4 * Math.PI * radius * radius) / (this.RESOLUTION * this.RESOLUTION));
    }
    const steps = Math.floor(Math.sqrt(numPoints));
    const angle = Math.PI / steps;

    // first build the 2D array
    const vertices: [number, number, number][][] = [];
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
        const distance = (
          x === 0
          || y === 0
          || x === steps
          || y === steps * 2
        ) ? radius : AsteroidHelper.distance(radius);
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

  private static angle() {
    return Math.random() * Math.PI * 2;
  }

  private static distance(max: number, smoothness = AsteroidHelper.SMOOTHNESS) {
    return max * (Math.random() * (1 - smoothness) + smoothness);
  }
}
