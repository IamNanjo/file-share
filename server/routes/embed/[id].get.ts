import db from "~/server/db";

export default defineEventHandler(async (e) => {
  const file = await db.file.findUnique({
    where: { id: e.context.params!.id },
  });

  if (!file || !file.type) return setResponseStatus(e, 404);

  const url = getRequestURL(e);

  const fileUrl = `${url.origin}/files/${file.id}`;

  if (file.type.includes("video"))
    return `<!DOCTYPE html>
<html>
<head>
	<meta property="og:type" content="video.other">
	<meta property="og:title" content="${file?.name}" />
	<meta property="twitter:player" content="${fileUrl}">
	<meta name="twitter:url" content="${fileUrl}" />
	<meta name="twitter:title" content="${file.name}" />
	<meta property="og:video:type" content="text/html">
	<meta property="og:video:width" content="${file.width}">
	<meta property="og:video:height" content="${file.height}">
	<meta name="twitter:image" content="${url.origin}/thumbnails/${file.id}">
	<meta http-equiv="refresh" content="0;url=${fileUrl}">
</head>
</html>`;

  if (file.type.includes("image"))
    return `<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="${file?.name}" />
	<meta property="og:image" content="${fileUrl}" />
	<meta name="twitter:url" content="${fileUrl}" />
	<meta name="twitter:title" content="${file.name}" />
	<meta name="twitter:image" content="${fileUrl}">
	<meta http-equiv="refresh" content="0;url=${fileUrl}">
</head>
</html>`;

  return sendRedirect(e, `${fileUrl}`);
});
