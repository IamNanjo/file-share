import multer from "multer";
import ffmpeg from "fluent-ffmpeg";

import db from "~/server/db";
import getServerSession from "~/server/getServerSession";

const filesPath = process.env.FILESHARE_FILES_PATH;
const thumbnailsPath = process.env.FILESHARE_THUMBNAILS_PATH;

function humanReadableFilesize(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  if (bytes === 0) return "0 B";

  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));

  return `${(Math.round(100 * (bytes / Math.pow(1024, i))) / 100).toFixed(1)} ${
    sizes[i]
  }`;
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
        if (!filesPath) throw new Error("No path for files defined");
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

      ffmpeg(`${filesPath}/${id}`)
        .screenshot({
          filename: `${id}.png`,
          folder: thumbnailsPath,
          timestamps: [0],
          size: "550x309",
        })
        .run();

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
