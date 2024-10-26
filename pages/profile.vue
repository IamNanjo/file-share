<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { data: profile, status } = await useFetch("/api/profile");
const files = ref(profile.value ? profile.value.files : []);

async function deleteFile(e: Event, index: number, id: string) {
  e.preventDefault();
  e.stopPropagation();

  if (!profile.value) return;

  await $fetch(`/api/files/${id}`, { method: "delete" });

  files.value.splice(index, 1);
}

onMounted(() => {
  files.value = profile.value ? profile.value.files : [];
});
</script>

<template>
  <main>
    <header class="profile-header">
      <h1>Your files</h1>
    </header>

    <TransitionGroup
      v-if="status !== 'pending' && profile"
      class="file-list"
      name="list"
      tag="div"
    >
      <NuxtLink
        v-for="(file, index) in files"
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
        <Icon
          v-else
          class="file-list__file-thumbnail"
          name="material-symbols:note-rounded"
          size="5em"
        />
        <p class="file-list__file-name" :title="file.name">{{ file.name }}</p>
        <div class="file-list__file-info">
          <button
            class="file-list__file-delete"
            @click="(e) => deleteFile(e, index, file.id)"
            title="Delete file"
          >
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
    </TransitionGroup>
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.profile-header {
  padding-block: 2em;
  font-size: 1.5em;
}
</style>
