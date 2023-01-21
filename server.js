const { createServer } = require("https");
const { readFileSync } = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "public")));

app.post("/upload", upload.any(), (req, res) => {
	console.log("req.files :>> ", req.files);

	res.send();
});

server.listen(port, () => {
	console.log("Listening on port", port);
});
