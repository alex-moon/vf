<template>
  <div class="about">
    <h2>VoidFill</h2>
    <p>
      VoidFill is a little game I wrote to learn some basic principles
      of 3D game design and development on
      <a href="https://threejs.org/" target="_blank">ThreeJS</a>
      and
      <a href="https://pmndrs.github.io/cannon-es/docs/" target="_blank">cannon-es</a>.
    </p>
    <p>
      <strong>This game does not work on mobile devices.</strong>
    </p>
    <p>
      You start out in a ship somewhere in an asteroid belt orbiting a lonely star.
      The aim of the game is to find individual asteroids and mine them for
      materials.
    </p>
    <p>
      Click the game canvas to capture the mouse and keyboard. Hit ESC at any time
      to relinquish the mouse and keyboard.
    </p>
    <p>
      <strong>To reiterate: this game does not work on mobile devices.</strong>
    </p>
    <h3>While flying</h3>
    <p>
      Use the mouse to orient your ship. Use the W key to speed up. Use the S
      key to slow down. Use the A and D keys to roll.
    </p>
    <p>
      The HUD in the top left of the screen will help you find the nearest
      asteroid. The name of the asteroid appears in bold and useful
      information appears underneath it.
    </p>
    <p>
      The targeting reticule (the big square) on the left of the HUD shows your
      orientation relative to the named asteroid. Orient the ship until the dot
      is under the crosshair in the center of the reticule.
    </p>
    <p>
      Under the targeting reticule, you have two bars. The top bar shows
      your distance to the named asteroid, and the bottom bar shows your
      current speed.
    </p>
    <p>
      Right click an asteroid to land on it.
    </p>
    <h3>On foot</h3>
    <p>
      Use the WASD keys to walk around. Use the mouse to orient yourself
      and to look around.
    </p>
    <p>
      Right click ores to mine them. Right click the ship to enter the ship
      and leave the asteroid.
    </p>
    <p>
      Your inventory is shown in the bottom left of the screen.
    </p>
    <h3>And what then?</h3>
    <p>
      There was originally going to be a building element to the game where
      you "filled" the "void" of space with habitable environments. I learned
      enough about what I wanted to learn before building this part, so for now,
      the above is all you can do. Have fun!
    </p>
  </div>
</template>

<script lang='ts'>
import {Options, Vue} from 'vue-class-component';

@Options({})
export default class About extends Vue {
}
</script>

<style scoped lang="scss">
div.about {
  padding: 32px;

  p {
    margin: 16px 0;
  }
}
</style>
