import db from "~/server/db";

export default defineEventHandler(async (e) => {
    const id = getRouterParam(e, "id");
    const file = await db.file.findUnique({
        where: { id },
        select: {
            name: true,
            created: true,
            sizeString: true,
            owner: { select: { id: true, name: true } },
            comments: {
                select: {
                    id: true,
                    content: true,
                    created: true,
                    owner: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!file) {
        throw createError({ statusCode: 404, statusMessage: "File not found" });
    }

    return file;
});
