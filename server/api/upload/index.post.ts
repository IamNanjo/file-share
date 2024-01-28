import { randomUUID } from "node:crypto";
import z from "zod";

import getServerSession from "~/server/getServerSession";
import db from "~/server/db";

const bodySchema = z.object({
  name: z.string(),
  extension: z.string(),
  private: z.boolean().default(false),
});

export default defineEventHandler(async (e) => {
  const body = await readValidatedBody(e, (body) =>
    bodySchema.parseAsync(body)
  );
  const session = await getServerSession(e);

  if (!session || !session.user || !session.user.id)
    return setResponseStatus(e, 401);

  const fullFileName = randomUUID() + body.extension;

  return db.file.create({
    data: {
      id: fullFileName,
      ownerId: session.user.id,
      name: body.name,
      private: body.private,
    },
    select: { id: true },
  });
});
