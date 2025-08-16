const canvas = document.getElementById("output");

export default function drawQR(data: boolean[][]) {
	const l = data.length;
	canvas.width = l;
	canvas.height = l;
	const ctx = canvas.getContext('2d');
	const imgData = ctx.getImageData(0, 0, l, l);
	let i = 0;
	for (let y = 0; y < l; ++y)
		for (let x = 0; x < l; ++x) {
			for (let c = 0; c < 3; ++c)
				imgData.data[i++] = data[y][x] * 255;
			imgData.data[i++] = 255;
		}
	ctx.putImageData(imgData, 0, 0);
}
