export default async function deleteComment(
    comments: Ref<any[]>,
    index: number,
    id: number
) {
    if (!comments.value) return;

    await $fetch(`/api/comments/${id}`, { method: "delete" });

    comments.value.splice(index, 1);
}
