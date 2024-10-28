<script setup lang="ts">
defineProps<{ url: string }>();
</script>

<template>
    <div class="video-player">
        <video class="video-player__video" controls :src="url" />
        <div class="video-player__controls"></div>
    </div>
</template>

<style lang="scss">
.video-player {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: calc(80svh - 5em);
    overflow: hidden;

    > * {
        width: 100%;
    }

    &__video {
        max-height: calc(80svh - 5em);
    }

    &__controls {
        position: absolute;
        bottom: -2em;
        left: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        transition: all 0.3s ease;
    }

    &:hover > &__controls {
        bottom: 0;
    }
}
</style>
