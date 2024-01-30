import db from "~/server/db";

export default defineEventHandler((e) => {
  const id = getRouterParam(e, "id");

  if (!id) return setResponseStatus(e, 400);

  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      files: {
        where: { private: false },
        select: {
          id: true,
          name: true,
          type: true,
          sizeString: true,
          created: true,
        },
        orderBy: { created: "desc" },
      },
    },
  });
});
