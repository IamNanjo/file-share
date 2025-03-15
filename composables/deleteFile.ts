export default async function deleteFile(
    files: Ref<any[] | null>,
    index: number,
    id: string
) {
    if (!files.value) return;

    await $fetch(`/api/files/${id}`, { method: "delete" });

    files.value.splice(index, 1);
}
