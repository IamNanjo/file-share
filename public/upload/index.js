const password = document.getElementById("password");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const fileHover = document.getElementById("fileHover");
const uploadBtn = document.getElementById("uploadBtn");
const clearListBtn = document.getElementById("clearListBtn");
const abortBtn = document.getElementById("abortBtn");

const progress = document.getElementById("progress");
const progressPercentage = document.getElementById("progressPercentage");
const url = document.getElementById("url");
const statusEl = document.getElementById("status");

let files = [];
let requests = [];

// Defer font loading
const fontCSS = document.createElement("link");
fontCSS.href = "/assets/fonts.min.css";
fontCSS.rel = "stylesheet";
fontCSS.type = "text/css";
document.head.appendChild(fontCSS);
// -------------

window.ondrop = (e) => e.preventDefault();
window.ondragover = (e) => e.preventDefault();

fileList.ondragover = (e) => {
	e.preventDefault();
	fileHover.style.display = "flex";
};

fileList.ondrop = (e) => {
	e.preventDefault();
	fileHover.style.display = "none";

	const f = e.dataTransfer.files;

	for (let i = 0, len = f.length; i < len; i++) {
		addFile(f[i]);
	}
};

fileHover.ondragleave = (e) => {
	e.preventDefault();
	fileHover.style.display = "none";
};

fileInput.onchange = (e) => {
	const f = e.currentTarget.files;

	for (let i = 0, len = f.length; i < len; i++) {
		addFile(f[i]);
	}
};

uploadBtn.addEventListener("click", upload, { once: true });

clearListBtn.onclick = (e) => {
	statusEl.style.display = "none";

	setProgress(0);
	files = [];
	fileInput.value = "";

	while (fileList.firstChild) {
		fileList.removeChild(fileList.lastChild);
	}
};

abortBtn.onclick = (e) => {
	statusEl.style.display = "none";
	abortBtn.style.display = "none";
	clearListBtn.style.display = "inline-block";

	abortRequests();
	setProgress(0);

	uploadBtn.addEventListener("click", upload, { once: true });
};

async function upload() {
	if (files.length) {
		const passwordOK =
			(
				await fetch(`${window.location.href}/password-check`, {
					headers: {
						Authorization: `Basic ${password.value}`
					}
				})
			).status === 200;

		if (passwordOK) {
			clearListBtn.style.display = "none";
			abortBtn.style.display = "inline-block";
			const formdata = new FormData();

			for (let i = 0, len = files.length; i < len; i++) {
				formdata.append(files[i].name, files[i], files[i].name);
			}

			setProgress(0);

			const ajax = new XMLHttpRequest();
			requests.push(ajax);
			ajax.upload.onprogress = (e) =>
				setProgress(Math.round((e.loaded / e.total) * 100));
			ajax.onreadystatechange = () => {
				if (ajax.status >= 200 && ajax.status < 400) completeHandler();
				else if (ajax.status !== 0) errorHandler(ajax.status);

				uploadBtn.addEventListener("click", upload, { once: true });
			};

			ajax.open("POST", window.location.href);
			ajax.setRequestHeader("Authorization", `Basic ${password.value}`);
			ajax.send(formdata);
		} else {
			showError("Invalid password");
		}
	} else {
		showError("You need to select files first");
	}
}

function completeHandler() {
	uploadBtn.style.display = "inline-block";
	clearListBtn.style.display = "inline-block";
	abortBtn.style.display = "none";

	statusEl.style.display = "none";

	for (let i = 0, len = files.length; i < len; i++) {
		addUrl(files[i].name);
	}

	files = [];
	fileInput.value = "";

	while (fileList.firstChild) {
		fileList.removeChild(fileList.lastChild);
	}

	setTimeout(() => {
		setProgress(0);
	}, 2000);
}

function errorHandler(status) {
	uploadBtn.style.display = "inline-block";
	if (status === 401 || status !== 0) {
		clearListBtn.style.display = "inline-block";
		abortBtn.style.display = "none";

		abortRequests();
		setProgress(0);
	}
	if (status === 401) {
		showError("Invalid password");
	} else if (status !== 0) {
		showError("Something went wrong");
	}
}

function humanReadableFilesize(bytes) {
	const dp = 1;
	const thresh = 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}

	const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	);

	return bytes.toFixed(dp) + " " + units[u];
}

function setProgress(num) {
	progress.style.width = `${num}%`;
	progress.ariaValueNow = num;
	progressPercentage.innerText = `${num} %`;
}

function addFile(file) {
	const el = document.createElement("li");
	const fileEl = document.createElement("div");
	const fileName = document.createElement("span");
	const fileSize = document.createElement("span");
	const delBtn = document.createElement("button");

	files.push(file);

	el.classList.add("list-group-item");
	fileSize.classList.add("text-secondary", "ml-3");
	delBtn.classList.add("btn", "btn-primary");

	fileName.innerText = file.name;
	fileSize.innerText = humanReadableFilesize(file.size);

	fileEl.appendChild(fileName);
	fileEl.appendChild(fileSize);

	el.appendChild(fileEl);

	fileList.appendChild(el);
}

function addUrl(filename) {
	const li = document.createElement("li");
	const aEl = document.createElement("a");
	const copyBtn = document.createElement("button");
	const copyBtnImg = document.createElement("img");

	li.classList.add(
		"list-group-item",
		"d-flex",
		"justify-content-between",
		"align-items-center"
	);
	copyBtn.classList.add("btn", "btn-primary", "mx-2");

	let linkURL = `${window.location.origin}/files/${filename}`;

	if (["mp4", "ogg"].includes(filename.split(".").pop()))
		linkURL += "?embed=true";

	aEl.href = linkURL;
	aEl.target = "_blank";
	aEl.innerText = filename;

	copyBtnImg.src = "/assets/copy.svg";

	copyBtn.onclick = (e) => {
		navigator.clipboard.writeText(linkURL);

		copyBtn.classList.replace("btn-primary", "btn-success");
		copyBtnImg.src = `${window.location.origin}/assets/done.svg`;

		setTimeout(() => {
			copyBtn.classList.replace("btn-success", "btn-primary");
			copyBtnImg.src = `${window.location.origin}/assets/copy.svg`;
		}, 1500);
	};

	li.appendChild(aEl);
	copyBtn.appendChild(copyBtnImg);
	li.appendChild(copyBtn);
	url.appendChild(li);
}

function showError(msg) {
	statusEl.innerText = msg;
	statusEl.style.display = "flex";
}

function abortRequests() {
	for (let i = 0, len = requests.length; i < len; i++) {
		requests[i].abort();
	}
}
