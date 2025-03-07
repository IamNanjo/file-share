import path from "node:path";
import fs from "node:fs/promises";

import db from "~/server/db";
import { filesPath, thumbnailsPath } from "~/server/env.mjs";

export default defineEventHandler(async (e) => {
    const id = getRouterParam(e, "id");
    const session = e.context.session;

    if (!id) return setResponseStatus(e, 400);
    if (!session) return setResponseStatus(e, 401);

    if (!filesPath || !thumbnailsPath) return setResponseStatus(e, 500);

    let deletedFile;

    try {
        deletedFile = await db.file.delete({
            where: { id, ownerId: session.data.id },
            select: { id: true },
        });

        if (!deletedFile) return setResponseStatus(e, 404);
    } catch (err) {
        console.error(err);
    }

    await fs.unlink(path.join(filesPath, id)).catch(() => null);
    await fs.unlink(path.join(thumbnailsPath, `${id}.png`)).catch(() => null);

    setResponseStatus(e, 204);
    return deletedFile;
});
