import assert from "node:assert/strict";
import test from "node:test";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { encode, optimizeUrl } from "../src/encoding.ts";

const options = { ecc: "high", scale: 1 } as const;

function decode(matrix: boolean[][]) {
	const scale = 5, border = 4;
	const size = (matrix.length + border * 2) * scale;
	const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
	for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
		const dark = matrix[Math.floor(y / scale) - border]?.[Math.floor(x / scale) - border];
		if (dark) pixels.fill(0, (y * size + x) * 4, (y * size + x) * 4 + 3);
	}
	const result = jsQR(pixels, size, size);
	assert.ok(result, "Independent reader must decode the QR matrix");
	return result;
}

test("URL optimization preserves all case-sensitive components and spelling", () => {
	const input = "https://User:pAss@example.com:443/a/../PaTh%2f?Key=aBc#Frag";
	assert.equal(optimizeUrl(input), "HTTPS://User:pAss@EXAMPLE.COM:443/a/../PaTh%2f?Key=aBc#Frag");
	assert.equal(optimizeUrl("http://[2001:db8::1]:80/Ab"), "HTTP://[2001:DB8::1]:80/Ab");
	for (const text of ["Hello world", "mailto:a@example.com", "https://", "https://example.com:99999/", " https://example.com", "https://example.com/a b", "https://example.com\\path", "https://例え.jp/道", "https://%65xample.com/"])
		assert.equal(optimizeUrl(text), text);
});

test("normalized URL fits version 2; exact lowercase input needs version 3", () => {
	const compact = encode("https://example.com", options);
	const exact = encode("https://example.com", { ...options, optimizeUrl: false });
	assert.equal(compact.version, 2);
	assert.equal(exact.version, 3);
	assert.equal(decode(compact.matrix).data, "HTTPS://EXAMPLE.COM");
	assert.equal(decode(exact.matrix).data, "https://example.com");
});

test("mixed segments reduce size and decode without changing the payload", () => {
	const text = "https://example.com/item/" + "1234567890".repeat(8) + "?Token=aBc";
	const result = encode(text, options);
	const byteOnly = QRCode.create([{ data: result.payload, mode: "byte" }], { errorCorrectionLevel: "H" });
	assert.ok(result.version < byteOnly.version);
	assert.ok(result.segments.some(segment => segment.mode.id === "Numeric"));
	assert.ok(result.segments.some(segment => segment.mode.id === "Byte"));
	assert.equal(decode(result.matrix).data, result.payload);
});

test("minimum size, automatic growth, scaling, ECC and masks survive the new encoder", () => {
	assert.equal(encode("short", { ...options, version: 6 }).version, 6);
	assert.ok(encode("x".repeat(200), { ...options, version: 1 }).version > 1);
	for (const ecc of ["low", "medium", "quartile", "high"] as const) {
		for (let mask = 0; mask < 8; mask++) {
			const result = encode("Mixed 🦊 café 12345678901234567890", { ecc, mask, scale: 2 });
			assert.equal(result.matrix.length, result.size * 2);
			const decoded = decode(result.matrix.filter((_, i) => i % 2 === 0).map(row => row.filter((_, i) => i % 2 === 0)));
			assert.equal(decoded.data, result.payload);
			assert.equal(decoded.chunks.length > 0, true);
		}
	}
});

test("empty input, excessive payloads and invalid sizing report errors", () => {
	assert.throws(() => encode("", options));
	assert.throws(() => encode("x".repeat(5000), options));
	assert.throws(() => encode("test", { ...options, version: 41 }));
	assert.throws(() => encode("test", { ...options, scale: 0 }));
});
