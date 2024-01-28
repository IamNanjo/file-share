import multer from "multer";

import db from "~/server/db";
import getServerSession from "~/server/getServerSession";

function humanReadableFilesize(bytes: number) {
  const dp = 1;
  const thresh = 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;

  do {
    bytes /= thresh;
    ++u;
  } while (bytes >= thresh && u < units.length - 1);

  return `${bytes.toFixed(dp)} ${units[u]}`;
}

export default defineEventHandler(async (e) => {
  const id = getRouterParam(e, "id");
  const session = await getServerSession(e);

  if (!id) return setResponseStatus(e, 400);
  if (!session || !session.user) return setResponseStatus(e, 401);

  let upload = await db.file.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!upload) return setResponseStatus(e, 404);

  const multerUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const filesPath = process.env.FILESHARE_FILES_PATH;
        if (!filesPath) throw Error("No path for files defined");
        cb(null, filesPath);
      },
      filename: async (req, file, cb) => {
        cb(null, id);
      },
    }),
    fileFilter: (req, file, cb) => {
      const blockedFileTypes = ["text/html", "application/x-httpd-php"];

      blockedFileTypes.includes(file.mimetype)
        ? cb(new Error("These file types are not accepted"))
        : cb(null, true);
    },
  });

  // @ts-ignore
  return callNodeListener(multerUpload.single("file"), e.node.req, e.node.res)
    .then(async () => {
      const file = (e.node.req as any).file as {
        originalname: string;
        mimetype: string;
        size: number;
      };

      await db.file.update({
        where: { id, ownerId: session!.user!.id },
        data: {
          type: file.mimetype,
          size: file.size,
          sizeString: humanReadableFilesize(file.size),
        },
      });

      return setResponseStatus(e, 201);
    })
    .catch((err) =>
      createError({
        message: err.message,
        statusCode: 422,
        statusMessage: "Entity cannot be processed",
      })
    );
});
