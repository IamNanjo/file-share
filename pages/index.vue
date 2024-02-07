<script setup lang="ts">
const { data: files, pending } = await useLazyFetch("/api/files");
</script>

<template>
  <main v-if="!pending" class="file-list">
    <NuxtLink
      v-for="file in files"
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
      <p class="file-list__file-name" :title="file.name">
        {{ file.name }}
      </p>
      <div class="file-list__file-info">
        <NuxtLink
          class="file-list__file-owner"
          :to="`/user/${file.owner.id}`"
          :title="file.owner.name"
        >
          {{ file.owner.name }}
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
  </main>
</template>

<style lang="scss">
.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
  align-content: start;
  gap: 2em;
  width: 100%;
  padding: 1em;

  &__file {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 1em;
    background-color: var(--bg-raise-1);
    width: 100%;
    height: 16.5em;
    padding: 1em;
    border: 1px solid var(--text-alt);
    border-radius: 6px;
    box-shadow: 1px 1px 4px 4px black;

    &-thumbnail {
      max-width: 100%;
      height: 9em;
    }

    &-name {
      width: 80%;
      text-align: center;
      font-size: 1.25em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.3s ease;
    }

    &-info {
      display: flex;
      justify-content: space-between;
      gap: 0.25em;
      width: 100%;
      padding-inline: 1em;
    }

    &-owner {
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-size {
      display: flex;
      gap: 1em;
    }

    &:hover > &-name {
      color: rgb(var(--fg-primary));
    }

    &-owner,
    &-size,
    &-delete {
      color: var(--text-alt);
      font-size: 1.125em;
      transition: color 0.3s ease;

      &:hover {
        color: rgb(var(--fg-primary));
      }
    }
  }
}
</style>
