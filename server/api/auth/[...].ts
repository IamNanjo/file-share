import CredentialsProvider from "@auth/core/providers/credentials";
import type { AuthConfig } from "@auth/core/types";
import { NuxtAuthHandler } from "#auth";
import bcrypt from "bcrypt";

import prisma from "~/server/db";

const runtimeConfig = useRuntimeConfig();

// Get the user using username (case-insensitive)
const getUser = async (username: string) => {
  const users: {
    id: string;
    name: string;
    password: string;
  }[] = await prisma.$queryRaw`
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
  secret: process.env.FILESHARE_SECRET,
  // 365-day session duration. Prioritize UX
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },
  theme: { colorScheme: "auto", brandColor: "#FF6961" },
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
          if (!credentials || !credentials.username || !credentials.password)
            return null;

          const username = credentials.username as string;
          const password = credentials.password as string;

          credentials = credentials as { username: string; password: string };

          let user = await getUser(username);

          if (!user) {
            const hash = await bcrypt.hash(password, 12);

            if (!hash) return null;

            user = await prisma.user.create({
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
          } else if (!(await bcrypt.compare(password, user.password))) {
            return null;
          }

          if (!user) return null;
          return resolve({
            id: user.id,
            name: user.name,
          });
        }),
    }),
  ],
};

export default NuxtAuthHandler(authOptions, runtimeConfig);
