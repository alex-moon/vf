<template>
  <v-app>
    <v-layout>
      <v-app-bar>

      </v-app-bar>
      <v-navigation-drawer>

      </v-navigation-drawer>
      <v-main>
        <!-- @todo router -->
        <vf-game-canvas></vf-game-canvas>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import GameCanvas from "@/components/GameCanvas.vue";

@Options({
  components: {
    'vf-game-canvas': GameCanvas,
  }
})
export default class App extends Vue {}
</script>

<style scoped>
</style>
