import { Server } from 'http';
import ws from 'ws'

interface Socket {
	emit(event: string, ...args: any[]): void;
	id: number;
}
interface Controller {
	on(event: string, callback: (socket: Socket, args: any[]) => void): Controller;
	emit(event: string, socket: Socket, ...args: any[]): Controller;
	broadcast(event: string, ...args: any[]): Controller;
	iemit(event: string, socket: Socket, ...args: any[]): Controller;
	sockets: Set<Socket>
}

export default function (server: Server):Controller {
	const events = new Map<string, Set<Function>>();
	const sockets = new Set<Socket>();
	const wss = new ws.Server({ server });

	const controller:Controller = {
		on(event, fn) {
			if (!events.has(event)) events.set(event, new Set<Function>());
			events.get(event)?.add(fn);
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
			if (events.has(event)) events.get(event)?.forEach(fn => fn(socket, data));
			return controller;
		},
    get sockets(){
      return sockets
    }
	};

	wss.on('connection', function connection(ws) {
		const socket = {
			emit(event: string, ...args: any[]) {
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
			sockets.delete(socket);
			controller.iemit('disconnect', socket);
		});
	});
	return controller;
};
