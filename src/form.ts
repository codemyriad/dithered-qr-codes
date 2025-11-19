const advanced = document.getElementById("advanced") as HTMLInputElement;
advanced.addEventListener("change", update);
function update() {
	if (advanced.checked) document.body.classList.add("show-advanced");
	else document.body.classList.remove("show-advanced");
}
update();

function input(id: string) {
	return document.getElementById(id) as HTMLInputElement;
}

function select(id: string) {
	return document.getElementById(id) as HTMLSelectElement;
}

export function getRotation() {
	return parseInt(select('rotation').value) || 0;
}

export function getReflection() {
	return input("reflection").checked;
}

export function getScale() {
	return parseInt(input('scale').value) || 3;
}

export function getText() {
	return input('text').value;
}

export function getEcc() {
	return select('ecc').value as "low" | "medium" | "quartile" | "high";
}

export function getVersion() {
	return parseInt(input('version').value) || undefined;
}

export function getMask() {
	return parseInt(select('mask').value) || undefined;
}

export function getInverted() {
	return !input("invert").checked;
}

export function getDiffuseDataPoints() {
	return input("diffuse-data").checked;
}

export function getDiffuseFreePoints() {
	return input("diffuse-free").checked;
}

export function getIncludeImage() {
	return input("include-image").checked;
}

export function getHideFreePoints() {
	return input("hide-free").checked;
}

export function getLockPositioningBlocks() {
	return input("lock-positioning").checked;
}
export function getLockTimingLines() {
	return input("lock-timing").checked;
}
export function getLockAlignmentPatterns() {
	return input("lock-alignment").checked;
}

export function getGamma() {
	return parseFloat(input("gamma").value) || 2.2;
}

export function getContrast() {
	return parseFloat(input("contrast").value) || 1.0;
}

export function getBrightness() {
	return parseFloat(input("brightness").value) || 0.0;
}

export function getMinBrightness() {
	return parseFloat(input("min").value) || 0.0;
}

export function getMaxBrightness() {
	return parseFloat(input("max").value) || 1.0;
}

export function getFudgePixels() {
	return parseFloat(input("fudge").value) || 0.0;
}


