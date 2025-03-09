<script setup lang="ts">
type Comment = {
    id: number;
    content: string;
    owner: {
        id: string;
        name: string;
    };
    created: {
        relative: string;
        absolute: string;
    };
};

const route = useRoute();
const auth = useAuth();

const comments = ref<Comment[]>([]);
const commentsRef = computed(() => comments);

const { data, status } = useLazyAsyncData(
    async () => {
        const res = await $fetch(`/api/watch/${route.params.id}`);

        const date = new Date(res.created);

        comments.value = res.comments.map((comment) => {
            const date = new Date(comment.created);

            return {
                ...comment,
                created: {
                    relative: getRelativeTimestamp(date),
                    absolute: date.toLocaleString(navigator.language),
                },
            };
        });

        useTrackPageview({
            props: { filename: data.value?.name || "Unknown file" },
        });

        return {
            ...res,
            created: {
                relative: getRelativeTimestamp(date),
                absolute: date.toLocaleString(navigator.language),
            },
        };
    },
    { server: false }
);

const contextMenuOpen = useContextMenu();

const expandedComment = ref<number | null>(null);
const newMessageContent = ref("");

const commentEditId = ref<Comment["id"] | null>(null);
const commentEditContent = ref<Comment["content"]>("");

function toggleExpand(id: number) {
    expandedComment.value = expandedComment.value !== id ? id : null;
}

async function postComment() {
    if (!auth.value.authenticated) return;

    const res = await $fetch("/api/comments", {
        method: "post",
        body: {
            fileId: route.params.id,
            authorId: auth.value.id,
            content: newMessageContent.value,
        },
    }).catch(console.error);

    if (!res) return;

    const date = new Date(res.created);

    comments.value.unshift({
        ...res,
        created: {
            relative: getRelativeTimestamp(date),
            absolute: date.toLocaleString(navigator.language),
        },
    });

    newMessageContent.value = "";
}

function commentEditBegin(id: Comment["id"], oldContent: Comment["content"]) {
    commentEditId.value = id;
    commentEditContent.value = oldContent;
}

function commentEditCancel() {
    commentEditId.value = null;
    commentEditContent.value = "";
}

async function commentEditSubmit(index: number) {
    if (!commentEditId.value) return;

    comments.value[index].content = commentEditContent.value;

    $fetch(`/api/comments/${commentEditId.value}`, {
        method: "put",
        body: { content: commentEditContent.value },
    });

    commentEditId.value = null;
    commentEditContent.value = "";
}
</script>

<template>
    <main>
        <VideoPlayer :url="`/files/${route.params.id}`" />
        <template v-if="status === 'success' && data !== null">
            <div class="video__info">
                <div>{{ data.name }}</div>
                <div :title="data.created.absolute">
                    {{ data.created.relative }}
                </div>
            </div>
            <div class="video__info">
                <NuxtLink :to="`/user/${data.owner.id}`">
                    <Icon name="material-symbols:account-circle" />{{
                        data.owner.name
                    }}</NuxtLink
                >
                <NuxtLink
                    :download="data.name"
                    :to="`/files/${route.params.id}`"
                    :external="true"
                    :title="`Download file (${data.sizeString})`"
                    @click="
                        () =>
                            data?.name &&
                            useTrackEvent('File Download', {
                                props: { filename: data.name },
                            })
                    "
                >
                    <Icon name="material-symbols:download-rounded" />
                    Download
                </NuxtLink>
            </div>
            <form
                v-if="auth.authenticated"
                method="post"
                action="/api/comments"
                class="video__comment-form"
                @submit.prevent="postComment"
            >
                <div
                    class="video__new-comment"
                    :data-replicated-value="newMessageContent"
                >
                    <textarea
                        name="content"
                        placeholder="New comment..."
                        rows="1"
                        v-model="newMessageContent"
                    ></textarea>
                </div>
                <div class="video__comment-buttons">
                    <Transition>
                        <div
                            v-if="newMessageContent !== ''"
                            class="video__comment-cancel"
                        >
                            <button
                                type="reset"
                                @click="() => (newMessageContent = '')"
                            >
                                <Icon name="material-symbols:close-rounded" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </Transition>
                    <Transition>
                        <div
                            v-if="newMessageContent !== ''"
                            class="video__comment-send"
                        >
                            <button>
                                <Icon name="material-symbols:send-rounded" />
                                <span>Send</span>
                            </button>
                        </div>
                    </Transition>
                </div>
            </form>
            <TransitionGroup class="video__comments" name="list" tag="div">
                <div
                    v-for="(comment, index) in comments"
                    :key="comment.id"
                    class="video__comment"
                >
                    <div class="video__comment-info">
                        <div>
                            <a :href="`/user/${comment.owner.id}`">{{
                                comment.owner.name
                            }}</a>
                            ·
                            <span :title="comment.created.absolute">{{
                                comment.created.relative
                            }}</span>
                        </div>
                        <button @click="openContextMenu(comment.id)">
                            <Icon name="material-symbols:more-vert" />
                        </button>
                    </div>
                    <!-- Automatically displays Show More and Show Less buttons -->
                    <CommentContent
                        v-if="commentEditId !== comment.id"
                        :content="comment.content"
                        :expanded="expandedComment === comment.id"
                        :toggle-expand="() => toggleExpand(comment.id)"
                    />
                    <form
                        v-else
                        class="video__comment-editor"
                        @submit.prevent="() => commentEditSubmit(index)"
                    >
                        <div
                            class="video__comment-editor-input"
                            :data-replicated-value="commentEditContent"
                        >
                            <textarea v-model="commentEditContent"></textarea>
                        </div>
                        <div class="video__comment-editor-buttons">
                            <button type="reset" @click="commentEditCancel">
                                <Icon name="material-symbols:close-rounded" />
                                <p>Cancel</p>
                            </button>
                            <button>
                                <Icon name="material-symbols:done-rounded" />
                                <p>Save</p>
                            </button>
                        </div>
                    </form>
                    <Transition>
                        <div
                            v-if="contextMenuOpen === comment.id"
                            class="video__comment-menu"
                        >
                            <button
                                @click="() => copyToClipboard(comment.content)"
                            >
                                <div>
                                    <Icon
                                        name="material-symbols:content-copy-rounded"
                                    />
                                </div>
                                <p>Copy comment</p>
                            </button>
                            <button
                                v-if="
                                    auth.authenticated &&
                                    auth.id === comment.owner.id
                                "
                                @click="
                                    () =>
                                        commentEditBegin(
                                            comment.id,
                                            comment.content
                                        )
                                "
                            >
                                <div>
                                    <Icon
                                        name="material-symbols:edit-rounded"
                                    />
                                </div>
                                <p>Edit</p>
                            </button>
                            <button
                                v-if="
                                    auth.authenticated &&
                                    auth.id === comment.owner.id
                                "
                                @click="
                                    () =>
                                        deleteComment(
                                            commentsRef,
                                            index,
                                            comment.id
                                        )
                                "
                            >
                                <div>
                                    <Icon
                                        name="material-symbols:delete-rounded"
                                    />
                                </div>
                                <p>Delete</p>
                            </button>
                        </div>
                    </Transition>
                </div>
            </TransitionGroup>
        </template>
    </main>
