<script setup lang="ts">
const fileEntries = ref<
    {
        id?: string;
        name: string;
        file: File;
        progress: number;
        private: boolean;
        upload?: XMLHttpRequest;
        url?: string;
    }[]
>([]);
const dragging = ref(false);
const uploading = ref(false);

function addFiles(fileList: FileList) {
    const blockedFileTypes = [
        "text/html",
        "text/php",
        "text/x-php",
        "application/php",
        "application/x-php",
        "application/x-httpd-php",
        "application/x-httpd-php-source",
    ];

    for (const file of fileList) {
        if (file.size === 0 || blockedFileTypes.includes(file.type)) continue;

        let alreadyAdded = false;

        for (const f of fileEntries.value) {
            if (
                file.name === f.file.name &&
                file.size === f.file.size &&
                file.type === f.file.type &&
                file.lastModified === f.file.lastModified
            ) {
                alreadyAdded = true;
            }
        }

        if (alreadyAdded) continue;

        const splitFileName = file.name.split(".");
        const fileNameWithoutExtension =
            splitFileName.length > 1
                ? splitFileName.slice(0, -1).join(".")
                : file.name;

        fileEntries.value.push({
            file,
            name: fileNameWithoutExtension,
            progress: 0,
            private: false,
        });
    }
}

function removeFile(index: number) {
    fileEntries.value.splice(index, 1);
}

function handleFileSelect(e: Event) {
    const fileInput = e.currentTarget as HTMLInputElement;
    const fileList = fileInput.files;

    if (!fileList) return;

    addFiles(fileList);
    fileInput.value = "";
}

async function handleUpload() {
    let uploadsStarted = 0;
    let uploadsFinished = 0;
    fileEntries.value.forEach(async (fileEntry, i) => {
        if (fileEntry.url) return;

        const splitFileName = fileEntry.file.name.split(".");

        const newUpload = await $fetch("/api/upload", {
            method: "POST",
            body: {
                name: fileEntry.name,
                extension:
                    splitFileName.length > 1 ? `.${splitFileName.pop()}` : "",
                private: fileEntry.private,
            },
        });

        if (!newUpload || !newUpload.id) return;

        uploading.value = true;
        uploadsStarted++;

        fileEntries.value[i].id = newUpload.id;

        const formData = new FormData();
        formData.append("file", fileEntries.value[i].file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
            const progress = Math.floor((e.loaded / e.total) * 100);
            fileEntries.value[i].progress = progress;
        });

        xhr.addEventListener("load", () => {
            fileEntries.value[i].url =
                `${location.origin}/embed/${newUpload.id}`;

            uploadsFinished++;
            if (uploadsStarted === uploadsFinished) uploading.value = false;
        });

        xhr.addEventListener("error", () => {
            uploading.value = false;
        });

        xhr.open("POST", `/api/upload/${newUpload.id}`, true);

        xhr.send(formData);

        fileEntries.value[i].upload = xhr;
    });

    if (!uploadsStarted) uploading.value = false;
}

function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
}

function cancelUpload() {
    uploading.value = false;
    for (let i = 0, len = fileEntries.value.length; i < len; i++) {
        fileEntries.value[i].upload?.abort();
        fileEntries.value[i].upload = undefined;
        fileEntries.value[i].progress = 0;
    }
}

function humanReadableFilesize(bytes: number) {
    const sizes = ["B", "KB", "MB", "GB", "TB"];

    if (bytes === 0) return "0 B";

    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));

    return `${(Math.round(100 * (bytes / Math.pow(1024, i))) / 100).toFixed(1)} ${
        sizes[i]
    }`;
}

onMounted(() => {
    // Disable default drag and drop behavior
    window.ondrop = (e) => e.preventDefault();
    window.ondragover = (e) => e.preventDefault();

    window.addEventListener("dragover", () => (dragging.value = true));
    window.addEventListener("dragleave", () => (dragging.value = false));

    window.addEventListener("drop", (e) => {
        dragging.value = false;

        const fileList = e.dataTransfer?.files;

        if (!fileList) return;

        addFiles(fileList);
    });
});
</script>

