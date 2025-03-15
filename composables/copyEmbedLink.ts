export default function copyEmbedLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/embed/${id}`);
}
