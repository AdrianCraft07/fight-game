export default function kerwordsPress(callback) {
	const keys = new Set();
	document.addEventListener('keydown', e => keys.add(e.key));
	document.addEventListener('keyup', e => keys.delete(e.key));
	requestAnimationFrame(function loop() {
		if (keys.size) callback(keys);
		requestAnimationFrame(loop);
	});
}
