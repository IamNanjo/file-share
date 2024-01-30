import path from "node:path";
import fs from "node:fs/promises";

import db from "~/server/db";
import getServerSession from "~/server/getServerSession";

export default defineEventHandler(async (e) => {
  const id = getRouterParam(e, "id");
  const session = await getServerSession(e);

  if (!id) return setResponseStatus(e, 400);
  if (!session || !session.user) return setResponseStatus(e, 401);

  const filesPath = process.env.FILESHARE_FILES_PATH;
  const thumbnailsPath = process.env.FILESHARE_THUMBNAILS_PATH;

  if (!filesPath || !thumbnailsPath) return setResponseStatus(e, 500);

  let deletedFile;

  try {
    deletedFile = await db.file.delete({
      where: { id, ownerId: session.user.id },
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
