<template>
  <v-app>
    <v-layout>
      <v-app-bar color="indigo">
        <v-app-bar-nav-icon @click.stop="toggleDrawer()"></v-app-bar-nav-icon>
        <template v-slot:append>
          <h1>
            VoidFill
            <a href="/">
              <img src="../public/logo.png" alt="VoidFill logo" />
            </a>
          </h1>
        </template>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" permanent color="indigo-lighten-2">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              VoidFill
            </v-list-item-title>
            <v-list-item-subtitle>
              an asteroid mining game
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense nav>
          <v-list-item link to="/" prepend-icon="mdi-rocket-launch">
            Play
          </v-list-item>

          <v-list-item link to="/about" prepend-icon="mdi-help">
            About
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main color="grey">
        <router-view></router-view>
        <!-- <vf-game-canvas></vf-game-canvas> -->
      </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import GameCanvas from "@/components/GameCanvas.vue";
import DevCanvas from "@/components/DevCanvas.vue";
import {Vf} from "@/ts/vf";

@Options({
  components: {
    'vf-game-canvas': GameCanvas,
    'vf-dev-canvas': DevCanvas,
  },
  inject: ['vf'],
})
export default class App extends Vue {
  vf!: Vf;
  public drawer = true;
  public toggleDrawer() {
    this.drawer = !this.drawer;
    setTimeout(() => {
      this.vf.resize();
    }, 200);
  }
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
