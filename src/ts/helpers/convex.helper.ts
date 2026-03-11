import {Box3, Float32BufferAttribute, Matrix4, Vector2, Vector3} from 'three';

// yoinked from https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
export class ConvexHelper {
  public static assignUVs(geometry: any) {
    geometry.computeBoundingBox();
    if (geometry.boundingBox) {
      const bboxSize = new Vector3();
      geometry.boundingBox.getSize(bboxSize);
      const uvMapSize = Math.min(bboxSize.x, bboxSize.y, bboxSize.z);
      this.applyBoxUV(geometry, undefined, uvMapSize);
      geometry.attributes.uv.needsUpdate = true;
    }
  }

  private static _applyBoxUV(geom: any, transformMatrix: Matrix4, bbox: any, bbox_max_size: any) {
    const coords: any[] = [];
    coords.length = 2 * geom.attributes.position.array.length / 3;

    // geom.removeAttribute('uv');
    if (geom.attributes.uv === undefined) {
      geom.setAttribute('uv', new Float32BufferAttribute(coords, 2));
    }

    //maps 3 verts of 1 face on the better side of the cube
    //side of the cube can be XY, XZ or YZ
    const makeUVs = (v0: Vector3, v1: Vector3, v2: Vector3) => {

      //pre-rotate the model so that cube sides match world axis
      v0.applyMatrix4(transformMatrix);
      v1.applyMatrix4(transformMatrix);
      v2.applyMatrix4(transformMatrix);

      //get normal of the face, to know into which cube side it maps better
      const n = new Vector3();
      n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize();

      n.x = Math.abs(n.x);
      n.y = Math.abs(n.y);
      n.z = Math.abs(n.z);

      const uv0 = new Vector2();
      const uv1 = new Vector2();
      const uv2 = new Vector2();
      // xz mapping
      if (n.y > n.x && n.y > n.z) {
        uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
        uv0.y = (bbox.max.z - v0.z) / bbox_max_size;

        uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
        uv1.y = (bbox.max.z - v1.z) / bbox_max_size;

        uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
        uv2.y = (bbox.max.z - v2.z) / bbox_max_size;
      } else
      if (n.x > n.y && n.x > n.z) {
        uv0.x = (v0.z - bbox.min.z) / bbox_max_size;
        uv0.y = (v0.y - bbox.min.y) / bbox_max_size;

        uv1.x = (v1.z - bbox.min.z) / bbox_max_size;
        uv1.y = (v1.y - bbox.min.y) / bbox_max_size;

        uv2.x = (v2.z - bbox.min.z) / bbox_max_size;
        uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
      } else
      if (n.z > n.y && n.z > n.x) {
        uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
        uv0.y = (v0.y - bbox.min.y) / bbox_max_size;

        uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
        uv1.y = (v1.y - bbox.min.y) / bbox_max_size;

        uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
        uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
      }

      return {
        uv0: uv0,
        uv1: uv1,
        uv2: uv2
      };
    };

    if (geom.index) { // is it indexed buffer geometry?
      for (let vi = 0; vi < geom.index.array.length; vi += 3) {
        const idx0 = geom.index.array[vi];
        const idx1 = geom.index.array[vi + 1];
        const idx2 = geom.index.array[vi + 2];

        const vx0 = geom.attributes.position.array[3 * idx0];
        const vy0 = geom.attributes.position.array[3 * idx0 + 1];
        const vz0 = geom.attributes.position.array[3 * idx0 + 2];

        const vx1 = geom.attributes.position.array[3 * idx1];
        const vy1 = geom.attributes.position.array[3 * idx1 + 1];
        const vz1 = geom.attributes.position.array[3 * idx1 + 2];

        const vx2 = geom.attributes.position.array[3 * idx2];
        const vy2 = geom.attributes.position.array[3 * idx2 + 1];
        const vz2 = geom.attributes.position.array[3 * idx2 + 2];

        const v0 = new Vector3(vx0, vy0, vz0);
        const v1 = new Vector3(vx1, vy1, vz1);
        const v2 = new Vector3(vx2, vy2, vz2);

        const uvs = makeUVs(v0, v1, v2);

        coords[2 * idx0] = uvs.uv0.x;
        coords[2 * idx0 + 1] = uvs.uv0.y;

        coords[2 * idx1] = uvs.uv1.x;
        coords[2 * idx1 + 1] = uvs.uv1.y;

        coords[2 * idx2] = uvs.uv2.x;
        coords[2 * idx2 + 1] = uvs.uv2.y;
      }
    } else {
      for (let vi = 0; vi < geom.attributes.position.array.length; vi += 9) {
        const vx0 = geom.attributes.position.array[vi];
        const vy0 = geom.attributes.position.array[vi + 1];
        const vz0 = geom.attributes.position.array[vi + 2];

        const vx1 = geom.attributes.position.array[vi + 3];
        const vy1 = geom.attributes.position.array[vi + 4];
        const vz1 = geom.attributes.position.array[vi + 5];

        const vx2 = geom.attributes.position.array[vi + 6];
        const vy2 = geom.attributes.position.array[vi + 7];
        const vz2 = geom.attributes.position.array[vi + 8];

        const v0 = new Vector3(vx0, vy0, vz0);
        const v1 = new Vector3(vx1, vy1, vz1);
        const v2 = new Vector3(vx2, vy2, vz2);

        const uvs = makeUVs(v0, v1, v2);

        const idx0 = vi / 3;
        const idx1 = idx0 + 1;
        const idx2 = idx0 + 2;

        coords[2 * idx0] = uvs.uv0.x;
        coords[2 * idx0 + 1] = uvs.uv0.y;

        coords[2 * idx1] = uvs.uv1.x;
        coords[2 * idx1 + 1] = uvs.uv1.y;

        coords[2 * idx2] = uvs.uv2.x;
        coords[2 * idx2 + 1] = uvs.uv2.y;
      }
    }

    (geom.attributes.uv as any).array = new Float32Array(coords);
  }

  private static applyBoxUV(geometry: any, transformMatrix ?: Matrix4, boxSize ?: any) {
    if (transformMatrix === undefined) {
      transformMatrix = new Matrix4();
    }

    if (boxSize === undefined) {
      const geom = geometry;
      geom.computeBoundingBox();
      const bbox = geom.boundingBox;

      if (bbox) {
        const bbox_size_x = bbox.max.x - bbox.min.x;
        const bbox_size_z = bbox.max.z - bbox.min.z;
        const bbox_size_y = bbox.max.y - bbox.min.y;

        boxSize = Math.max(bbox_size_x, bbox_size_y, bbox_size_z);
      }
    }

    const uvBbox = new Box3(new Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2), new Vector3(boxSize / 2, boxSize / 2, boxSize / 2));

    this._applyBoxUV(geometry, transformMatrix, uvBbox, boxSize);
  }
}
