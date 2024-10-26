<script setup lang="ts">
const route = useRoute();
const { data } = await useLazyFetch(`/api/meta/${route.params.id}`);

if (data.value && data.value.meta) {
  useHeadSafe({ meta: [...data.value.meta, {name: "author", content: ""}] });
}
</script>

<template>
  <main>
    <VideoPlayer :url="`/files/${route.params.id}`" />
  </main>
</template>

<style scoped lang="scss">
main {
  justify-content: flex-start;
  align-items: center;
  padding-block: 2em;
}
</style>
