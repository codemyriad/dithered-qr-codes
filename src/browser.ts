import encodeQR from "qr";
// import decodeQR from "qr/decode";

import showError, { clearError } from "./errors.ts"
import makeQR from "./qr.ts";
import drawQR from "./draw.ts";
import isLocked, { isData } from "./locked.ts";
import loadImage from "./image.ts";
import { diffuseDataPoints, diffuseFreePoints } from "./diffuse.ts";
import fudgeQrData from "./fudge.ts";
import { getDiffuseDataPoints, getDiffuseFreePoints, getIncludeImage, getInverted } from "./form.ts";

const canvas = document.getElementById("output") as HTMLCanvasElement;

async function update() {
	clearError();
	if (getInverted()) {
		document.body.classList.remove("uninverted");
		document.getElementById("margin-colour").innerText = "white";
	}
	else {
		document.body.classList.add("uninverted");
		document.getElementById("margin-colour").innerText = "black";
	}

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
		document.getElementById("download").href = canvas.toDataURL('png');
		canvas.classList.remove("hidden");

		// const ctx = canvas.getContext('2d');
		// const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// console.log(decodeQR(imgData));
	} catch (e) {
		canvas.classList.add("hidden");
		showError(e);
	}
}

document.getElementById("form")!.addEventListener("input", update);
update();
