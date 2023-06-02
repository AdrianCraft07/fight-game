import waga from 'waga';
import socket from './socket';
import { Game, Entity } from './classes';

const app = waga();

app.use(waga.static(`${__dirname}/../client`));
app.get('favicon.ico', waga.redirect('https://agacraft.ga/src/img/icono.ico'));

const server = app.listen(3000, () => {
	console.log('listening on port 3000');
});

const maxX = 1024;
const maxY = 576;

const game = new Game(maxX, maxY);

const lengthX = 40;
const lengthY = 60;

const io = socket(server);
io.on('connect', socket => {
	const player = new Entity(socket.id, Math.random() * (maxX - lengthX), Math.random() * (maxY - lengthY), lengthX, lengthY, 10, 100);
	game.add(player);
}).on('disconnect', socket => {
	game.elements.deleteId(socket.id);
}).on('move', (socket, [direction]) => {
	const player = game.elements.getId(socket.id) as Entity;
	if (!player) return;
	if(direction === 'up') player.moveUp();
	else if(direction === 'down') player.moveDown();
	else if(direction === 'left') player.moveLeft();
	else if(direction === 'right') player.moveRight();
})

setInterval(() => {
	game.update();
	const elements = game.elements.toObject();
	io.broadcast('players', ...elements);
}, 1000 / 60);
