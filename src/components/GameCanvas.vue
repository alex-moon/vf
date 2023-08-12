<template>
  <div ref="canvas"></div>
</template>

<script lang='ts'>
import {Options, Vue} from 'vue-class-component';
import {Vf} from "@/ts/vf";

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
  margin: 0;
  // @todo need to reset three etc. on change
  width: 100%;
  height: calc(100vh - 70px);
  position: relative;
}
</style>
