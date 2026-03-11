<template>
  <v-app>
    <v-layout>
      <v-app-bar color="indigo">
        <v-app-bar-nav-icon @click.stop="toggleDrawer()" />
        <template #append>
          <h1>
            VoidFill
            <a href="/">
              <img
                src="/logo.png"
                alt="VoidFill logo"
              >
            </a>
          </h1>
        </template>
      </v-app-bar>
      <v-navigation-drawer
        v-model="drawer"
        permanent
        color="indigo-lighten-2"
      >
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

        <v-divider />

        <v-list
          dense
          nav
        >
          <v-list-item
            link
            to="/"
            prepend-icon="mdi-rocket-launch"
          >
            Play
          </v-list-item>

          <v-list-item
            link
            to="/about"
            prepend-icon="mdi-help"
          >
            About
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main color="grey">
        <router-view />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import GameCanvas from '@/components/GameCanvas.vue';
import type { Vf } from '@/ts/vf';

const vf = inject<Vf>('vf');
const drawer = ref(true);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
  setTimeout(() => {
    if (vf) {
      vf.resize();
    }
  }, 200);
};
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
