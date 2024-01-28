<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { data: profile, pending, refresh } = await useLazyFetch("/api/profile");

async function deleteFile(e: Event, id: string) {
  e.stopPropagation();
  await $fetch(`/api/files/${id}`, { method: "DELETE" });
  refresh({ dedupe: true });
}
</script>

<template>
  <main>
    <header class="profile-header">
      <h1>Your videos</h1>
      <div></div>
    </header>

    <div v-if="!pending && profile" class="file-list">
      <NuxtLink
        v-for="file in profile.files"
        :key="file.id"
        class="file-list__file"
        :external="true"
        :to="
          file.type && file.type.startsWith('video')
            ? `/watch/${file.id}`
            : `/embed/${file.id}`
        "
      >
        <img
          v-if="file.type && file.type.startsWith('video')"
          class="file-list__file-thumbnail"
          :src="`/thumbnails/${file.id}.png`"
        />
        <img
          v-else-if="file.type && file.type.startsWith('image')"
          class="file-list__file-thumbnail"
          :src="`/files/${file.id}`"
        />
        <Icon v-else name="material-symbols:note-rounded" size="5em" />
        <p class="file-list__file-name">{{ file.name }}</p>
        <div class="file-list__file-info">
          <button @click="(e) => deleteFile(e, file.id)">
            <Icon name="material-symbols:delete-rounded" size="1.25em" />
          </button>
          <a
            class="file-list__file-size"
            :download="file.name"
            :href="`/files/${file.id}`"
            :title="`Download file (${file.sizeString})`"
          >
            <Icon name="material-symbols:download-rounded" size="1.25em" />
            <p>{{ file.sizeString }}</p>
          </a>
        </div></NuxtLink
      >
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  flex-direction: column;
  justify-content: flex-start;
}

.profile-header {
  padding-block: 2em;
  font-size: 1.5em;
}
</style>
