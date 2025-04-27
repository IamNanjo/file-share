<script setup lang="ts">
type ParsedProfile = {
    id: string;
    name: string;
    files: FileShareFile[];
};

const auth = useAuth();
const contextMenuOpen = useContextMenu();

const placeholderProfile = { id: "", name: "Unknown user", files: [] };

const files = ref<FileShareFile[]>([]);
const filesRef = computed(() => files);

const { data: profile, status } = useLazyAsyncData<ParsedProfile>(
    async () => {
        const res = await $fetch("/api/profile");

        if (res === null) return placeholderProfile;

        useTrackPageview({ props: { user: res.name } });

        return {
            ...res,
            files: res.files.map((file) => {
                const date = new Date(file.created);
                const parsed: FileShareFile = {
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
                        loading="lazy"
                        :src="`/thumbnails/${file.id}.png`"
                    />
                    <img
                        v-else-if="file.type && file.type.startsWith('image')"
                        loading="lazy"
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
                    <p v-if="auth.authenticated" class="file-list__file-owner">
                        {{ auth.name }}
                    </p>
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
                                        props: { file: file.name },
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
                            @click.stop.prevent="
                                () => updateFileWithModal(filesRef, index)
                            "
                        >
                            <div>
                                <Icon
                                    name="material-symbols:edit-document-rounded"
                                    size="1.25em"
                                />
                            </div>
                            <p>Edit file</p>
                        </button>
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
.profile-header {
    padding-block: 2em;
    font-size: 1.5em;
}
</style>
