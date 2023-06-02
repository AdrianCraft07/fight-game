const hexa = '0123456789ABCDEF'.split('');
const colors = (function () {
	let colors = [];
	const code = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
	for (let i of code) for (let j of code) for (let k of code) colors.push(`#${hexa[i]}${hexa[j]}${hexa[k]}`);
	return colors;
})();

export class Sprite {
	constructor(element) {
		this.element = element;
		this.i = 0;
	}
	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.element.position.x, this.element.position.y, this.element.width, this.element.height);
	}
	update(ctx, element) {
		this.element = element;
		this.replaceColor();
		this.draw(ctx);
	}
	replaceColor() {
		if (this.i >= colors.length) this.i = 0;
		this.color = colors[this.i];
		this.i++;
	}
}
