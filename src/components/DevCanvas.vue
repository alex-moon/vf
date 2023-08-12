<template>
  <div ref="canvas"></div>
</template>

<script lang='ts'>
import {Options, Vue} from 'vue-class-component';
import {Dev} from "@/ts/dev";

@Options({
  inject: ['dev'],
})
export default class DevCanvas extends Vue {
  dev!: Dev;
  mounted() {
    this.dev.init(this.$refs.canvas);
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
