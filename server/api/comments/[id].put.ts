import getServerSession from "~/server/getServerSession";
import db from "~/server/db";
import z from "zod";

export default defineEventHandler(async (e) => {
    const session = await getServerSession(e);

    if (!session || !session.user) {
        return setResponseStatus(e, 401);
    }

    const { id } = await getValidatedRouterParams(
        e,
        z.object({
            id: z.coerce.number().min(1),
        }).parse
    );
    const { content } = await readValidatedBody(
        e,
        z.object({
            content: z.string().min(1),
        }).parse
    );

    return db.comment
        .update({
            where: { id, authorId: session.user.id },
            data: { content },
        })
        .then(() => setResponseStatus(e, 200))
        .catch(() => setResponseStatus(e, 500));
});
