<script setup lang="ts"></script>

<template>
  <main>
    <VideoPlayer :url="`/files/${$route.params.id}`" />
  </main>
</template>

<style scoped lang="scss">
main {
  justify-content: flex-start;
  align-items: center;
  padding-block: 2em;
}
</style>
