const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const fileHover = document.getElementById("fileHover");
const uploadBtn = document.getElementById("uploadBtn");
const clearListBtn = document.getElementById("clearListBtn");

const progress = document.getElementById("progress");
const progressPercentage = document.getElementById("progressPercentage");
const url = document.getElementById("url");
const statusEl = document.getElementById("status");

let files = [];

window.ondrop = (e) => e.preventDefault();

fileList.ondragover = (e) => {
	fileHover.style.display = "flex";
};

fileList.ondrag = (e) => {
	fileHover.style.display = "none";
};

fileList.ondrop = (e) => {
	fileHover.style.display = "none";
	addFile({ name: "File", size: 4096 });
};

fileInput.onchange = (e) => {
	const f = e.currentTarget.files;

	for (let i = 0, len = f.length; i < len; i++) {
		addFile(f[i]);
	}
};

clearListBtn.onclick = (e) => {
	files = [];
	fileInput.value = "";

	while (fileList.firstChild) {
		fileList.removeChild(fileList.lastChild);
	}
};

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

uploadBtn.onclick = () => {
	const formdata = new FormData();

	for (let i = 0, len = files.length; i < len; i++) {
		const file = fileList.children[i];

		formdata.append(files[i].name, files[i], files[i].name);
	}

	setProgress(0);

	const ajax = new XMLHttpRequest();
	// ajax.setRequestHeader("Authorization", "Basic " + )
	ajax.upload.addEventListener("progress", progressHandler, false);
	ajax.addEventListener("load", completeHandler, false);
	ajax.addEventListener("error", errorHandler, false);
	ajax.addEventListener("abort", abortHandler, false);
	ajax.open("POST", window.location);
	ajax.send(formdata);
};

function progressHandler(e) {
	setProgress(Math.round((e.loaded / e.total) * 100));
}

function setProgress(num) {
	progress.style.width = `${num}%`;
	progress.ariaValueNow = num;
	progressPercentage.innerText = num;
}

function completeHandler(e) {
	// const files = JSON.parse(e.target.responseText)["files"];
	
	// for (let i = 0, len = files.length; i < len; i++) {
	// 	const el = document.createElement("li");
	// 	const aEl = document.createElement("a");

	// 	aEl.innerText = files[i];

	// 	el.appendChild(aEl);
	// }
}

function errorHandler(e) {
	statusEl.innerText = "Upload failed";
}

function abortHandler(e) {
	statusEl.innerText = "Upload cancelled";
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
