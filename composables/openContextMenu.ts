export default function openContextMenu(id: string) {
    const contextMenuOpen = useContextMenu();
    contextMenuOpen.value = id;

    document.addEventListener(
        "pointerdown",
        () => (contextMenuOpen.value = ""),
        { once: true }
    );
}
