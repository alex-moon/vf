import {Ui} from "@/ts/ui/ui";

export class HudUi extends Ui {
  protected image!: HTMLImageElement;

  public constructor(width: number, height: number) {
    super(width, height);
    const image = new Image();
    image.onload = () => {
      this.image = image;
    }
    image.src = "/hud.png";
  }

  public draw() {
    if (this.image) {
      this.context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
      this.context.drawImage(this.image, 21, 21);
      this.context.font = "16pt pixelmix";
      this.context.fillStyle = "rgba(255, 255, 255, 1)";
      this.context.fillText("Kalchioydeis Oytemidas", 165, 37, 420);
      this.texture.needsUpdate = true;
    }
  }
}
