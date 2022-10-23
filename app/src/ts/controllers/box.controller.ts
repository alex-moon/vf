import {Controller} from "@/ts/controllers/controller";
import {BoxEntity} from "@/ts/entities/box.entity";
import {Mesh} from "three";

export class BoxController extends Controller<BoxEntity> {
  protected mesh!: Mesh;
  public setMesh(mesh: Mesh) {
    this.mesh = mesh;
  }
  public getMesh() {
    return this.mesh;
  }
}
