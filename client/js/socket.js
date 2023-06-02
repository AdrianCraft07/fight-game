// @ts-check
/**
 * @typedef {{
 * 	on(event: string, callback: (args: any[]) => void): data;
* 	emit(event: string, ...args: any[]): data;
* 	iemit(event: string, ...args: any[]): data;
* }} data
 * @returns {Promise<data>}
 */
export default function () {
	return new Promise(async (resolve, reject) => {
		const socket = new WebSocket(`ws://${globalThis.location.host}`);
		const events = new Map();
		socket.onmessage = event => {
			const data = JSON.parse(event.data);
			if (events.has(data.event)) {
				events.get(data.event).forEach(fn => fn(data.args));
			}
		};
		socket.onopen = () => {
			const data ={
				on(event, callback) {
					if (!events.has(event)) {
						events.set(event, new Set());
					}
					events.get(event).add(callback);
					return data;
				},
				emit(event, ...args) {
					socket.send(JSON.stringify({ event, args }));
					return data;
				},
				iemit(event, ...args) {
					if (events.has(event)) events.get(event).forEach(fn => fn(args));
					return data;
				},
			} 
			resolve(data);
		};
	});
}
