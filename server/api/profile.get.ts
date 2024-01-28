import db from "~/server/db";
import getServerSession from "~/server/getServerSession";

export default defineEventHandler(async (e) => {
  const session = await getServerSession(e);

  if (!session || !session.user) return setResponseStatus(e, 401);

  return db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      files: {
        select: {
          id: true,
          name: true,
          type: true,
          sizeString: true,
          hasThumbnail: true,
          created: true,
        },
        orderBy: { created: "desc" },
      },
    },
  });
});
