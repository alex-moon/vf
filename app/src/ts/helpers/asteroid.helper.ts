import qh from 'quickhull3d';

export class AsteroidHelper {
  public static get(width: number, height: number, depth: number, numPoints = 30) {
    const halfX = width / 2;
    const halfY = height / 2;
    const halfZ = depth / 2;
    const vertices = [];
    for (let i = 0; i < numPoints; i ++) {
      vertices.push([
        AsteroidHelper.random(halfX),
        AsteroidHelper.random(halfY),
        AsteroidHelper.random(halfZ),
      ]);
    }
    const faces = qh(vertices);
    return {vertices, faces};
  }

  private static random(extent: number) {
    return ((Math.random() - 0.5) * 2) * extent;
  }
}
