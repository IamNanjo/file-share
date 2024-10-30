export default function deleteComment(
    comments: Ref<any[]>,
    index: number,
    id: number
) {
    if (!comments.value) return;

    $fetch(`/api/comments/${id}`, { method: "delete" });

    comments.value.splice(index, 1);
}
