import { sessionSecret } from "~/server/env.mjs";
import type { H3Event, EventHandlerRequest, SessionConfig } from "h3";

export interface SessionData {
    id: string;
    name: string;
}

// 365 day expiration time
export const expirationTime = 365 * 24 * 60 * 60;

export function getSessionConfig(): SessionConfig {
    return {
        password: sessionSecret,
        maxAge: expirationTime,
        name: "auth",
        cookie: {
            sameSite: "strict",
            httpOnly: true,
            secure: true,
        },
    };
}

export async function getSession(e: H3Event<EventHandlerRequest>) {
    return useSession<SessionData>(e, getSessionConfig());
}
