import db from "~/server/db";

export default defineEventHandler(async (e) => {
    if (e.context.session === null) {
        return setResponseStatus(e, 401);
    }
    const file = await db.file.findUnique({
        where: { id: e.context.params!.id },
        include: { owner: true },
    });

    if (!file || !file.type) return setResponseStatus(e, 404);

    const url = getRequestURL(e);

    const fileUrl = `${url.origin}/files/${file.id}`;

    if (file.type.includes("video"))
        return `<!DOCTYPE html>
<html><head>
  <meta property="og:type" content="video.movie" />
  <meta property="og:title" content="${file.name}" />
  <meta property="og:video" content="${fileUrl}" />
  <meta property="og:video:type" content="${file.type}" />
  <meta property="og:video:width" content="${file.width}" />
  <meta property="og:video:height" content="${file.height}" />
  <meta name="twitter:card" content="player" />
  <meta name="twitter:site" content="FileShare" />
  <meta name="twitter:player" content="${fileUrl}" />
  <meta name="twitter:player:width" content="${file.width}" />
  <meta name="twitter:player:height" content="${file.height}" />
  <meta name="twitter:title" content="${file.name}" />
  <meta name="twitter:image" content="${url.origin}/thumbnails/${file.id}" />
  <meta name="twitter:creator" content="${file.owner.name}" />
  <meta name="twitter:creator:id" content="${file.ownerId}" />
  <meta http-equiv="refresh" content="0;url=${url.origin}/watch/${file.id}" />
</head></html>
`;

    if (file.type.includes("image"))
        return `<!DOCTYPE html>
<html><head>
	<meta property="og:title" content="${file.name}" />
	<meta property="og:image" content="${fileUrl}" />
	<meta name="twitter:url" content="${fileUrl}" />
	<meta name="twitter:title" content="${file.name}" />
	<meta name="twitter:image" content="${fileUrl}" />
	<meta http-equiv="refresh" content="0;url=${fileUrl}" />
</head></html>
`;

    return sendRedirect(e, `${fileUrl}`);
});
