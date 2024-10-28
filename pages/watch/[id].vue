<script setup lang="ts">
const route = useRoute();
const { data, status } = useLazyAsyncData(
    async () => {
        const res = await $fetch(`/api/watch/${route.params.id}`);

        if (!res) return null;

        return {
            ...res,
            created: new Date(res.created).toLocaleString(navigator.language),
        };
    },
    { server: false }
);
</script>

<template>
    <main>
        <VideoPlayer :url="`/files/${route.params.id}`" />
        <template v-if="status === 'success' && data !== null">
            <div class="video__info">
                <div>{{ data.name }}</div>
                <div>{{ data.created }}</div>
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
                >
                    <Icon
                        name="material-symbols:download-rounded"
                        size="1.25em"
                    />
                    Download
                </NuxtLink>
            </div>
            <form
                method="post"
                action="/api/comment"
                class="video__comment-form"
            >
                <div class="video__new-comment">
                    <textarea
                        name="content"
                        placeholder="New comment..."
                        rows="1"
                        oninput="this.parentNode.dataset.replicatedValue = this.value"
                    ></textarea>
                </div>
                <div class="video__comment-buttons">
                    <div class="video__comment-cancel">
                        <button type="reset">
                            <Icon
                                name="material-symbols:close-rounded"
                                size="1.25em"
                            />
                            <span>Cancel</span>
                        </button>
                    </div>
                    <div class="video__comment-send">
                        <button>
                            <Icon
                                name="material-symbols:send-rounded"
                                size="1.25em"
                            />
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            </form>
            <div class="video__comments">
                <div
                    v-for="(comment, index) in data.comments"
                    :key="index"
                    class="video__comment"
                >
                    <a
                        :href="`/user/${comment.owner.id}`"
                        class="video__comment-author"
                    >
                        {{ comment.owner.name }}
                    </a>
                    <div class="video__comment-content">
                        {{ comment.content }}
                    </div>
                </div>
            </div>
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
    &__info,
    &__comments,
    &__comment {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 60rem;
        padding-block: 0.75em;
        font-size: 1.125rem;
    }

    &__info {
        justify-content: space-between;
        font-size: 1.25rem;

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
    }

    &__comment {
        &-author {
        }
        &-content {
        }
    }
}
</style>
