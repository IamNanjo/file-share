<script setup lang="ts">
import CommentContent from "~/components/CommentContent.vue";

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
const { session } = useAuth();

const comments = ref<Comment[]>([]);
const commentsRef = computed(() => comments);

const { data, status } = useLazyAsyncData(
    async () => {
        const { comments: _comments, ...res } = await $fetch(
            `/api/watch/${route.params.id}`
        );

        const date = new Date(res.created);

        comments.value = _comments.map((comment) => {
            const date = new Date(comment.created);

            return {
                ...comment,
                created: {
                    relative: getRelativeTimestamp(date),
                    absolute: date.toLocaleString(navigator.language),
                },
            };
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
const newMessageParentNode = ref("");

function toggleExpand(id: number) {
    expandedComment.value = expandedComment.value !== id ? id : null;
}

async function postComment() {
    const res = await $fetch("/api/comments", {
        method: "post",
        body: {
            fileId: route.params.id,
            authorId: session.value?.user?.id,
            content: newMessageParentNode.value,
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

    newMessageParentNode.value = "";
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
                >
                    <Icon
                        name="material-symbols:download-rounded"
                        size="1.25em"
                    />
                    Download
                </NuxtLink>
            </div>
            <form
                v-if="session && session.user"
                method="post"
                action="/api/comments"
                class="video__comment-form"
                @submit.prevent="postComment"
            >
                <div
                    class="video__new-comment"
                    :data-replicated-value="newMessageParentNode"
                >
                    <input
                        type="hidden"
                        name="fileId"
                        :value="route.params.id"
                    />
                    <input
                        type="hidden"
                        name="authorId"
                        :value="session?.user?.id"
                    />
                    <textarea
                        name="content"
                        placeholder="New comment..."
                        rows="1"
                        v-model="newMessageParentNode"
                    ></textarea>
                </div>
                <div class="video__comment-buttons">
                    <Transition>
                        <div
                            v-if="newMessageParentNode !== ''"
                            class="video__comment-cancel"
                        >
                            <button
                                type="reset"
                                @click="() => (newMessageParentNode = '')"
                            >
                                <Icon
                                    name="material-symbols:close-rounded"
                                    size="1.25em"
                                />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </Transition>
                    <Transition>
                        <div
                            v-if="newMessageParentNode !== ''"
                            class="video__comment-send"
                        >
                            <button>
                                <Icon
                                    name="material-symbols:send-rounded"
                                    size="1.25em"
                                />
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
                            <Icon
                                name="material-symbols:more-vert"
                                size="1.25em"
                            />
                        </button>
                    </div>
                    <!-- Automatically displays Show More and Show Less buttons -->
                    <CommentContent
                        :id="comment.id"
                        :content="comment.content"
                        :expanded-comment="expandedComment"
                        :toggle-expand="toggleExpand"
                    />
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
                                        size="1.25em"
                                    />
                                </div>
                                <p>Copy comment</p>
                            </button>
                            <button
                                v-if="session?.user?.id === comment.owner.id"
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
                                        size="1.25em"
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
        margin-inline: auto;

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

    &__new-comment {
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
        }

        &-info > :first-child {
            color: var(--text-alt);
            font-size: 1rem;
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
