import z from "zod";
import db from "~/server/db";

export default defineEventHandler(async (e) => {
    const session = e.context.session;
    if (!session) return setResponseStatus(e, 401);

    const [{ id }, body] = await Promise.all([
        getValidatedRouterParams(
            e,
            z.object({ id: z.string().min(1) }).parseAsync
        ),
        readValidatedBody(
            e,
            z.object({
                name: z.string().optional(),
                private: z.boolean().optional(),
            }).parseAsync
        ),
    ]);

    const file = await db.file.findUnique({ where: { id } });
    if (!file) {
        return setResponseStatus(e, 404, "File not found");
    }

    return db.file.update({
        where: { id },
        data: {
            name: body.name ?? file.name,
            private: body.private ?? file.private,
        },
        select: {
            name: true,
            private: true,
        },
    });
});
