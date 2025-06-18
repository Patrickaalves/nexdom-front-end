<!-- src/components/PageCard.vue -->
<template>
  <v-container
    class="bg-white"
    style="
      margin: 16px auto;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 1800px;
      width: calc(100% - 64px);
    "
    :style="customStyle"
  >
    <slot />
  </v-container>
</template>

<script setup lang="ts">
defineProps<{
  customStyle?: string
}>()
</script>
