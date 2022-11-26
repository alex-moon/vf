import {Ui} from "@/ts/ui/ui";
import {World} from "@/ts/world";
import {ShipHandler} from "@/ts/handlers/ship.handler";
import {AsteroidHandler} from "@/ts/handlers/asteroid.handler";
import {Quaternion, Vec3} from "cannon-es";
import {MathHelper} from "@/ts/helpers/math.helper";
import {BeltCube} from "@/ts/helpers/belt.helper";
import {ShipController} from "@/ts/controllers/ship.controller";

export class HudUi extends Ui {
  protected $name!: HTMLDivElement;
  protected $messages!: HTMLDivElement;

  protected $direction!: HTMLDivElement;
  protected $directionIndicator!: HTMLDivElement;

  protected $distanceAndSpeed!: HTMLDivElement;
  protected $distanceIndicator!: HTMLDivElement;
  protected $speedIndicator!: HTMLDivElement;

  protected ship: ShipHandler|null = null;
  protected asteroid: AsteroidHandler|null = null;

  constructor($parent: HTMLDivElement) {
    super($parent, 21, 21, 579, 152);
    this.$el.style.backgroundImage = 'url(/hud.png)';

    this.$name = this.makeDiv(144, 17 - 8, 420, 16 + 8);
    this.$name.style.fontSize = '16px';
    this.$name.style.fontFamily = 'pixelmix bold';
    this.$name.style.color = 'white';

    this.$messages = this.makeDiv(144, 69 - 8, 420, 37 + 8);
    this.$messages.style.fontSize = '16px';
    this.$messages.style.fontFamily = 'pixelmix';
    this.$messages.style.color = 'white';

    this.$direction = this.makeDiv(0, 0, 121, 121);
    this.$directionIndicator = this.makeDiv(0, 0, 7, 7);
    this.$directionIndicator.style.backgroundColor = 'white';
    this.$direction.appendChild(this.$directionIndicator);

    this.$distanceAndSpeed = this.makeDiv(0, 129, 579, 23);
    this.$distanceIndicator = this.makeDiv(8, 8, 563, 2);
    this.$distanceIndicator.style.backgroundColor = 'white';
    this.$speedIndicator = this.makeDiv(8, 13, 563, 2);
    this.$speedIndicator.style.backgroundColor = 'white';
    this.$distanceAndSpeed.appendChild(this.$distanceIndicator);
    this.$distanceAndSpeed.appendChild(this.$speedIndicator);

    this.$el.appendChild(this.$name);
    this.$el.appendChild(this.$messages);
    this.$el.appendChild(this.$direction);
    this.$el.appendChild(this.$distanceAndSpeed);
  }

  public draw(world: World) {
    this.ship = world.getShip();
    this.asteroid = world.getAsteroid();
    this.drawName();
    this.drawMessages();
    this.drawDirection();
    this.drawDistanceAndSpeed();
  }

  protected drawName() {
    this.$name.innerText = this.asteroid?.getCube()?.name || '???';
  }

  protected drawMessages() {
    this.$messages.innerText = 'Objective: mine Hydrogen.';
  }

  protected drawDirection() {
    if (!this.asteroid || !this.ship) {
      this.$directionIndicator.style.display = 'none';
      return;
    }

    if (!this.ship.isFlying()) {
      this.$directionIndicator.style.display = 'none';
      return;
    }

    this.$directionIndicator.style.display = 'block';

    // pixel placement
    const minPX = 10;
    const minPY = 10;
    const maxPX = 99;
    const maxPY = 99;

    // euler dimensions
    const minEY = -Math.PI / 2;
    const minEX = -Math.PI / 2;
    const maxEY = Math.PI / 2;
    const maxEX = Math.PI / 2;

    const asteroidPosition = this.asteroid.getBody().position.clone();
    const shipPosition = this.ship.getBody().position.clone();
    const shipQuaternion = this.ship.getBody().quaternion.clone();

    // get vector from ship to asteroid
    const vecToAsteroid = new Vec3();
    asteroidPosition.vsub(shipPosition, vecToAsteroid);
    vecToAsteroid.scale(1 / vecToAsteroid.length());

    // get ship vector (i.e. in the y direction locally)
    const vecForward = new Vec3(0, 1, 0);
    // shipQuaternion.vmult(vecForward, vecForward); // NO! Multiply target by conjugate
    shipQuaternion.conjugate(shipQuaternion);
    shipQuaternion.vmult(vecToAsteroid, vecToAsteroid);

    // get euler to rotate the one to the other
    const quatToAsteroid = new Quaternion();
    quatToAsteroid.setFromVectors(vecForward, vecToAsteroid);
    const eulerToAsteroid = new Vec3();
    quatToAsteroid.toEuler(eulerToAsteroid);

    // finally, draw it
    const x = MathHelper.rescale(-eulerToAsteroid.z, minEY, maxEY, minPX, maxPX);
    const y = MathHelper.rescale(-eulerToAsteroid.x, minEX, maxEX, minPY, maxPY);
    if (x > maxPX || x < minPX || y > maxPY || y < minPY) {
      this.$directionIndicator.style.display = 'none';
      return;
    }
    this.$directionIndicator.style.top = (y - 3) + 'px';
    this.$directionIndicator.style.left = (x + 3) + 'px';
  }

  protected drawDistanceAndSpeed() {
    if (!this.asteroid || !this.ship) {
      this.$distanceIndicator.style.display = 'none';
      this.$speedIndicator.style.display = 'none';
      return;
    }

    if (!this.ship.isFlying()) {
      this.$distanceIndicator.style.display = 'none';
      this.$speedIndicator.style.display = 'none';
      return;
    }

    this.$distanceIndicator.style.display = 'block';
    this.$speedIndicator.style.display = 'block';

    // pixel placement
    const minWidth = 0;
    const maxWidth = 563;

    // vector dimensions
    const minDistance = 0;
    const maxDistance = Math.sqrt(BeltCube.EDGE * BeltCube.EDGE * 3); // major diagonal of cube
    const minSpeed = 0;
    const maxSpeed = ShipController.MAX_SPEED;

    const asteroidPosition = this.asteroid.getBody().position.clone();
    const shipPosition = this.ship.getBody().position.clone();
    const shipVelocity = this.ship.getBody().velocity.clone();

    // get vector from ship to asteroid
    const distanceToAsteroid = new Vec3();
    asteroidPosition.vsub(shipPosition, distanceToAsteroid);

    const distance = distanceToAsteroid.length();
    const speed = shipVelocity.length();

    // finally, draw it
    const distanceWidth = MathHelper.rescale(distance, minDistance, maxDistance, minWidth, maxWidth);
    const speedWidth = MathHelper.rescale(speed, minSpeed, maxSpeed, minWidth, maxWidth);

    this.$distanceIndicator.style.width = MathHelper.clamp(distanceWidth, minWidth, maxWidth) + 'px';
    this.$speedIndicator.style.width = MathHelper.clamp(speedWidth, minWidth, maxWidth) + 'px';
  }
}
