import db from "~/server/db";
import z from "zod";

export default defineEventHandler(async (e) => {
    const session = e.context.session;

    if (!session) {
        return setResponseStatus(e, 401);
    }

    const { id } = await getValidatedRouterParams(
        e,
        z.object({
            id: z.coerce.number().min(1),
        }).parse
    );

    return db.comment
        .delete({ where: { id, authorId: session.data.id } })
        .then(() => setResponseStatus(e, 204))
        .catch(() => setResponseStatus(e, 500));
});
