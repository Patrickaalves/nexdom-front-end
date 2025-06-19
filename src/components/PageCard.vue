<template>
  <v-container
    class="page-card bg-white"
    :style="computedStyle"
    fluid
  >
    <slot />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  maxWidth?: string | number,
  width?: string | number,
  margin?: string,
  padding?: string,
  styleOverrides?: Record<string, any> // para estilos extras
}>()

const computedStyle = computed(() => {
  const styles: Record<string, string> = {
    margin: props.margin ?? '16px auto',
    padding: props.padding ?? '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: props.maxWidth ? (typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth) : '1800px',
    width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : 'calc(100% - 64px)',
    boxSizing: 'border-box',
  }

  if (props.styleOverrides) {
    Object.assign(styles, props.styleOverrides)
  }

  return styles
})
</script>

<style scoped>
.page-card {
  box-sizing: border-box;
}
</style>
