// @ts-check
const ws = require('ws');

/**
 * @typedef {{
 *   emit(event: string, ...args: any[]): void;
 *   id: number;
 * }} socket
 * @typedef {{
 *   on(event: string, callback: (socket: socket, args: any[]) => void): controller;
 *   emit(event: string, socket: socket, ...args: any[]): controller;
 *   broadcast(event: string, ...args: any[]): controller;
 *   iemit(event: string, socket: socket, ...args: any[]): controller;
 *   sockets: Set<socket>
 * }} controller
 * @param {import('http').Server} server
 * @returns {controller}
 */
module.exports = function (server) {
	const events = new Map();
	const sockets = new Set();
	const wss = new ws.Server({ server });

	const controller = {
		on(event, fn) {
			if (!events.has(event)) events.set(event, []);
			events.get(event).push(fn);
			return controller;
		},
		emit(event, socket, ...data) {
			socket.emit(event, ...data);
			return controller;
		},
		broadcast(event, ...data) {
			sockets.forEach(socket => controller.emit(event, socket, ...data));
			return controller;
		},
		iemit(event, socket, ...data) {
			if (events.has(event)) events.get(event).forEach(fn => fn(socket, data));
			return controller;
		},
    get sockets(){
      return sockets
    }
	};

	wss.on('connection', function connection(ws) {
		const socket = {
			emit(event, ...args) {
				ws.send(JSON.stringify({ event, args }));
			},
			id: Math.random()
		};
		sockets.add(socket);
		controller.iemit('connect', socket);
		ws.on('message', function incoming(message) {
			const { event, args } = JSON.parse(message.toString());
			controller.iemit(event, socket, ...args);
		});
		ws.on('close', function close() {
			sockets.delete(ws);
			controller.iemit('disconnect', socket);
		});
	});
	return controller;
};
