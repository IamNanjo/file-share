<script setup lang="ts">
const fileEditModal = useFileEditModal();

const filename = ref<string | null>(null);
const fileVisibility = ref(false);

const fileEditModalRef = useTemplateRef<HTMLDialogElement>("file-edit-modal");

function cancelEdit() {
    fileEditModal.value = null;
    fileEditModalRef.value?.close();
}

async function updateFile() {
    if (!fileEditModal.value) return;
    const oldFile = fileEditModal.value;

    const newFile = await $fetch(`/api/files/${oldFile.id}`, {
        method: "PUT",
        body: {
            name: filename.value || oldFile.name,
            private: fileVisibility.value || oldFile.private,
        } satisfies Partial<FileShareFile>,
    }).catch(() => null);

    if (!newFile) return;

    fileEditModal.value = { ...oldFile, ...newFile };
    fileEditModalRef.value?.close();
}

onMounted(() => {
    // Handle closing without using form buttons
    fileEditModalRef.value?.addEventListener("close", () => {
        fileEditModal.value = null;
    });

    watch(fileEditModal, (newFileEditModal) => {
        if (newFileEditModal) fileEditModalRef.value?.showModal();
        else fileEditModalRef.value?.close();
    });
});
</script>

<template>
    <dialog ref="file-edit-modal" class="file-edit-modal">
        <form
            v-if="fileEditModal !== null"
            class="file-edit-modal__form"
            @submit.prevent="updateFile"
        >
            <div class="file-edit-modal__form-group">
                <label for="filename-input" class="file-edit-modal__label"
                    >Filename</label
                >
                <input
                    required
                    id="filename-input"
                    class="file-edit-modal__input"
                    type="text"
                    min="1"
                    autocomplete="off"
                    autocapitalize="off"
                    autocorrect="off"
                    :value="filename !== null ? filename : fileEditModal.name"
                    :placeholder="fileEditModal.name"
                    @input="
                        (e: Event) =>
                            (filename = (e.currentTarget as HTMLInputElement)
                                .value)
                    "
                />
            </div>
            <div class="file-edit-modal__form-group">
                <label for="file-visibility" class="file-edit-modal__label"
                    >Visibility</label
                >

                <Switch
                    id="file-visibility"
                    :default="Number(!fileVisibility)"
                    :options="[
                        {
                            text: 'Hidden',
                            select() {
                                fileVisibility = false;
                            },
                        },
                        {
                            text: 'Visible',
                            select() {
                                fileVisibility = true;
                            },
                        },
                    ]"
                />
            </div>
            <div
                class="file-edit-modal__inline-form-group file-edit-modal__buttons"
            >
                <button class="button" type="reset" @click="cancelEdit">
                    Cancel
                </button>
                <button class="button button-primary" type="submit">
                    Save
                </button>
            </div>
        </form>
    </dialog>
</template>

<style lang="scss">
.file-edit-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;

    --radius: 4px;
    width: 95%;
    max-width: 30em;
    border-radius: var(--radius);

    &::backdrop {
        backdrop-filter: blur(4px);
    }

    &__form {
        display: flex;
        flex-direction: column;
        gap: 1em;
        background-color: var(--bg-raise-1);
        width: 100%;
        padding: 1em 2em;
        border-radius: var(--radius);
        font-size: 1.125rem;
    }

    &__form-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25em;
    }
    &__inline-form-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25em;
    }

    &__label {
        font-weight: 500;
    }

    &__input {
        background-color: var(--bg-raise);
        width: 100%;
        padding: 0.5em 0.25em;
        border: 1px solid #7f7f7f;
        border-radius: var(--radius);
    }

    &__buttons {
        justify-content: flex-end;
    }
}
</style>
