export function getRotation() {
	return parseInt(document.getElementById('rotation').value) || 0;
}

export function getScale() {
	return parseInt(document.getElementById('scale').value) || 3;
}

export function getText() {
	return document.getElementById('text').value;
}

export function getEcc(): "low" | "medium" | "quartile" | "high" {
	return document.getElementById('ecc').value;
}

export function getVersion() {
	return parseInt(document.getElementById('version').value) || undefined;
}

export function getMask() {
	return parseInt(document.getElementById('mask').value) || undefined;
}

export function getInverted() {
	return !document.getElementById("invert").checked;
}

export function getDiffuseDataPoints() {
	return document.getElementById("diffuse-data").checked;
}
export function getDiffuseFreePoints() {
	return document.getElementById("diffuse-free").checked;
}
export function getIncludeImage() {
	return document.getElementById("include-image").checked;
}

export function getGamma() {
	return parseFloat(document.getElementById("gamma").value) || 2.2;
}

export function getContrast() {
	return parseFloat(document.getElementById("contrast").value) || 1.0;
}

export function getBrightness() {
	return parseFloat(document.getElementById("brightness").value) || 0.0;
}

export function getMinBrightness() {
	return parseFloat(document.getElementById("min").value) || 0.0;
}

export function getMaxBrightness() {
	return parseFloat(document.getElementById("max").value) || 1.0;
}

export function getFudgePixels() {
	return parseFloat(document.getElementById("fudge").value) || 0.0;
}


