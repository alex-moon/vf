<template>
  <v-app>
    <v-layout>
      <v-app-bar color="grey-lighten-2"></v-app-bar>
      <v-navigation-drawer color="grey-darken-2" permanent></v-navigation-drawer>
      <v-main>
        <vf-main-canvas></vf-main-canvas>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import MainCanvas from './components/MainCanvas.vue';

@Component({
  components: {
    'vf-main-canvas': MainCanvas,
  },
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
