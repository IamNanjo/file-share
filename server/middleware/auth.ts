import { getSession } from "~/server/session";

declare module "h3" {
    interface H3EventContext {
        session: Awaited<ReturnType<typeof getSession>> | null;
    }
}

export default defineEventHandler(async (e) => {
    const session = await getSession(e);
    e.context.session = Object.keys(session.data).length ? session : null;
});
