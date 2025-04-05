import db from "~/server/db";

export default defineEventHandler(() => {
    return db.file.findMany({
        where: { private: false },
        select: {
            id: true,
            name: true,
            type: true,
            private: true,
            sizeString: true,
            created: true,
            owner: { select: { id: true, name: true } },
        },
        orderBy: { created: "desc" },
    });
});
