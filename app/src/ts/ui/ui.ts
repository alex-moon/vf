import {
  Camera,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Texture
} from "three";

// @see https://www.evermade.fi/story/pure-three-js-hud/
export abstract class Ui {
  protected $canvas: HTMLCanvasElement;
  protected context: CanvasRenderingContext2D;
  protected camera: Camera;
  protected scene: Scene;
  protected texture: Texture;

  constructor(width: number, height: number) {
    this.$canvas = document.createElement('canvas');
    this.$canvas.width = width;
    this.$canvas.height = height;

    const context = this.$canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not initialise UI: could not get context for canvas');
    }
    this.context = context;

    this.camera = new OrthographicCamera(
      -width/2,
      width/2,
      height/2,
      -height/2,
      0,
      30
    );
    this.scene = new Scene();

    this.texture = new Texture(this.$canvas)
    this.texture.needsUpdate = true;

    const material = new MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });

    const geometry = new PlaneGeometry(width, height);
    const plane = new Mesh(geometry, material);
    this.scene.add(plane);
  }

  public getCamera() {
    return this.camera;
  }

  public getScene() {
    return this.scene;
  }

  public abstract draw(): void;
}
