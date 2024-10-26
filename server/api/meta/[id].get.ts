import db from "~/server/db";

interface File {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  owner: {
    id: string;
    name: string;
  };
}

interface Meta {
  property?: string;
  name?: string;
  content: string;
}

type Response = {
  file: File;
  meta: Meta[];
};

export default defineEventHandler<undefined, Response>(async (e) => {
  const file = await db.file.findUnique({
    where: { id: e.context.params!.id },
    select: {
      id: true,
      name: true,
      type: true,
      width: true,
      height: true,
      owner: { select: { id: true, name: true } },
    },
  });

  if (!file || !file.type) return setResponseStatus(e, 404);

  const url = getRequestURL(e);
  const fileUrl = `${url.origin}/files/${file.id}`;

  if (file.type.includes("video")) {
    return {
      file,
      meta: [
        { property: "og:type", content: "video.movie" },
        { property: "og:title", content: file.name },
        { property: "og:video", content: fileUrl },
        { property: "og:video:type", content: file.type },
        { property: "og:video:width", content: file.width },
        { property: "og:video:height", content: file.height },
        { name: "twitter:card", content: "player" },
        { name: "twitter:site", content: "FileShare" },
        { name: "twitter:player", content: fileUrl },
        { name: "twitter:player:width", content: file.width },
        { name: "twitter:player:height", content: file.height },
        { name: "twitter:title", content: file.name },
        {
          name: "twitter:image",
          content: `${url.origin}/thumbnails/${file.id}`,
        },
        { name: "twitter:creator", content: file.owner.name },
        { name: "twitter:creator:id", content: file.owner.id },
      ],
    };
  }

  if (file.type.includes("image")) {
    return {
      file,
      meta: [
        { property: "og:title", content: file.name },
        { property: "og:image", content: fileUrl },
        { name: "twitter:url", content: fileUrl },
        { name: "twitter:title", content: file.name },
        { name: "twitter:image", content: fileUrl },
      ],
    };
  }

  return { file, meta: [] };
});
