import db from "~/server/db";
import z from "zod";

export default defineEventHandler(async (e) => {
    const session = e.context.session;

    if (!session) {
        return setResponseStatus(e, 401);
    }

    const [{ id }, { content }] = await Promise.all([
        getValidatedRouterParams(
            e,
            z.object({ id: z.coerce.number().min(1) }).parse
        ),
        readValidatedBody(e, z.object({ content: z.string().min(1) }).parse),
    ]);

    await db.comment.update({
        where: { id, authorId: session.data.id },
        data: { content },
    });

    return setResponseStatus(e, 200);
});
