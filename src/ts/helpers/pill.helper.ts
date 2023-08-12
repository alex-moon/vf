import qh from "quickhull3d";

export class PillHelper {
  static CAP_HEIGHT = 1 / 5;

  public static get(height: number, width: number, depth: number) {
    const capHeight = height * PillHelper.CAP_HEIGHT;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const points: [number, number, number][] = [
      // base
      [0, 0, 0,],

      // bottom of body
      [halfWidth, capHeight, halfDepth,],
      [halfWidth, capHeight, -halfDepth,],
      [-halfWidth, capHeight, halfDepth,],
      [-halfWidth, capHeight, -halfDepth,],

      // top of body
      [halfWidth, height - capHeight, halfDepth,],
      [halfWidth, height - capHeight, -halfDepth,],
      [-halfWidth, height - capHeight, halfDepth,],
      [-halfWidth, height - capHeight, -halfDepth,],

      // head
      [0, height, 0,],
    ];
    return {
      vertices: points,
      faces: qh(points),
    }
  }
}
