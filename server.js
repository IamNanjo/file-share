const { createServer } = require("https");
const { readFileSync } = require("fs");
const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

/*
	Uses these environment variables:
		- NODE_ENV (set to "production" to use a secure connection and port specified by FILE_SHARE_PORT)
		- SSL_KEY_PATH (path to SSL key e.g. privkey.pem)
		- SSL_CERT_PATH (path to SSL certificate e.g. fullchain.pem)
		- FILE_SHARE_PORT (port for the backend server)
		- FILE_SHARE_HASH (bcrypt hash for the password. Without this the app will not require a password)
*/

const app = express();

const storage = multer.diskStorage({
	destination: path.join(__dirname, "public", "files"),
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	}
});
const upload = multer({ storage });

const isProduction = process.env.NODE_ENV === "production";
const port = isProduction ? process.env.FILE_SHARE_PORT : 8080;
let server;

if (isProduction) {
	server = createServer(
		{
			key: readFileSync(process.env.SSL_KEY_PATH),
			cert: readFileSync(process.env.SSL_CERT_PATH)
		},
		app
	);
} else {
	server = app;
}

app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "public")));

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
		upload.any()(req, res, () => {
			req.files && req.files.length ? res.sendStatus(201) : res.sendStatus(400);
		});
	} else {
		res.sendStatus(401);
	}
});

server.listen(port, () => {
	console.log("Listening on port", port);
});
