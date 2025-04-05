export default function openContextMenu(id: string | number) {
    const contextMenuOpen = useContextMenu();
    contextMenuOpen.value = id;

    document.addEventListener("pointerup", () => (contextMenuOpen.value = ""), {
        once: true,
    });
}
