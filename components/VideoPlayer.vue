<script setup lang="ts">
defineProps<{ url: string }>();
</script>

<template>
  <div class="video-player">
    <video class="video-player__video" controls :src="url" />
    <div class="video-player__controls"></div>
  </div>
</template>

<style style="scss">
.video-player {
  display: flex;
  flex-direction: column;
  max-width: 90%;
  height: 80svh;

  &__video {
  }

  > * {
    width: 100%;
  }
}
</style>
