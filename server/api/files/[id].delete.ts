import db from "~/server/db";
import getServerSession from "~/server/getServerSession";

export default defineEventHandler(async (e) => {
  const id = getRouterParam(e, "id");
  const session = await getServerSession(e);

  if (!id) return setResponseStatus(e, 400);
  if (!session || !session) return setResponseStatus(e, 401);

  return db.file.delete({ where: { id } });
});
