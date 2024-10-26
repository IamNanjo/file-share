<script setup lang="ts">
const route = useRoute();

const { data: profile, status } = await useFetch(
  `/api/user/${route.params.id}`
);
</script>

<template>
  <main v-if="status !== 'pending' && profile">
    <header class="profile-header">
      <h1>{{ profile.name }}'s files</h1>
    </header>

    <div class="file-list">
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
        <Icon
          v-else
          class="file-list__file-thumbnail"
          name="material-symbols:note-rounded"
          size="5em"
        />
        <p class="file-list__file-name" :title="file.name">{{ file.name }}</p>
        <div class="file-list__file-info">
          <NuxtLink
            class="file-list__file-owner"
            :to="`/user/${profile.id}`"
            :title="profile.name"
          >
            {{ profile.name }}
          </NuxtLink>
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.profile-header {
  padding-block: 2em;
  font-size: 1.5em;
}
</style>
