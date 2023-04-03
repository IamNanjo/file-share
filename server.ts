import { createServer } from "node:https";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

/*
	Uses these environment variables:
		- NODE_ENV (set to "production" to use a secure connection and port specified by FILE_SHARE_PORT)
		- SSL_KEY_PATH (path to SSL key e.g. privkey.pem)
		- SSL_CERT_PATH (path to SSL certificate e.g. fullchain.pem)
		- FILE_SHARE_PORT (port for the backend server)
		- FILE_SHARE_HASH (bcrypt hash for the password. Without this the app will not require a password)
*/

ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobePath.path!);

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const app = express();

const upload = multer({
	storage: multer.diskStorage({
		destination: path.join(__dirname, "public", "files"),
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		}
	}),
	fileFilter: (req, file, cb) => {
		const extension = file.originalname.split(".").pop() || "";
		const forbiddenExtensions = ["htm", "html", "shtml", "xhtml", "php"];

		if (forbiddenExtensions.includes(extension)) {
			cb(
				new Error(
					"HTML and PHP files not allowed. Add another file extension to upload them (e.g. .txt)"
				)
			);
		}

		cb(null, true);
	}
});

const isProduction = process.env.NODE_ENV === "production";
const port = isProduction ? process.env.FILE_SHARE_PORT : 8080;
let server;

if (isProduction) {
	server = createServer(
		{
			key: readFileSync(process.env.SSL_KEY_PATH || ""),
			cert: readFileSync(process.env.SSL_CERT_PATH || "")
		},
		app
	);
} else {
	server = app;
}

function beautifyFilename(filename: string): string {
	let arr = filename.split(".").slice(0, -1).join(".").split(/-|_/gi);
	for (var i = 0, len = arr.length; i < len; i++) {
		arr[i] = `${arr[i].charAt(0).toUpperCase()}${arr[i].slice(1)}`;
	}
	return arr.join(" ");
}

app.set("trust proxy", 1);
app.set("json spaces", 4);
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));
app.use("/upload", express.static(path.join(__dirname, "public", "upload")));
app.use(
	"/filelist.css",
	express.static(path.join(__dirname, "public", "filelist.css"))
);

app.get("/", (req, res) => res.redirect("/filelist"));

app.get("/filelist", (req, res) => {
	const fileList = readdirSync(path.join(__dirname, "public", "files"));
	res.send(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="/filelist.css">
	<title>File list</title>
</head>
<body>
	<div id="file-list">
		${fileList
			.map(
				(file) =>
					`<a href="/files/${file}?embed=true">${beautifyFilename(file)}</a>`
			)
			.join("\n")}
	</div>
</body>
</html>`);
});

app.get("/files/:file", async (req, res) => {
	const filename = path.basename(req.params.file);
	const extension = filename.split(".").pop() || "";
	const filepath = path.join(__dirname, "public", "files", filename);

	if (!existsSync(filepath)) return res.sendStatus(404);
	if (!req.query.embed || !["mp4", "ogg"].includes(extension))
		return res.sendFile(filepath);

	// const date = new Date();
	// const datetime = `${date.getFullYear()}-${
	// 	date.getMonth() + 1
	// }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

	let videoSize = await getVideoSize(filepath);

	res.send(`
<!DOCTYPE html>
<html>
<!-- Generated at {datetime} -->
<head>
	<meta property="og:type" content="video.other">
	<meta property="og:title" content="${beautifyFilename(filename)}" />
	<meta property="twitter:player" content="/files/${filename}">
	<meta name="twitter:url" content="${`${req.protocol}://${req.hostname}${req.originalUrl}`}" />
	<meta name="twitter:title" content="${beautifyFilename(filename)}" />
	<meta property="og:video:type" content="text/html">
	<meta property="og:video:width" content="${videoSize.width}">
	<meta property="og:video:height" content="${videoSize.height}">
	<meta name="twitter:image" content="${getThumbnail(filepath)}">
	<meta http-equiv="refresh" content="0;url=/files/${filename}">
</head>
</html>`);
});

app.get("/upload/password-check", (req, res) => {
	const password = req.headers.authorization
		? req.headers.authorization.split(" ").slice(1).join(" ")
		: "";
	const hash = process.env.FILE_SHARE_HASH;

	if (hash && password && bcrypt.compareSync(password, hash))
		res.sendStatus(200);
	else res.sendStatus(401);
});

app.post("/upload", (req, res) => {
	const password = req.headers.authorization
		? req.headers.authorization.split(" ").slice(1).join(" ")
		: "";
	const hash = process.env.FILE_SHARE_HASH;

	if (hash && password && bcrypt.compareSync(password, hash)) {
		upload.any()(req, res, (err: any) =>
			req.files && req.files.length && !err
				? res.sendStatus(201)
				: res.status(400).send(err.message)
		);
	} else {
		res.sendStatus(401);
	}
});

server.listen(port, () => {
	console.log("Listening on port", port);
});

async function getVideoSize(
	filepath: string
): Promise<{ width?: number; height?: number }> {
	return new Promise((resolve, reject) =>
		ffmpeg(filepath).ffprobe((err, data) => {
			try {
				resolve({
					width: data.streams[0].width,
					height: data.streams[0].height
				});
			} catch {
				reject((err as Error).message);
			}
		})
	);
}

function getThumbnail(filename: string): string {
	const thumbnailName = `${path.basename(filename)}.png`;

	// Create a thumbnail
	ffmpeg({ source: filename }).screenshots({
		timestamps: [0],
		folder: `${__dirname}/public/assets/thumbnails`,
		filename: thumbnailName
	});

	// Return path to thumbnail
	return `/assets/thumbnails/${thumbnailName}`;
}
