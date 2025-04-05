export default () =>
    useState<FileShareFileWithOptionalOwner | null>(
        "fileEditModal",
        () => null
    );
