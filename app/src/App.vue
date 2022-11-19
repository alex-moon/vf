<template>
  <v-app>
    <v-layout>
      <v-app-bar color="indigo">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <template v-slot:append>
          <h1>
            VoidFill
            <a href="/">
              <img src="logo.png" alt="VoidFill logo" />
            </a>
          </h1>
        </template>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" permanent color="indigo-lighten-2">

      </v-navigation-drawer>
      <v-main color="grey">
        <!-- @todo router -->
        <vf-game-canvas></vf-game-canvas>
<!--        <vf-dev-canvas></vf-dev-canvas>-->
      </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import GameCanvas from "@/components/GameCanvas.vue";
import DevCanvas from "@/components/DevCanvas.vue";

@Options({
  components: {
    'vf-game-canvas': GameCanvas,
    'vf-dev-canvas': DevCanvas,
  },
})
export default class App extends Vue {
  public drawer = true;
}
</script>

<style scoped lang="scss">
$logo-width: 32px;

.v-app-bar {
  display: flex;
  justify-content: space-between;
  h1 {
    font-size: 0;

    img {
      width: $logo-width;
      height: $logo-width;
    }
  }
}
</style>
