import db from "~/server/db";

export default defineEventHandler(async (e) => {
    const session = e.context.session;
    if (!session) return null;

    const user = await db.user.findUnique({ where: { id: session.data.id } });

    if (!user) {
        await session.clear();
        return null;
    }

    return Object.keys(session.data).length ? session.data : null;
});
