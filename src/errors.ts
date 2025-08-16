const msg = document.getElementById('error')!;

export default function showError(error: Error) {
	console.error(error);
	msg.classList.remove("hidden");
	msg.innerText = `Error: ${error.message}`;
}

export function clearError() {
	msg.classList.add("hidden");
}
