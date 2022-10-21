<template>
  <div ref="canvas"></div>
</template>

<script lang='ts'>
import {Options, Vue} from 'vue-class-component';
import Vf from "@/ts/vf";

@Options({
  inject: ['vf'],
})
export default class GameCanvas extends Vue {
  vf!: Vf;
  mounted() {
    this.vf.init(this.$refs.canvas);
  }
}
</script>

<style scoped lang="scss">
div {
  display: block;
  border: solid 1px #535c69;
  margin: 24px auto;
  width: 800px;
  height: 600px;
  position: relative;
}
</style>
