import { getFudgePixels } from "./form";
import isLocked, { isData } from "./locked";

export default function fudgeQrData(imageData: number[][], qr: boolean[][]) {
	const f = getFudgePixels();
	if (!f) return;
	const l = qr.length;
	const values: Array<{ error: number, x: number, y: number }> = [];
	for (let y = 0; y < l; ++y)
		for (let x = 0; x < l; ++x)
			if (!isLocked(l, y, x) && isData(y, x))
				values.push({ x, y, error: Math.abs(imageData[y][x] - +qr[y][x]) });
	values.sort((a, b) => b.error - a.error);
	for (let i = 0; i < f * values.length; ++i) {
		const { x, y } = values[i];
		qr[y][x] = imageData[y][x] > 0.5;
	}
}
