<script setup lang="ts">
const title = useTitle();
const menuIsOpen = useMenuIsOpen();
const fileEditModal = useFileEditModal();

const filename = ref<string | null>(null);
const fileVisibility = ref<boolean | null>(null);

useHead({
    title,
    meta: [
        { name: "description", content: "FileShare" },
        { name: "keywords", content: "FileShare, File Share" },
        { name: "author", content: "IamNanjo" },
    ],
});

onMounted(() => {
    const mainElement = document.querySelector("main");

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") menuIsOpen.value = !menuIsOpen.value;
    });

    mainElement?.addEventListener("click", (e) => {
        e.stopPropagation();
        menuIsOpen.value = false;
    });
    mainElement?.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        menuIsOpen.value = false;
    });
});

function updateFile() {
    if (!fileEditModal.value) return;
    const { files, index } = fileEditModal.value;
    const oldFile = fileEditModal.value.files.value[index];

    $fetch(`/api/files/${files.value[index].id}`, {
        body: {
            name: filename.value || oldFile.name,
            private: fileVisibility.value || oldFile.private,
        } satisfies Partial<File>,
    });
}
</script>

<template>
    <NuxtLoadingIndicator color="#F38BA8" :height="3" />
    <NavBar />
    <dialog v-if="fileEditModal !== null" open class="file-edit-modal">
        <form @submit.prevent="updateFile">
            <div class="file-edit-modal__form-group">
                <label for="filename-input" class="file-edit-modal__label"
                    >File</label
                >
                <input
                    required
                    id="filename-input"
                    class="file-edit-modal__input"
                    type="text"
                    min="1"
                    v-model="filename"
                    :placeholder="
                        fileEditModal.files.value[fileEditModal.index].name
                    "
                />
            </div>
            <div class="file-edit-modal__form-group">
                <label for="filename-input" class="file-edit-modal__label"
                    >Visibility</label
                >
                <!-- <Switch /> -->
            </div>
            <div class="file-edit-modal__inline-form-group">
                <button
                    class="button"
                    type="reset"
                    @click="() => (fileEditModal = null)"
                >
                    Cancel
                </button>
                <button class="button button-primary" type="submit">
                    Save
                </button>
            </div>
        </form>
    </dialog>
    <NuxtPage />
</template>

<style lang="scss">
/* Page transition */
.page-enter-active,
.page-leave-active {
    transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}
/* =============== */

/* Transition groups */
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    scale: 0;
}
/* ================= */

/* Default transition */
.v-enter-active,
.v-leave-active {
    transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
/* ================ */

*,
*::before,
*::after {
    box-sizing: border-box;
    min-width: 0;
    margin: 0;
    padding: 0;
    font: inherit;
    border: 0;
    outline: 0;
    outline-offset: 2px;
    transition-property: background-color;
    transition-duration: 0.3s;
    transition-timing-function: ease;
}

::-webkit-scrollbar {
    $size: 6px;
    width: $size;
    height: $size;

    &-track {
        background-color: transparent;
    }

    &-thumb {
        background-color: var(--text-alt);
        border-radius: $size * 2;
    }
}

:focus-visible {
    outline: 2px solid var(--text-primary);
}

:root {
    color-scheme: dark;
    --bg-primary: #121212;
    --bg-raise: rgba(255, 255, 255, 0.07);
    --bg-raise-1: #232323;
    --fg-primary: 255, 105, 97;
    --text-primary: white;
    --text-alt: #666666;
    --text-muted: #a6adc8;
    --ff-primary: system-ui, sans-serif;
    --shadow-color: black;
}

:root.black {
    --bg-primary: black;
    --bg-raise-1: #121212;
}

:root.light {
    color-scheme: light;
    --bg-primary: #ffffff;
    --bg-raise: rgba(0, 0, 0, 0.07);
    --bg-raise-1: #ffffff;
    --text-primary: black;
    --text-alt: #aaaaaa;
    --text-muted: #181825;
    --shadow-color: #7f7f7f;
}

#__nuxt {
    display: contents;
}

html {
    font-family: var(--ff-primary);
    scroll-behavior: smooth;
}

html,
body,
main {
    position: relative;
    min-height: 100%;
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    padding-block: 3em;
    font-family: var(--ff-primary);
    overflow-x: hidden;
    z-index: 0;
}

main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

nav {
    z-index: 10;
}

button {
    /* Reset button styling */
    background: none repeat scroll 0 0 transparent;
    border: medium none;
    border-spacing: 0;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    margin: 0;
    padding: 0;
    text-align: left;
    text-decoration: none;
    text-indent: 0;
    cursor: pointer;
}

a,
kbd,
img,
button {
    user-select: none;
}

a {
    color: var(--text-primary);
    text-decoration: none;
}

.button {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0.5em 1em;
    border-radius: 6px;
    font-weight: 500;
}

.button-primary {
    background-color: var(--text-primary);
    color: var(--bg-primary);

    &:hover,
    &:focus-visible {
        background-color: var(--text-muted);
    }
}
</style>
