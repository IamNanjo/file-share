import { randomBytes } from "node:crypto";
import z from "zod";

import db from "~/server/db";

const bodySchema = z.object({
    name: z.string(),
    extension: z.string(),
    private: z.boolean().default(false),
});

export default defineEventHandler(async (e) => {
    const body = await readValidatedBody(e, (body) =>
        bodySchema.parseAsync(body)
    );
    const session = e.context.session;

    if (!session) return setResponseStatus(e, 401);

    const fullFileName = randomBytes(7).toString("base64url") + body.extension;

    return db.file.create({
        data: {
            id: fullFileName,
            ownerId: session.data.id,
            name: body.name,
            private: body.private,
        },
        select: { id: true },
    });
});
