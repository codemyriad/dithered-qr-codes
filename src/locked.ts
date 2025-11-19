import { getRotation, getReflection, getScale, getLockPositioningBlocks, getLockTimingLines, getLockAlignmentPatterns } from "./form.ts";

export default function isLocked(l: number, x: number, y: number) {
	l /= getScale();
	x = ~~(x / getScale());
	y = ~~(y / getScale());
	// ob
	if (x < 0 || y < 0 || x >= l || y >= l) return true;
	// reflect
	if (getReflection()) x = l - x - 1;
	// rotate
	const rotation = getRotation();
	for (let i = 0; i < rotation; ++i) [x, y] = [y, l - x - 1];
	// corner blocks
	if (x < 7 && y < 7) return getLockPositioningBlocks();
	if (x < 7 && y > l - 8) return getLockPositioningBlocks();
	if (x > l - 8 && y < 7) return getLockPositioningBlocks();
	// timing lines
	if (x == 6 || y == 6) return getLockTimingLines();
	// do we have extra blocks
	const blocks = getBlocks(l);
	if (!blocks.length) return false;
	// are we too near a corner block to draw them
	const xBlock = inBlock(x, blocks);
	const yBlock = inBlock(y, blocks);
	// are we in one
	if (xBlock == null || yBlock == null) return false;
	// is it one we care about
	if (xBlock == 0 && yBlock == 0) return false;
	if (xBlock == 0 && yBlock == blocks.length - 1) return false;
	if (xBlock == blocks.length - 1 && yBlock == 0) return false;
	return getLockAlignmentPatterns();
}

function inBlock(u: number, blocks: number[]) {
	for (let i = 0; i < blocks.length; ++i) {
		const v = blocks[i];
		if (u < v - 2) return null;
		if (u < v + 3) return i;
	}
	return null;
}

export function isData(x: number, y: number) {
	const scale = getScale();
	const m = ~~(scale / 2);
	const xs = x % scale, ys = y % scale;
	if (xs == m && ys == m) return true;
	if (scale & 1) return false;
	if (xs == m && ys == m - 1) return true;
	if (xs == m - 1 && ys == m) return true;
	if (xs == m - 1 && ys == m - 1) return true;
	return false;
}

function getBlocks(l: number) {
	const version = qrVersion(l);
	return dotPositions[version]!;
}

function qrVersion(l: number) {
	return (l - 17) / 4;
}

function qrSize(version: number) {
	return version * 4 + 17;
}

const dotPositions = [
	/*0*/ null,
	/*1*/ [],
	/*2*/ [6,18],
	/*3*/ [6,22],
	/*4*/ [6,26],
	/*5*/ [6,30],
	/*6*/ [6,34],
	/*7*/ [6,22,38],
	/*8*/ [6,24,42],
	/*9*/ [6,26,46],
	/*10*/ [6,28,50],
	/*11*/ [6,30,54],
	/*12*/ [6,32,58],
	/*13*/ [6,34,62],
	/*14*/ [6,26,46,66],
	/*15*/ [6,26,48,70],
	/*16*/ [6,26,50,74],
	/*17*/ [6,30,54,78],
	/*18*/ [6,30,56,82],
	/*19*/ [6,30,58,86],
	/*20*/ [6,34,62,90],
	/*21*/ [6,28,50,72,94],
	/*22*/ [6,26,50,74,98],
	/*23*/ [6,30,54,78,102],
	/*24*/ [6,28,54,80,106],
	/*25*/ [6,32,58,84,110],
	/*26*/ [6,30,58,86,114],
	/*27*/ [6,34,62,90,118],
	/*28*/ [6,26,50,74,98,122],
	/*29*/ [6,30,54,78,102,126],
	/*30*/ [6,26,52,78,104,130],
	/*31*/ [6,30,56,82,108,134],
	/*32*/ [6,34,60,86,112,138],
	/*33*/ [6,30,58,86,114,142],
	/*34*/ [6,34,62,90,118,146],
	/*35*/ [6,30,54,78,102,126,150],
	/*36*/ [6,24,50,76,102,128,154],
	/*37*/ [6,28,54,80,106,132,158],
	/*38*/ [6,32,58,84,110,136,162],
	/*39*/ [6,26,54,82,110,138,166],
	/*40*/ [6,30,58,86,114,142,170]
]