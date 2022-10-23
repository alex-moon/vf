import {Jack} from "@/ts/entities/jack";
import {JackController} from "@/ts/controllers/jack.controller";
import * as THREE from "three";
import {Object3D, TextureLoader} from "three";

export class World {
  protected loader: TextureLoader;
  protected floor: Object3D;
  protected jack!: JackController;

  constructor() {
    this.loader = new TextureLoader();
    this.loadSky();
    this.loadFloor();
    this.loadJack();
  }

  protected loadJack() {
    this.jack = new JackController(new Jack());
  }

  protected loadFloor() {
    const geometry = new THREE.BoxGeometry( 1000, 0, 1000);
    const map = loader.load("/floor.png");
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1000, 1000);
    map.minFilter = THREE.NearestFilter;
    map.magFilter = THREE.NearestFilter;
    const material = new THREE.MeshBasicMaterial({map});
    this.floor = new THREE.Mesh(geometry, material);
  }
}
