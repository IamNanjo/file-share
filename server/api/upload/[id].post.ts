import path from "node:path";
import multer from "multer";
import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import { filesPath, thumbnailsPath } from "~/server/env.mjs";

import db from "~/server/db";

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
    const session = e.context.session;

    if (!id) return setResponseStatus(e, 400);
    if (!session) return setResponseStatus(e, 401);

    let upload = await db.file.findFirst({
        where: { id, ownerId: session.data.id },
    });

    if (!upload) return setResponseStatus(e, 404);

    const multerUpload = multer({
        storage: multer.diskStorage({
            destination: (_, __, cb) => cb(null, filesPath),
            filename: (_, __, cb) => cb(null, id),
        }),
        fileFilter: (req, file, cb) => {
            req.on("close", () => {
                if (!req.complete) {
                    db.file
                        .delete({ where: { id: upload.id } })
                        .catch(console.error)
                        .finally(() => cb(new Error("Upload cancelled")));
                }
            });

            const blockedFileTypes = [
                "text/html",
                "text/php",
                "text/x-php",
                "application/php",
                "application/x-php",
                "application/x-httpd-php",
                "application/x-httpd-php-source",
            ];

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

            let width = 0;
            let height = 0;

            if (
                file.mimetype.startsWith("video") ||
                file.mimetype.startsWith("image")
            ) {
                try {
                    const dimensions = await new Promise<FfprobeData>(
                        (resolve, reject) =>
                            ffmpeg(path.join(filesPath, id)).ffprobe(
                                (err, data) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(data);
                                }
                            )
                    ).catch((err) => {
                        console.error(err);
                        process.exit(1);
                    });

                    const w = dimensions.streams[0].width;
                    const h = dimensions.streams[0].height;

                    if (w) width = w;
                    if (h) height = h;

                    ffmpeg(path.join(filesPath, id)).screenshot({
                        filename: `${id}.png`,
                        folder: thumbnailsPath,
                        timestamps: [0],
                        size: "640x360",
                    });
                } catch (err) {
                    console.error(err);
                }
            }

            await db.file.update({
                where: { id, ownerId: session.data.id },
                data: {
                    type: file.mimetype,
                    size: file.size,
                    width,
                    height,
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
