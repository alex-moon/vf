import qh from 'quickhull3d';
import {Euler, Vector3} from 'three';

export class AsteroidHelper {
  static RESOLUTION = 5;

  public static get(radius: number, numPoints?: number) {
    if (numPoints === undefined) {
      numPoints = Math.floor((4 * Math.PI * radius * radius) / (this.RESOLUTION * this.RESOLUTION));
    }
    const steps = Math.floor(Math.sqrt(numPoints));
    const angle = Math.PI / steps;


    // first build the 2D array
    const vertices: [number, number, number][][] = [];
    for (let x = 0; x < steps; x++) {
      for (let y = 0; y < steps * 2; y++) {
        const euler = new Euler(
          x * angle,
          y * angle,
          0
        );
        const vector = new Vector3(
          0,
          0,
          AsteroidHelper.distance(radius)
        );
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
    for (let x = 0; x < steps; x++) {
      for (let y = 0; y < steps * 2; y++) {
        const xni = (x === steps - 1) ? 0 : (x + 1);
        const yni = (y === steps * 2 - 1) ? 0 : (y + 1);
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

  private static distance(max: number, smoothness = 0.8) {
    return max * (Math.random() * (1 - smoothness) + smoothness);
  }
}
