<template>
  <span :style="{ fontSize: size }" :key="icon">
    <span class="iconify m-iconify" :data-icon="icon"></span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Icon',
  props: {
    icon: { type: String, required: true },
    size: { type: String, default: '18' }
  },

  setup() {
    return {}
  }
})
</script>

<style scoped lang="scss">
.m-iconify {
  vertical-align: middle;
}
</style>
