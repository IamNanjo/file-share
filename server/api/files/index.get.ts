import db from "~/server/db";

export default defineEventHandler((e) => {
  return db.file.findMany({
    where: { private: false },
    select: {
      id: true,
      name: true,
      type: true,
      sizeString: true,
      hasThumbnail: true,
      created: true,
      owner: { select: { id: true, name: true } },
    },
    orderBy: {
      created: "desc",
    },
  });
});
