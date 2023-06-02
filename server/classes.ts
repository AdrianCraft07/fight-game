const GRAVITY = 0.5;

type Direction = 'up' | 'down' | 'left' | 'right';
type EventsCollision = `${Direction}Collision`;
type Events = EventsCollision | 'kill';
type EventArgs = {
	kill: () => void;
} & {
	[key in EventsCollision]: (object: Collision | Game) => void;
};

export class Event {
	#events = new Map();
	on<E extends Events>(event:E, callback:EventArgs[E]):this {
		if (!this.#events.has(event)) this.#events.set(event, new Set());
		this.#events.get(event).add(callback);
		return this;
	}
	emit<E extends Events>(event:E, ...args:Parameters<EventArgs[E]>):this {
		if (this.#events.has(event)) for (let callback of this.#events.get(event)) callback(...args);
		return this;
	}
	off<E extends Events>(event:E, callback:EventArgs[E]):this {
		if (this.#events.has(event)) this.#events.get(event).delete(callback);
		return this;
	}
}

export interface ElementObject{
	id: number;
	position: { x: number; y: number; };
}
export class Element extends Event {
	id: number;
	position: { x: number; y: number; };
	game: Game;
	constructor(id: number, x: number, y: number) {
		super();
		this.id = id;
		this.position = { x, y };
	}
	setGame(game: Game) {
		this.game = game;
		return this;
	}
	update() {
		return this;
	}
	toObject() {
		return {
			id: this.id,
			position: this.position,
		} as ElementObject;
	}
	toString() {
		return JSON.stringify(this.toObject());
	}
}

export interface CollisionObject extends ElementObject{
	width: number;
	height: number;
}
export class Collision extends Element {
	width: number;
	height: number;
	constructor(id: number, x: number, y: number, width: number, height: number) {
		super(id, x, y);
		this.width = width;
		this.height = height;
	}
	upCollision(element:Element) {
		if (element.id === this.id) return false;
		const isCollisionable = element instanceof Collision;
		if (!isCollisionable) return false;
		return (
			this.position.x < element.position.x + element.width &&
			this.position.x + this.width > element.position.x &&
			this.position.y + this.height > element.position.y
		);
	}
	downCollision(element:Element) {
		if (element.id === this.id) return false;
		const isCollisionable = element instanceof Collision;
		if (!isCollisionable) return false;
		return (
			this.position.x < element.position.x + element.width &&
			this.position.x + this.width > element.position.x &&
			this.position.y < element.position.y + element.height
		);
	}
	leftCollision(element:Element) {
		if (element.id === this.id) return false;
		const isCollisionable = element instanceof Collision;
		if (!isCollisionable) return false;
		return (
			this.position.y < element.position.y + element.height &&
			this.position.y + this.height > element.position.y &&
			this.position.x + this.width > element.position.x
		);
	}
	rightCollision(element:Element) {
		if (element.id === this.id) return false;
		const isCollisionable = element instanceof Collision;
		if (!isCollisionable) return false;
		return (
			this.position.y < element.position.y + element.height &&
			this.position.y + this.height > element.position.y &&
			this.position.x < element.position.x + element.width
		);
	}
	checkCollision(element:Element) {
		if (element.id === this.id) return false;
		const isCollisionable = element instanceof Collision;
		if (!isCollisionable) return false;
		return (
			this.position.x < element.position.x + element.width &&
			this.position.x + this.width > element.position.x &&
			this.position.y < element.position.y + element.height &&
			this.position.y + this.height > element.position.y
		);
	}
	toObject() {
		const object = super.toObject() as CollisionObject;
		object.width = this.width;
		object.height = this.height;
		return object;
	}
}

export interface MovibleObject extends CollisionObject{
	speed: number;
	velocity: { x: number; y: number; };
}
export class Movible extends Collision {
	speed: number;
	velocity: { x: number; y: number; };
	constructor(id: number, x: number, y: number, width: number, height: number, speed: number) {
		super(id, x, y, width, height);
		this.speed = speed;
		this.velocity = { x: 0, y: 0 };
	}
	update() {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.stop();
		return this;
	}
	moveUp() {
		this.velocity.y = -this.speed;
		return this;
	}
	moveDown() {
		this.velocity.y = this.speed;
		return this;
	}
	moveLeft() {
		this.velocity.x = -this.speed;
		return this;
	}
	moveRight() {
		this.velocity.x = this.speed;
		return this;
	}
	stop() {
		this.velocity.x = 0;
		this.velocity.y = 0;
		return this;
	}
	toObject() {
		const object = super.toObject() as MovibleObject;
		object.speed = this.speed;
		object.velocity = this.velocity;
		return object;
	}
}

export class Elements<T extends Element = Element> extends Set<T> {
	filter(callback: (element: T) => boolean) {
		const elements = new Elements();
		for (const element of this) {
			if (callback(element)) elements.add(element);
		}
		return elements;
	}
	deleteId(id: number) {
		const element = this.getId(id);
		if (!element) return false;
		return this.delete(element);
	}
	getId(id: number) {
		for (const element of this) {
			if (element.id === id) return element;
		}
		return;
	}
	toObject() {
		const object:ElementObject[] = [];
		for (const element of this) {
			object.push(element.toObject());
		}
		return object;
	}
	toString() {
		return JSON.stringify(this.toObject());
	}
}

export interface EntityObject extends MovibleObject{
	life: number;
	jumping: boolean;
}
export class Entity extends Movible {
	#gravityVelocity = 0;
	#gravity = true;
	#jumping = false;
	#jumpTime = 0;
	life: number;
	constructor(id: number, x: number, y: number, width: number, height: number, speed: number, life: number) {
		super(id, x, y, width, height, speed);
		this.life = life;
		this.on('upCollision', solid => {
			this.position.y = solid.position.y + solid.height - this.height;
			this.velocity.y = 0;
			this.#jumping = false;
			this.#gravity = true;
			this.#gravityVelocity = 0;
		});
		this.#jumpTime = (height / this.speed) * 60;
	}
	moveUp() {
		if (this.#jumping) return this;
		this.#jumping = true;
		this.velocity.y = -this.speed;
		this.#gravity = false;
		setTimeout(() => {
			this.#gravity = true;
			this.#gravityVelocity = 0;
		}, this.#jumpTime);
		return this;
	}
	update() {
		super.update();
		if (this.#gravity) {
			this.#gravityVelocity += GRAVITY;
			this.velocity.y += this.#gravityVelocity;
		}
		if (this.position.y + this.height >= this.game.height) this.emit('upCollision', this.game);
		
		return this;
	}
	stop() {
		this.velocity.x = 0;
		if (this.#jumping) return this;
		this.velocity.y = 0;
		return this;
	}
	damage(damage: number) {
		if (damage <= 0) return this;
		this.life -= damage;
		if (this.life <= 0) this.emit('kill');
		return this;
	}
	toObject() {
		const object = super.toObject() as EntityObject;
		object.life = this.life;
		object.jumping = this.#jumping;
		return object;
	}
}

export class Game {
	elements: Elements;
	position: { x: number; y: number; };
	width: number;
	height: number;
	constructor(width: number, height: number, x = 0, y = 0) {
		this.elements = new Elements();
		this.position = { x, y };
		this.width = width;
		this.height = height;
	}
	add(element: Element) {
		this.elements.add(element);
		element.setGame(this);
		element.on('kill', () => this.elements.delete(element));
	}
	remove(element: Element) {
		this.elements.delete(element);
	}
	update() {
		const updatedElements = new Elements();
		const collisionables = this.elements.filter(element => element instanceof Collision) as Elements<Collision>;
		for (const movible of collisionables) {
			movible.update();
			if (!(movible instanceof Movible)) continue;
			if (movible.position.x < this.position.x) movible.position.x = 0;
			if (movible.position.x + movible.width > this.position.x + this.width) movible.position.x = this.width - movible.width;
			if (movible.position.y < this.position.y) movible.position.y = 0;
			if (movible.position.y + movible.height > this.position.y + this.height) movible.position.y = this.height - movible.height;
			for (const collision of collisionables) {
				if (collisionables.has(collision)) continue;
				if (!collision.checkCollision(movible)) continue;
				if (collision.upCollision(movible)) collision.emit('upCollision', movible);
				if (collision.downCollision(movible)) collision.emit('downCollision', movible);
				if (collision.leftCollision(movible)) collision.emit('leftCollision', movible);
				if (collision.rightCollision(movible)) collision.emit('rightCollision', movible);
			}
			updatedElements.add(movible);
		}
	}
}
