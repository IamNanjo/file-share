<script setup lang="ts">
const route = useRoute();
type ParsedProfile = {
    id: string;
    name: string;
    files: {
        id: string;
        name: string;
        type: string | null;
        sizeString: string;
        created: {
            relative: string;
            absolute: string;
        };
    }[];
};

const contextMenuOpen = useContextMenu();

const placeholderProfile = { id: "", name: "Unknown user", files: [] };

const files = ref<ParsedProfile["files"]>([]);
const filesRef = computed(() => files);

const { data: profile, status } = useLazyAsyncData<ParsedProfile>(
    async () => {
        const res = await $fetch(`/api/user/${route.params.id}`);

        if (res === null) return placeholderProfile;

        useTrackPageview({ props: { user: res.name } });

        return {
            ...res,
            files: res.files.map((file) => {
                const date = new Date(file.created);
                const parsed = {
                    ...file,
                    created: {
                        relative: getRelativeTimestamp(date),
                        absolute: date.toLocaleString(navigator.language),
                    },
                };
                files.value.push(parsed);
                return parsed;
            }),
        };
    },
    {
        server: false,
        default: () => placeholderProfile,
        deep: false,
    }
);
</script>

<template>
    <main v-if="status !== 'pending' && profile">
        <header class="profile-header">
            <h1>{{ profile.name }}'s files</h1>
        </header>

        <TransitionGroup class="file-list" name="list" tag="div">
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
                        @click.stop.prevent="() => openContextMenu(file.id)"
                    >
                        <Icon name="material-symbols:more-vert" size="1.25em" />
                    </button>
                </div>
                <div class="file-list__file-info">
                    <div class="file-list__file-owner">{{ profile.name }}</div>
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
                            @click="
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
                            @click.stop.prevent="() => copyEmbedLink(file.id)"
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
                            @click.stop.prevent="
                                () => deleteFile(filesRef, index, file.id)
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
