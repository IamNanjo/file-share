export interface FileShareFile {
    id: string;
    name: string;
    type: string | null;
    private: boolean;
    sizeString: string;
    created: {
        relative: string;
        absolute: string;
    };
}

export interface FileShareFileOwner {
    id: string;
    name: string;
}

export interface FileShareFileWithOptionalOwner extends FileShareFile {
    owner?: FileShareFileOwner;
}

export interface FileShareFileWithOwner extends FileShareFile {
    owner: FileShareFileOwner;
}
