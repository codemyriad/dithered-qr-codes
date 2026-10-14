import QRCode from "qrcode";

/** Preserve spelling outside the case-insensitive scheme and ASCII hostname. */
export function optimizeUrl(text: string): string {
	if (/[\\\s]/u.test(text)) return text;
	const match = /^(https?):\/\/([^/?#]*@)?([a-z0-9.-]+|\[[0-9a-f:.]+\])(:[0-9]+)?(?=[/?#]|$)/i.exec(text);
	if (!match) return text;
	try { new URL(text); } catch { return text; }
	const [, scheme, credentials = "", host, port = ""] = match;
	return `${scheme.toUpperCase()}://${credentials}${host.toUpperCase()}${port}${text.slice(match[0].length)}`;
}

export type EncodingOptions = {
	ecc: "low" | "medium" | "quartile" | "high";
	version?: number;
	mask?: number;
	scale: number;
	optimizeUrl?: boolean;
};

export function encode(text: string, options: EncodingOptions) {
	const payload = options.optimizeUrl === false ? text : optimizeUrl(text);
	if (options.version !== undefined && (!Number.isInteger(options.version) || options.version < 1 || options.version > 40))
		throw new Error("Minimum size must be between 1 and 40.");
	if (!Number.isInteger(options.scale) || options.scale < 1)
		throw new Error("Scale must be a positive integer.");
	const settings = {
		errorCorrectionLevel: ({ low: "L", medium: "M", quartile: "Q", high: "H" } as const)[options.ecc],
		maskPattern: options.mask,
	};
	// Find the smallest fit, then honor the user's minimum size for their picture.
	let result = QRCode.create(payload, settings);
	if (options.version && options.version > result.version)
		result = QRCode.create(payload, { ...settings, version: options.version });
	const size = result.modules.size;
	const matrix = Array.from({ length: size * options.scale }, (_, y) =>
		Array.from({ length: size * options.scale }, (_, x) =>
			Boolean(result.modules.get(Math.floor(y / options.scale), Math.floor(x / options.scale)))));
	return { matrix, payload, version: result.version, size, segments: result.segments };
}