</template>

<style scoped lang="scss">
main {
    justify-content: flex-start;
    align-items: center;
    padding: 2em 1em;
    padding-bottom: 6em;
}

.video {
    &__info {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 60rem;
        padding-block: 0.75em;
        font-size: 1.125rem;
        justify-content: space-between;
        font-size: 1.25rem;

        gap: 1em;

        > :first-child {
            text-align: start;
        }
        > :last-child {
            text-align: end;
        }

        > *:has(.iconify) {
            display: flex;
            align-items: center;
            gap: 0.25em;
            background-color: var(--bg-raise);
            padding: 0.25em 0.5em;
            border-radius: 4px;
        }
    }

    &__comment-form {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5em;
        width: 100%;
        max-width: 60rem;

        button {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.25em;
            background-color: var(--bg-raise);
            padding: 0.25em 0.5em;
            border-radius: 4px;
        }
    }

    &__comment-buttons {
        display: flex;
        gap: 0.5em;
        align-items: center;
        height: 1.75em;
        font-size: 1.125rem;
    }

    &__comment-editor {
        display: contents;
        font-size: 1.125rem;
    }

    &__comment-editor-buttons {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1em;
        width: 100%;

        button {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5em;
            background-color: var(--bg-raise);
            padding: 0.25em 0.5em;
            border-radius: 4px;
        }
    }

    &__new-comment,
    &__comment-editor-input {
        display: grid;
        width: 100%;

        &:after,
        textarea {
            grid-area: 1 / 1 / 2 / 2;
            background-color: var(--bg-raise);
            padding: 0.5rem;
            border: 1px solid var(--text-alt);
            border-radius: 4px;
        }

        &:after {
            content: attr(data-replicated-value) " ";
            white-space: pre-wrap;
            visibility: hidden;
        }

        textarea {
            height: 100%;
            resize: none;
            overflow: hidden;
        }
    }

    &__comments {
        display: flex;
        flex-direction: column;
        gap: 1.5em;
        width: 100%;
        max-width: 60rem;
        padding-top: 1em;
    }

    &__comment {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25em;

        &-info {
            display: flex;
            justify-content: space-between;
            gap: 1em;
            width: 100%;

            > :first-child {
                color: var(--text-alt);
                font-size: 1rem;
            }

            > :last-child {
                display: flex;
                align-items: center;
            }
        }

        &-menu {
            position: absolute;
            top: 1.5em;
            right: 0.25em;
            display: grid;
            grid-template-columns: 2.5em 1fr;
            align-content: center;
            background-color: var(--bg-raise-1);
            border: 1px solid var(--text-alt);
            border-radius: 4px;
            font-size: 1.25rem;
            z-index: 100;

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
    }
}
</style>
