import encodeQR from "qr";
import showError from "./errors.ts";
import { getRotation, getReflection, getScale, getText, getEcc, getVersion, getMask, getInverted } from "./form.ts";

export default function makeQR() {
	const text = getText();
	const options = {
		border: 0,
		ecc: getEcc(),
		version: getVersion(),
		mask: getMask(),
		scale: getScale(),
	};

	let qr: boolean[][];
	try {
		try {
			qr = encodeQR(text, 'raw', options);
		} catch (e)	{
			if (e.message == "Capacity overflow" && options.version! < 40)
				qr = encodeQR(text, 'raw', { ...options, version: undefined });
			else throw e;
		}
	} catch (e) {
		showError(e);
		throw e;
	}

	const l = qr.length;

	if (getInverted()) qr = qr.map(row => row.map(c => !c));

	const rotation = getRotation();
	for (let i = 0; i < rotation; ++i) {
		const newQr: boolean[][] = [];
		for (let x = 0; x < l; ++x) {
			newQr.push([]);
			for (let y = l - 1; y >= 0; --y)
				newQr[x][l - y - 1] = qr[y][x];
		}
		qr = newQr;
	}

	if (getReflection())
		for (let y = l - 1; y >= 0; --y)
			qr[y] = qr[y].reverse();

	return qr;
}
