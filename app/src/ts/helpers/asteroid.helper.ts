import qh from 'quickhull3d';
import {Euler, Vector3} from 'three';

export class AsteroidHelper {
  public static get(radius: number, numPoints?: number) {
    if (numPoints === undefined) {
      numPoints = Math.floor(0.1 * Math.PI * radius * radius);
    }
    const vertices = [];
    for (let i = 0; i < numPoints; i ++) {
      const euler = new Euler(
        AsteroidHelper.angle(),
        AsteroidHelper.angle(),
        AsteroidHelper.angle(),
      );
      const vector = new Vector3(0, 0, AsteroidHelper.distance(radius));
      vector.applyEuler(euler);
      vertices.push([
        vector.x,
        vector.y,
        vector.z,
      ]);
    }
    const faces = qh(vertices);
    return {vertices, faces};
  }

  private static angle() {
    return Math.random() * Math.PI * 2;
  }

  private static distance(max: number, smoothness = 0.9) {
    return max * (Math.random() * (1 - smoothness) + smoothness);
  }
}
