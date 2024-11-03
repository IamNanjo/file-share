import crypto from "node:crypto";

import type { H3Event, EventHandlerRequest, SessionConfig } from "h3";

export interface SessionData {
    id: string;
    name: string;
}

export const secret =
    process.env.FILESHARE_SECRET ??
    crypto.randomBytes(48).toString("base64url");

// 365 day expiration time
export const expirationTime = 365 * 24 * 60 * 60;

export function getSessionConfig(): SessionConfig {
    return {
        password: secret,
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
