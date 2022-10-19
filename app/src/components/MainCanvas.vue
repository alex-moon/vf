<template>
  <canvas>

  </canvas>
</template>

<script lang="ts">
import { Component, Vue, Inject} from 'vue-property-decorator';

@Component({

})
export default class MainCanvas extends Vue {
  @Inject('vf') vf: any;
  created() {
    (window as any).cunt = this.vf;
    console.log('vf on cunt');
  }
}
</script>

<style scoped>

</style>
