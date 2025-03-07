import crypto from "node:crypto";
import { accessSync, constants, mkdirSync } from "node:fs";

let sessionSecret = process.env.FILESHARE_SECRET ?? "";
let uploadsPath = process.env.FILESHARE_UPLOADS_PATH ?? "";
let filesPath = process.env.FILESHARE_FILES_PATH ?? "";
let thumbnailsPath = process.env.FILESHARE_THUMBNAILS_PATH ?? "";

function hasReadWriteAccess(filepath) {
    try {
        accessSync(filepath, constants.R_OK);
        accessSync(filepath, constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

// Default to random 64 character secret
sessionSecret =
    process.env.FILESHARE_SECRET ??
    crypto.randomBytes(48).toString("base64url");

if (!sessionSecret || sessionSecret.length < 32) {
    console.error("FILESHARE_SECRET must be at least 32 characters long");
    process.exit(1);
}

if (uploadsPath) {
    filesPath = `${uploadsPath}/files`;
    thumbnailsPath = `${uploadsPath}/thumbnails`;

    const uploadsHasRWAccess = hasReadWriteAccess(uploadsPath);

    if (!uploadsHasRWAccess) {
        console.error("FILESHARE_UPLOADS_PATH does not have read/write access");
        process.exit(1);
    }
    if (uploadsHasRWAccess && !hasReadWriteAccess(filesPath)) {
        mkdirSync(filesPath);
    }
    if (uploadsHasRWAccess && !hasReadWriteAccess(thumbnailsPath)) {
        mkdirSync(thumbnailsPath);
    }
} else if (!filesPath) {
    console.error("FILESHARE_UPLOADS_PATH or FILESHARE_FILES_PATH not defined");
    process.exit(1);
} else if (!thumbnailsPath) {
    console.error(
        "FILESHARE_UPLOADS_PATH or FILESHARE_THUMBNAILS_PATH not defined"
    );
    process.exit(1);
}

if (!hasReadWriteAccess(filesPath)) {
    console.error("File upload path is not readable or writable");
    process.exit(1);
}

if (!hasReadWriteAccess(thumbnailsPath)) {
    console.error("Thumbnail upload path is not readable or writable");
    process.exit(1);
}

export { sessionSecret, filesPath, thumbnailsPath };
