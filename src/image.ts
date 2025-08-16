import { getGamma, getContrast, getBrightness, getMinBrightness, getMaxBrightness } from "./form.ts";

const input = document.getElementById('upload') as HTMLInputElement;

export default function loadImage(l: number) {
	if (input.files!.length != 1) throw new Error("Upload a file");
	return new Promise<number[][]>((resolve, reject) => {
		const img = new Image();
		img.addEventListener("load", e => {
			const canvas = document.createElement("canvas");
			canvas.width = l;
			canvas.height = l;
			const ctx = canvas.getContext("2d")!;
			ctx.drawImage(img,
				0, 0, img.width, img.height,
				0, 0, l, l
			);
			const imgData = ctx.getImageData(0, 0, l, l);
			const output: number[][] = [];
			const gamma = getGamma();
			const contrast = getContrast();
			const brightness = getBrightness();
			const minBrightness = getMinBrightness();
			const maxBrightness = getMaxBrightness();
			for (let y = 0; y < l; ++y) {
				const row: number[] = [];
				output.push(row);
				for (let x = 0; x < l; ++x) {
					let value = imgData.data[(x + y * l) * 4 + 1] / 255;
					value **= gamma;
					value -= 0.5;
					value *= contrast;
					value += brightness + 0.5;
					if (value < minBrightness) value = minBrightness;
					if (value > maxBrightness) value = maxBrightness;
					row.push(value);
				}
			}
			resolve(output);
		});
		const reader = new FileReader();
		reader.addEventListener('load', e => img.src = e.target!.result as string);
		reader.readAsDataURL(input.files![0]);
	});
}
