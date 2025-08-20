import encodeQR from "qr";
// import decodeQR from "qr/decode";

import showError, { clearError } from "./errors.ts"
import makeQR from "./qr.ts";
import drawQR from "./draw.ts";
import isLocked, { isData } from "./locked.ts";
import loadImage from "./image.ts";
import { diffuseDataPoints, diffuseFreePoints } from "./diffuse.ts";
import fudgeQrData from "./fudge.ts";
import { getDiffuseDataPoints, getDiffuseFreePoints, getIncludeImage, getInverted, getHideFreePoints } from "./form.ts";

const canvas = document.getElementById("output") as HTMLCanvasElement;

async function update() {
	clearError();
	canvas.classList.add("loading");

	if (getInverted()) document.body.classList.remove("uninverted");
	else document.body.classList.add("uninverted");
	if (getHideFreePoints()) document.body.classList.add("hide-free");
	else document.body.classList.remove("hide-free");

	try {
		const qr = makeQR();
		const imageData = await loadImage(qr.length);

		fudgeQrData(imageData, qr);

		if (getDiffuseDataPoints()) diffuseDataPoints(imageData, qr);
		if (getDiffuseFreePoints()) diffuseFreePoints(imageData);

		if (getIncludeImage())
			for (let x = 0; x < qr.length; ++x)
				for (let y = 0; y < qr.length; ++y) {
					if (isLocked(qr.length, x, y)) continue;
					if (isData(x, y)) continue;
					qr[y][x] = imageData[y][x] > 0.5;
				}

		drawQR(qr);
		await expand();
		document.getElementById("download").href = canvas.toDataURL('png');
		canvas.classList.remove("hidden");

		// const ctx = canvas.getContext('2d');
		// const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// console.log(decodeQR(imgData));
	} catch (e) {
		canvas.classList.add("hidden");
		showError(e);
	} finally {
		canvas.classList.remove("loading");
	}
}

document.getElementById("form")!.addEventListener("input", update);
update();

async function expand(amount = 25) {
	const img = await canvasToImage(canvas);
	canvas.width = img.width * amount + amount * 10;
	canvas.height = img.height * amount + amount * 10;
	const context = canvas.getContext("2d")!;
	context.fillStyle = getInverted() ? 'white' : 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);
	if (getHideFreePoints())
		context.clearRect(amount * 5, amount * 5, img.width * amount, img.height * amount);
	context.imageSmoothingEnabled = false;
	context.drawImage(img, amount * 5, amount * 5, img.width * amount, img.height * amount);
}

function canvasToImage(canvas: HTMLCanvasElement) {
	return new Promise<Image>((resolve, reject) => {
		const img = new Image();
		img.addEventListener("load", () => resolve(img));
		img.addEventListener("error", reject);
		img.src = canvas.toDataURL("png");
	});
}
