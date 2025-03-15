export default function openContextMenu(id: string | number) {
    const contextMenuOpen = useContextMenu();
    contextMenuOpen.value = id;

    document.addEventListener(
        "pointerdown",
        () => (contextMenuOpen.value = ""),
        { once: true }
    );
}
