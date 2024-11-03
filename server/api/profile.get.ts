import db from "~/server/db";

export default defineEventHandler(async (e) => {
    const session = e.context.session;

    if (!session) return setResponseStatus(e, 401);

    return db.user.findUnique({
        where: { id: session.data.id },
        select: {
            id: true,
            name: true,
            files: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                    sizeString: true,
                    created: true,
                },
                orderBy: { created: "desc" },
            },
        },
    });
});
