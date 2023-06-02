"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const waga_1 = __importDefault(require("waga"));
const socket_1 = __importDefault(require("./socket"));
const classes_1 = require("./classes");
const app = (0, waga_1.default)();
app.use(waga_1.default.static(`${__dirname}/../client`));
app.get('favicon.ico', waga_1.default.redirect('https://agacraft.ga/src/img/icono.ico'));
const server = app.listen(3000, () => {
    console.log('listening on port 3000');
});
const maxX = 1024;
const maxY = 576;
const game = new classes_1.Game(maxX, maxY);
const lengthX = 40;
const lengthY = 60;
const io = (0, socket_1.default)(server);
io.on('connect', socket => {
    const player = new classes_1.Entity(socket.id, Math.random() * (maxX - lengthX), Math.random() * (maxY - lengthY), lengthX, lengthY, 10, 100);
    game.add(player);
}).on('disconnect', socket => {
    game.elements.deleteId(socket.id);
}).on('move', (socket, [direction]) => {
    const player = game.elements.getId(socket.id);
    if (!player)
        return;
    if (direction === 'up')
        player.moveUp();
    else if (direction === 'down')
        player.moveDown();
    else if (direction === 'left')
        player.moveLeft();
    else if (direction === 'right')
        player.moveRight();
});
setInterval(() => {
    game.update();
    const elements = game.elements.toObject();
    io.broadcast('players', ...elements);
}, 1000 / 60);
