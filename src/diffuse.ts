import isLocked, { isData } from "./locked.ts";
import { getScale } from "./form.ts";

export function diffuseDataPoints(imageData: number[][], qr: boolean[][]) {
	const scale = getScale();
	if (scale & 1) {
		for (let y = 0; y < imageData.length; ++y)
			for (let x = 0; x < imageData[y].length; ++x) {
				if (isLocked(imageData.length, x, y)) continue;
				if (!isData(x, y)) continue;
				const error = imageData[y][x] - +qr[y][x];
				imageData[y - 1][x] += error * 3 / 16;
				imageData[y + 1][x] += error * 3 / 16;
				imageData[y][x - 1] += error * 3 / 16;
				imageData[y][x + 1] += error * 3 / 16;
				imageData[y - 1][x - 1] += error / 16;
				imageData[y + 1][x - 1] += error / 16;
				imageData[y - 1][x + 1] += error / 16;
				imageData[y + 1][x + 1] += error / 16;
			}
		return;
	}
	const m = scale / 2 - 1;
	for (let y = m; y < imageData.length; y += scale)
		for (let x = m; x < imageData.length; x += scale) {
			if (isLocked(imageData.length, x, y)) continue;
			for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
				const sx = x + 0.5 + dx * 0.5;
				const sy = y + 0.5 + dy * 0.5;
				const error = imageData[sy][sx] - +qr[sy][sx];
				imageData[sy][sx + dx] += error * 6 / 16;
				imageData[sy + dy][sx] += error * 6 / 16;
				imageData[sy + dy][sx + dx] += error * 4 / 16;
			}
		}
}

export function diffuseFreePoints(imageData: number[][]) {
	for (let y = 0; y < imageData.length; ++y)
		for (let x = 0; x < imageData[y].length; ++x) {
			if (!canChange(x, y)) continue;
			const actual = Math.round(imageData[y][x]);
			const error = imageData[y][x] - actual;
			imageData[y][x] = actual;
			const a = canChange(x + 1, y);
			const b = canChange(x - 1, y + 1);
			const c = canChange(x, y + 1);
			const d = canChange(x + 1, y + 1);
			const total = +a * 7 + +b * 3 + +c * 5 + +d;
			if (a) imageData[y][x + 1] += error * 7 / total;
			if (b) imageData[y + 1][x - 1] += error * 3 / total;
			if (c) imageData[y + 1][x] += error * 5 / total;
			if (d) imageData[y + 1][x + 1] += error / total;
		}
	function canChange(x: number, y: number) {
		return !isLocked(imageData.length, x, y) && !isData(x, y);
	}
}