<template>
    <main>
        <form
            id="upload-form"
            :class="`upload-form${dragging ? ' dragging' : ''}`"
            @submit.prevent="handleUpload"
        >
            <p v-if="!fileEntries.length" class="upload-form__text">
                Drop files here or select them manually
            </p>

            <ul v-else class="upload-form__files">
                <li
                    :key="fileEntry.id || index"
                    v-for="(fileEntry, index) in fileEntries"
                    class="upload-form__file"
                    :title="`${fileEntry.progress} %`"
                >
                    <div class="upload-form__file-name">
                        <a
                            v-if="uploading || fileEntry.url"
                            :href="fileEntry.url"
                            >{{ fileEntry.name }}</a
                        >
                        <input
                            v-else
                            type="text"
                            :value="fileEntry.name"
                            @change="
                                (e) =>
                                    (fileEntries[index].name = (
                                        e.currentTarget as HTMLInputElement
                                    ).value)
                            "
                        />
                        <div
                            class="upload-form__file-progress"
                            :style="`width: ${fileEntry.progress}%;`"
                        ></div>
                    </div>

                    <div class="upload-form__file-info">
                        <p class="upload-form__file-size">
                            {{ humanReadableFilesize(fileEntry.file.size) }}
                        </p>

                        <div class="upload-form__file-buttons">
                            <button
                                v-if="!fileEntry.url"
                                type="button"
                                @click="
                                    fileEntries[index].private =
                                        !fileEntry.private
                                "
                                :title="
                                    fileEntry.private
                                        ? 'The file will be private'
                                        : 'The file will be public'
                                "
                            >
                                <Icon
                                    v-if="fileEntry.private"
                                    name="material-symbols:visibility-off-rounded"
                                    size="1.5em"
                                />
                                <Icon
                                    v-else
                                    name="material-symbols:visibility-rounded"
                                    size="1.5em"
                                />
                            </button>
                            <button
                                v-if="!fileEntry.url"
                                type="button"
                                @click="removeFile(index)"
                                title="Remove file"
                            >
                                <Icon
                                    name="material-symbols:close-rounded"
                                    size="1.5em"
                                />
                            </button>
                            <button
                                v-else
                                type="button"
                                @click="handleCopyUrl(fileEntry.url)"
                                title="Copy link to file"
                            >
                                <Icon
                                    name="material-symbols:content-copy-rounded"
                                    size="1.5em"
                                />
                            </button>
                        </div>
                    </div>
                </li>
            </ul>

            <div class="upload-form__buttons">
                <label class="upload-form__button">
                    Select files
                    <input
                        multiple
                        type="file"
                        value=""
                        @change="handleFileSelect"
                    />
                </label>
                <button
                    v-if="uploading"
                    class="upload-form__button"
                    type="button"
                    @click="cancelUpload"
                >
                    Cancel Upload
                </button>
                <button
                    v-else-if="fileEntries.length"
                    class="upload-form__button"
                    type="submit"
                >
                    Upload
                </button>
            </div>
        </form>
    </main>
</template>

<style scoped lang="scss">
main {
    display: grid;
    place-items: center;
    grid-template-columns: 1fr;
    padding-block: 2em;
}
</style>

<style lang="scss">
@keyframes border-dance {
    0% {
        background-position:
            left top,
            right bottom,
            left bottom,
            right top;
    }
    100% {
        background-position:
            left 15px top,
            right 15px bottom,
            left bottom 15px,
            right top 15px;
    }
}

.upload-form {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    width: 90%;
    max-width: 40em;
    padding: 3em 1em;

    background-image:
        linear-gradient(90deg, silver 50%, transparent 50%),
        linear-gradient(90deg, silver 50%, transparent 50%),
        linear-gradient(0deg, silver 50%, transparent 50%),
        linear-gradient(0deg, silver 50%, transparent 50%);
    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    background-size:
        15px 2px,
        15px 2px,
        2px 15px,
        2px 15px;
    background-position:
        left top,
        right bottom,
        left bottom,
        right top;

    &.dragging {
        background-color: var(--text-alt);
        animation: border-dance 1s infinite linear;
    }

    &__text {
        padding-block: 2em 4em;
        text-align: center;
        font-size: 1.125rem;
        user-select: none;
    }

    &__files {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 1em;
        padding-bottom: 2em;
        list-style-type: none;
    }

    &__file {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.5em;
        width: 100%;
        font-size: 1.125rem;

        &:not(:last-child) {
            padding-bottom: 1em;
            border-bottom: 1px solid var(--text-alt);
        }

        &-name {
            position: relative;
            width: 100%;
            background-color: transparent;
            border: 1px solid var(--text-alt);
            border-radius: 4px;
            text-shadow: 1px 1px 2px black;

            input,
            a {
                display: block;
                background-color: transparent;
                width: 100%;
                height: 100%;
                padding: 0.5em;
                border-radius: 4px;
                white-space: nowrap;
                overflow-x: auto;
            }
        }

        &-info {
            display: flex;
            width: max-content;
            gap: 1em;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding-inline: 1em;
        }

        &-size {
            font-family: var(--ff-mono);
            white-space: nowrap;
        }

        &-buttons {
            display: flex;
            gap: 0.5em;
        }

        &-progress {
            position: absolute;
            top: 0;
            left: 0;
            background-color: rgba(var(--fg-primary), 1);
            width: 0;
            height: 100%;
            z-index: -1;
            transition: width 1s ease;
        }
    }

    &__buttons {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        gap: 1em;
    }

    &__button {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5em;
        background-color: rgb(var(--fg-primary));
        color: white;
        padding: 0.5em 1em;
        border-radius: 6px;
        text-align: center;
        font-size: 1.25rem;
        font-weight: 500;
        text-shadow: 1px 1px 4px black;
        cursor: pointer;
        user-select: none;

        input {
            display: none;
        }
    }
}
</style>
