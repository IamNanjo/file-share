<script setup lang="ts">
const { data: files, status } = useAsyncData(
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

const contextMenuOpen = ref("");

function getRelativeTimestamp(date: Date) {
    const now = Date.now();
    const diffMs = now - date.getTime(); // Difference in milliseconds
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(); // Fallback for dates over a week
}

function openContextMenu(id: string) {
    contextMenuOpen.value = id;

    document.addEventListener("mouseup", () => (contextMenuOpen.value = ""), {
        once: true,
    });
    document.addEventListener("touchend", () => (contextMenuOpen.value = ""), {
        once: true,
    });
}

function showContextMenu(e: Event, id: string) {
    const el = e.currentTarget as HTMLAnchorElement | null;
    const _id = id;

    if (!el) return;

    const addEvent = el?.addEventListener;

    addEvent("mouseup", () => openContextMenu(_id), {
        once: true,
    });
    addEvent("touchend", () => openContextMenu(_id), {
        once: true,
    });
}

function copyEmbedLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/embed/${id}`);
}

async function deleteFile(e: Event, index: number, id: string) {
    e.preventDefault();
    e.stopPropagation();

    if (!files.value) return;

    await $fetch(`/api/files/${id}`, { method: "delete" });

    files.value.splice(index, 1);
}

onBeforeUnmount(() => {});
</script>

<template>
    <main v-if="status !== 'pending'" class="file-list">
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
            @click.right.prevent="(e) => showContextMenu(e, file.id)"
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
            <p class="file-list__file-name" :title="file.name">
                {{ file.name }}
            </p>
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
                    <a
                        :download="file.name"
                        :href="`/files/${file.id}`"
                        :title="`Download file (${file.sizeString})`"
                    >
                        <Icon
                            name="material-symbols:download-rounded"
                            size="1.25em"
                        />
                        <p>Download ({{ file.sizeString }})</p>
                    </a>
                    <button @click.stop.prevent="(_) => copyEmbedLink(file.id)">
                        <Icon
                            name="material-symbols:content-copy-rounded"
                            size="1.25em"
                        />
                        <p>Copy embed link</p>
                    </button>
                    <button
                        @click.stop.prevent="
                            (e) => deleteFile(e, index, file.id)
                        "
                    >
                        <Icon
                            name="material-symbols:delete-rounded"
                            size="1.25em"
                        />
                        <p>Delete file</p>
                    </button>
                </div>
            </Transition>
        </NuxtLink>
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
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 1em;
        width: 100%;
        height: 16.5em;
        padding: 1em;
        border-radius: 6px;

        &-menu {
            position: absolute;
            top: 50%;
            left: 50%;
            display: grid;
            grid-template-columns: 1.25em 1fr;
            align-items: center;
            gap: 0.5em;
            background-color: var(--bg-raise-1);
            padding: 0.5em;
            border: 1px solid var(--text-alt);
            border-radius: 4px;
            font-size: 1.25rem;
            z-index: 100;
            translate: -50% -50%;

            > * {
                display: contents;
                transition: color 0.2s ease;

                &:hover {
                    color: rgb(var(--fg-primary));
                }

                > * {
                    min-width: max-content;
                    padding: 0.25em 0.5em;
                    text-wrap: nowrap;
                }
            }
        }

        &-thumbnail {
            max-width: 100%;
            height: 9em;
        }

        &-name {
            --font-size: 1.25em;
            width: 90%;
            min-height: var(--font-size);
            font-size: var(--font-size);
            overflow-x: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s ease;
        }

        &-info {
            display: flex;
            justify-content: space-between;
            gap: 0.25em;
            width: 90%;
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
            transition: color 0.3s ease;

            &:hover {
                color: rgb(var(--fg-primary));
            }
        }
    }
}
</style>
