import db from "~/server/db";
import bcrypt from "bcrypt";
import z from "zod";
import { getSession } from "~/server/session";

export default defineEventHandler(async (e) => {
    const { username, password } = await readValidatedBody(
        e,
        z.object({ username: z.string().min(1), password: z.string().min(1) })
            .parse
    );

    const user = await db.user.findUnique({ where: { name: username } });

    if (!user) {
        const hash = await bcrypt.hash(password, 12);

        const user = await db.user.create({
            data: {
                name: username,
                password: hash,
            },
            select: {
                id: true,
                name: true,
            },
        });

        const session = await getSession(e);

        await session.update(user);
        return { ...user };
    }

    if (!bcrypt.compareSync(password, user.password)) {
        return setResponseStatus(e, 401, "Incorrect password");
    }

    const sessionData = { id: user.id, name: user.name };

    const session = await getSession(e);

    await session.update(sessionData);
    return { ...sessionData };
});
