<script setup lang="ts">
const auth = useAuth();

const { data: files, status } = await useAsyncData(
    async () => {
        const res = await $fetch("/api/files").catch((err) =>
            console.error(err)
        );

        if (!res) return [];

        return res.map((file) => {
            const date = new Date(file.created);
            const timestamps = {
                relative: getRelativeTimestamp(date),
                absolute: date.toLocaleString(navigator.language),
            };

            return {
                id: file.id,
                name: file.name,
                type: file.type,
                sizeString: file.sizeString,
                owner: file.owner,
                created: timestamps,
            };
        });
    },
    { server: false }
);

const filesRef = computed(() => files);

const contextMenuOpen = useContextMenu();
</script>

<template>
    <main v-if="status !== 'pending'">
        <TransitionGroup class="file-list" name="list" tag="div">
            <NuxtLink
                v-for="(file, index) in files"
                :key="file.id"
                class="file-list__file"
                :external="
                    file.type && file.type.startsWith('video') ? false : true
                "
                :to="
                    file.type && file.type.startsWith('video')
                        ? `/watch/${file.id}`
                        : `/embed/${file.id}`
                "
                @click.stop="
                    () =>
                        useTrackEvent('File View', {
                            props: { filename: file.name },
                        })
                "
            >
                <div class="file-list__file-thumbnail">
                    <img
                        v-if="file.type && file.type.startsWith('video')"
                        :src="`/thumbnails/${file.id}.png`"
                    />
                    <img
                        v-else-if="file.type && file.type.startsWith('image')"
                        :src="`/files/${file.id}`"
                    />
                    <Icon
                        v-else
                        name="material-symbols:note-rounded"
                        size="5em"
                    />
                </div>
                <div class="file-list__file-info">
                    <p class="file-list__file-name" :title="file.name">
                        {{ file.name }}
                    </p>
                    <button
                        @click.stop.prevent="(_) => openContextMenu(file.id)"
                    >
                        <Icon name="material-symbols:more-vert" size="1.25em" />
                    </button>
                </div>
                <div class="file-list__file-info">
                    <NuxtLink
                        class="file-list__file-owner"
                        :to="`/user/${file.owner.id}`"
                        :title="`Uploader: ${file.owner.name}`"
                    >
                        {{ file.owner.name }}
                    </NuxtLink>
                    <p :title="file.created.absolute">
                        {{ file.created.relative }}
                    </p>
                </div>
                <Transition>
                    <div
                        v-if="contextMenuOpen === file.id"
                        class="file-list__file-menu"
                    >
                        <NuxtLink
                            :download="file.name"
                            :href="`/files/${file.id}`"
                            :title="`Download file (${file.sizeString})`"
                            :external="true"
                            @click.stop="
                                () =>
                                    useTrackEvent('File Download', {
                                        props: { filename: file.name },
                                    })
                            "
                        >
                            <div>
                                <Icon
                                    name="material-symbols:download-rounded"
                                    size="1.25em"
                                />
                            </div>
                            <p>Download ({{ file.sizeString }})</p>
                        </NuxtLink>
                        <button
                            @click.stop.prevent="(_) => copyEmbedLink(file.id)"
                        >
                            <div>
                                <Icon
                                    name="material-symbols:content-copy-rounded"
                                    size="1.25em"
                                />
                            </div>
                            <p>Copy embed link</p>
                        </button>
                        <button
                            v-if="
                                auth.authenticated && auth.id === file.owner.id
                            "
                            @click.stop.prevent="
                                (_) => deleteFile(filesRef, index, file.id)
                            "
                        >
                            <div>
                                <Icon
                                    name="material-symbols:delete-rounded"
                                    size="1.25em"
                                />
                            </div>
                            <p>Delete file</p>
                        </button>
                    </div>
                </Transition>
            </NuxtLink>
        </TransitionGroup>
    </main>
</template>

<style lang="scss">
main {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.file-list {
    --file-width: 20em;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--file-width), 1fr));
    place-items: center;
    gap: 2em;
    width: 100%;
    padding: 1em;

    &__file {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 1em;
        width: var(--file-width);
        max-width: 100%;
        height: 17em;
        padding: 1em;
        border-radius: 6px;

        &-menu {
            position: absolute;
            top: 50%;
            left: 50%;
            display: grid;
            grid-template-columns: 2.5em 1fr;
            align-content: center;
            background-color: var(--bg-raise-1);
            border: 1px solid var(--text-alt);
            border-radius: 4px;
            font-size: 1.25rem;
            z-index: 100;
            translate: -50% -50%;

            > * {
                display: contents;

                > * {
                    min-width: max-content;
                    width: 100%;
                    padding-block: 0.5em;
                    text-wrap: nowrap;

                    &:first-child {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding-left: 0.75em;
                        padding-right: 0.25em;
                    }
                    &:last-child {
                        padding-left: 0.25em;
                        padding-right: 1em;
                    }
                }
            }
        }

        &-thumbnail {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            min-height: 1em;
            max-height: 13em;
            object-fit: contain;

            > img {
                height: auto;
                max-height: 100%;
                border-radius: 4px;
            }
        }

        &-name {
            --font-size: 1.25em;
            width: 100%;
            min-height: var(--font-size);
            font-size: var(--font-size);
            overflow-x: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.25em;
            width: 100%;
        }

        &-visibility {
            padding: 0.25em 0.5em;
            border-radius: 4px;

            &:hover {
                background-color: var(--bg-raise);
            }

            > * {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.25em;
            }
        }

        &-owner {
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &:has(&-name:hover) > &-name,
        &:has(&-thumbnail:hover) > &-name {
            color: rgb(var(--fg-primary));
        }

        &-owner {
            color: var(--text-alt);
            font-size: 1.125em;
        }
    }
}
</style>
