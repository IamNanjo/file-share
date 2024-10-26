import CredentialsProvider from "@auth/core/providers/credentials";
import type { AuthConfig } from "@auth/core/types";
import { NuxtAuthHandler } from "#auth";
import bcrypt from "bcrypt";

import db from "~/server/db";

const runtimeConfig = useRuntimeConfig();

// Get the user using username (case-insensitive)
const getUser = async (username: string) => {
    const users: {
        id: string;
        name: string;
        password: string;
    }[] = await db.$queryRaw`
    SELECT id, name, password
    FROM User
    WHERE name LIKE ${username}
    LIMIT 1`;

    if (!users.length) return null;

    const user = users[0];

    return {
        id: user.id,
        name: user.name,
        password: user.password,
    };
};

export const authOptions: AuthConfig = {
    secret: process.env.FILESHARE_SECRET || "devSecret",
    session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },
    theme: { colorScheme: "auto", brandColor: "#FF6961" },
    callbacks: {
        jwt: ({ token, account, user }) => {
            if (account) {
                token.id = user.id;
            }
            return token;
        },
        session: ({ session, token }) => {
            if (session.user) session.user.id = token.id as string;
            return session;
        },
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", autocomplete: "username" },
                password: {
                    label: "Password",
                    type: "password",
                    autocomplete: "current-password",
                },
            },
            authorize: (credentials) =>
                new Promise(async (resolve) => {
                    if (
                        !credentials ||
                        !credentials.username ||
                        !credentials.password
                    )
                        return null;

                    const username = credentials.username as string;
                    const password = credentials.password as string;

                    let user = await getUser(username);

                    if (!user) {
                        const hash = await bcrypt.hash(password, 12);

                        if (!hash) return null;

                        user = await db.user.create({
                            data: {
                                name: username,
                                password: hash,
                            },
                            select: {
                                id: true,
                                name: true,
                                password: true,
                            },
                        });
                    } else if (
                        !(await bcrypt.compare(password, user.password))
                    ) {
                        return resolve(null);
                    }

                    if (!user) return resolve(null);
                    return resolve({
                        id: user.id,
                        name: user.name,
                    });
                }),
        }),
    ],
};

export default NuxtAuthHandler(authOptions, runtimeConfig);
