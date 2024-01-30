<script setup lang="ts">
defineProps<{ url: string }>();
</script>

<template>
  <div class="video-player">
    <video class="video-player__video" controls :src="url" />
    <div class="video-player__controls"></div>
  </div>
</template>

<style>
.video-player {
  display: flex;
  flex-direction: column;
  max-width: 98%;
  aspect-ratio: 16 / 9;

  > * {
    width: 100%;
  }
}
</style>
