export default function updateFile<T extends FileShareFile | null>(
    filesRef: Ref<T[]>,
    index: number
) {
    const fileEditModal = useFileEditModal();

    fileEditModal.value = filesRef.value[index];

    // Listen for updates on file edit modal
    const unwatch = watch(fileEditModal, (newFileEditModal) => {
        if (newFileEditModal === null) return;
        filesRef.value[index] = newFileEditModal as T;
        unwatch();
    });
}
