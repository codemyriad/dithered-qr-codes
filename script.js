const container = document.getElementById('placeHolder');
const typeNumber = 4;
const errorCorrectionLevel = 'L';

function changeQrText() {
	const text = document.getElementById('text').value;
	const qr = qrcode(typeNumber, errorCorrectionLevel);
	qr.addData(text || 'https://www.andrewt.net');
	qr.make();
	container.innerHTML = qr.createTableTag();
	addInnerCells();
}

let loaded = false;

let tableCells = [];
let sideLength = 0;

function addInnerCells() {
	const ratio = parseFloat(document.getElementById("ratio").value ?? "3");
	const m = ~~(ratio / 2);
	tableCells = [];

	let y = 0;
	for (const row of container.querySelectorAll("tr")) {
		for (let i = 0; i < ratio; ++i) tableCells.push([]);
		let x = 0;
		for (const cell of row.querySelectorAll("td")) {
			const col = cell.style.backgroundColor == "rgb(0, 0, 0)"
				? "black" : "white"
			const locked = y == 6 || x == 6 || (x < 8 && y < 8) ||
				(x > 24 && y < 8) || (y > 24 && x < 8) ||
				(x > 23 && y > 23 && x < 29 && y < 29)
			cell.classList.add(col);
			if (locked) cell.classList.add("locked");
			cell.style = "";

			if (!locked) {
				const t2 = document.createElement("table");
				t2.classList.add("inner");
				for (let u = 0; u < ratio; ++u) {
					const row = document.createElement("tr");
					t2.appendChild(row)
					for (let v = 0; v < ratio; ++v) {
						const c2 = document.createElement("td");
						row.appendChild(c2);
						c2.classList.add(col);
						if (u == m && v == m) c2.classList.add("data");
						c2.dataset.x = x;
						c2.dataset.y = y;
						c2.dataset.u = u;
						c2.dataset.v = v;
						tableCells[y*ratio+u][x*ratio+v] = c2;
					}
				}
				cell.appendChild(t2);
			}
			++x;
		}
		++y;
	}
	if (sideLength != y) {
		sideLength = y;
		updateImage();
	}
}

changeQrText();
document.getElementById("text").addEventListener("change", changeQrText);

const img = document.getElementById("img");
img.addEventListener('load', () => {
	loaded = true;
	updateImage();
});

document.getElementById('upload').addEventListener("change", e => {
	const reader = new FileReader();
	reader.addEventListener('load', e => img.src = e.target.result);
	reader.readAsDataURL(e.target.files[0]);
});

let targets = [];

document.getElementById("gamma").addEventListener("change", updateImage);
document.getElementById("contrast").addEventListener("change", updateImage);
document.getElementById("brightness").addEventListener("change", updateImage);
document.getElementById("ratio").addEventListener("change", changeQrText);

function updateImage() {
	if (!loaded) return;
	const ratio = parseFloat(document.getElementById("ratio").value ?? "3");
	container.style.setProperty('--cell-ratio', ratio);
	const bigLength = sideLength * ratio;
	const canvas = document.getElementById("canvas");
	canvas.width = img.width * ratio;
	canvas.height = img.height * ratio;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img,
		0, 0, img.width, img.height,
		0, 0, bigLength, bigLength
	);
	const imgData = ctx.getImageData(0, 0, bigLength, bigLength).data;
	function getPx(x, y) {
		return imgData[(x + y * bigLength) * 4];
	}

	const gamma = parseFloat(document.getElementById("gamma").value ?? "2.2");
	const contrast = parseFloat(document.getElementById("contrast").value ?? "1");
	const brightness = parseFloat(document.getElementById("brightness").value ?? "0");

	targets = [];
	for (y = 0; y < bigLength; ++y) {
		targets[y] = [];
		for (x = 0; x < bigLength; ++x) {
			targets[y][x] = (Number(getPx(x, y)) / 255) ** gamma;
			targets[y][x] *= contrast;
			targets[y][x] += brightness;
			targets[y][x] = Math.min(Math.max(targets[y][x], 0), 1);
		}
	}

	updateQrCode();
}

function getCell(xi, yi) {
	return tableCells[yi]?.[xi];
}

function updateQrCode() {
	const ratio = parseFloat(document.getElementById("ratio").value ?? "3");
	const bigLength = sideLength * ratio;
	for (y = 0; y < bigLength; ++y)
		for (x = 0; x < bigLength; ++x) {
			const cell = getCell(x, y)
			if (!cell) continue;
			const target = targets[y][x];
			if (!cell.classList.contains("data")) continue;
			const actual = cell.classList.contains("black") ? 0 : 1;
			cell.dataset.target = target;
			const error = actual - target;
			bumpTarget(x+1, y,   error * 3/16);
			bumpTarget(x-1, y,   error * 3/16);
			bumpTarget(x,   y+1, error * 3/16);
			bumpTarget(x  , y-1, error * 3/16);
			bumpTarget(x+1, y+1, error * 1/16);
			bumpTarget(x-1, y+1, error * 1/16);
			bumpTarget(x+1, y+1, error * 1/16);
			bumpTarget(x-1, y-1, error * 1/16);
		}

	for (y = 0; y < bigLength; ++y)
		for (x = 0; x < bigLength; ++x) {
			const cell = getCell(x, y)
			if (!cell) continue;
			const target = targets[y][x];
			let actual;
			if (cell.classList.contains("data")) continue;
			if (target > 0.5) {
				cell.classList.remove("black");
				cell.classList.add("white");
				actual = 1;
			} else {
				cell.classList.add("black");
				cell.classList.remove("white");
				actual = 0;
			}
			cell.dataset.target = target;
			const error = actual - target;
			const a = isFree(x+1, y);
			const b = isFree(x-1, y+1);
			const c = isFree(x, y+1);
			const d = isFree(x+1, y+1);
			const total = (a*7)+(b*3)+(c*5)+(d*1);
			if(a) bumpTarget(x+1, y,   error * 7/total);
			if(b) bumpTarget(x-1, y+1, error * 3/total);
			if(c) bumpTarget(x,   y+1, error * 5/total);
			if(d) bumpTarget(x+1, y+1, error * 1/total);
		}

	function bumpTarget(x, y, error) {
		const row = targets[y];
		if (!row) return;
		if (x > row.length) return;
		row[x] -= error;
	}

	function isFree(x, y) {
		const cell = getCell(x, y);
		if (!cell) return false;
		return !cell.classList.contains("data");
	}
}