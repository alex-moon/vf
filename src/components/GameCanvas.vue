<template>
  <div ref="canvas" />
</template>

<script setup lang='ts'>
import { ref, onMounted, inject } from 'vue';
import type { Vf } from '@/ts/vf';

const vf = inject<Vf>('vf');
const canvas = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (canvas.value && vf) {
    vf.init(canvas.value);
  }
});
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
