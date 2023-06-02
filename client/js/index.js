import socket from './socket.js';
import { Sprite } from './classes.js';
import kerwordsPress from './keywords.js';

async function main() {
	const canvas = document.querySelector('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = 1024;
	canvas.height = 576;

	//ctx.fillRect(0, 0, canvas.width, canvas.height);

  /**
   * @type {Map<number, Sprite>}
   */
  const players = new Map();

	const io = await socket();
	io.on('connect', () => console.log('connected'))
		.on('disconnect', () => console.log('disconnected'))
		.on('players', (elements) => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      elements.forEach(element => {
        if(!players.has(element.id))players.set(element.id, new Sprite(element));
        players.get(element.id).update(ctx, element);
      })
    });
    kerwordsPress(keys => {
      if(keys.has('w')) io.emit('move', 'up');
      if(keys.has('s')) io.emit('move', 'down');
      if(keys.has('a')) io.emit('move', 'left');
      if(keys.has('d')) io.emit('move', 'right');
    })
}
main();
