import db from "~/server/db";
import getServerSession from "~/server/getServerSession";
import z from "zod";

export default defineEventHandler(async (e) => {
    const session = await getServerSession(e);

    if (session === null) {
        return setResponseStatus(e, 401);
    }

    const body = await readValidatedBody(
        e,
        z.object({
            fileId: z.string().min(8),
            authorId: z.string().length(10),
            content: z.string().min(1),
        }).parse
    );

    return await db.comment.create({
        data: body,
        select: {
            id: true,
            content: true,
            created: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
});
