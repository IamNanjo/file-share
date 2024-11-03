import db from "~/server/db";

export default defineEventHandler(async (e) => {
    const session = e.context.session;
    if (!session) return null;
    const { data, clear } = session;

    const user = await db.user.findUnique({ where: { id: data.id } });

    if (!user) {
        await clear();
        return null;
    }

    return Object.keys(data).length ? data : null;
});
