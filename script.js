class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(x, y) {
		return new Vector(this.x + x, this.y + y);
	}
	multi(multiplier) {
		return new Vector(this.x * multiplier, this.y * multiplier);
	}
}

class SheetImage {
	constructor(image, posx, posy, sizex, sizey, offsetx, offsety) {
		this.image = image;
		this.pos = new Vector(posx, posy);
		this.size = new Vector(sizex, sizey);
		this.offset = new Vector(offsetx, offsety);
	}
	draw(context, pos, scale) {
		context.drawImage(
			this.image,
			this.pos.x * this.offset.x, this.pos.y * this.offset.y,
			this.size.x, this.size.y,
			Math.floor(pos.x), Math.floor(pos.y),
			Math.ceil(this.size.x * scale.x), Math.ceil(this.size.y * scale.y)
		);
	}
}

class Player {
	constructor() {
		this.pos = new Vector(0, 0);
		this.vel = new Vector(0, 0);
		this.dir = 0;
		this.anim = 0;
		this.image = new SheetImage(playerimage, 0, 0, 16, 16, 16, 16);
		this.inventory = new InventoryGrid(5, 5);
	}
	tick(kbd) {
		let walk = 0;
		if (kbd.a) {this.vel.x -= 1; this.dir = 2; walk = 1;}
		if (kbd.d) {this.vel.x += 1; this.dir = 3; walk = 1;}
		if (kbd.w) {this.vel.y -= 1; this.dir = 1; walk = 1;}
		if (kbd.s) {this.vel.y += 1; this.dir = 0; walk = 1;}
		this.vel = this.vel.multi(0.6);
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		this.anim += 1;
		if (this.anim > 31) {
			this.anim = 0
		}
		this.image.pos.x = Math.floor(this.anim / 8) + (walk * 4);
		this.image.pos.y = this.dir;
	}
}

class Keyboard {
	constructor() {
		this.w = 0;
		this.s = 0;
		this.a = 0;
		this.d = 0;
		this.q = 0;
		this.e = 0;
		window.addEventListener('keydown', (e) => {
			var code = e.key.toLowerCase();
			switch (code) {
				case 'w': this.w = 1; break;
				case 's': this.s = 1; break;
				case 'a': this.a = 1; break;
				case 'd': this.d = 1; break;
				case 'q': this.q = 1; break;
				case 'e': this.e = 1; break;
				default: console.log(e.key);
			}
		});
		window.addEventListener('keyup', (e) => {
			var code = e.key.toLowerCase();
			switch (code) {
				case 'w': this.w = 0; break;
				case 's': this.s = 0; break;
				case 'a': this.a = 0; break;
				case 'd': this.d = 0; break;
				case 'q': this.q = 0; break;
				case 'e': this.e = 0; break;
				default: console.log(e.key);
			}
		});
	}
}

class Chunk {
	constructor(image, width, height, imagex, imagey) {
		this.width = width;
		this.height = height;
		this.grid = [];
		for (let y = 0; y < height; y++) {
			this.grid[y] = [];
			for (let x = 0; x < width; x++) {
				this.grid[y][x] = new SheetImage(image, imagex, imagey, 16, 16, 16, 16);
			}
		}
	}
	
	draw(context, pos, scale) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.grid[y][x].draw(context, pos.add(x * 16 * scale.x, y * 16 * scale.y), scale);
			}
		}
	}
}

class InventoryGrid {
	constructor(width, height, items) {
		this.width = width;
		this.height = height;
		this.items = [];
		for (let y = 0; y < height; y++) {
			this.items[y] = [];
			for (let x = 0; x < width; x++) {
				this.items[y][x] = new Item();
			}
		}
	}
	draw(context, pos, scale) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.items[y][x].image.draw(context, pos.add(x * 16 * scale.x, y * 16 * scale.y), scale);
			}
		}
	}
}

class Item {
	constructor() {
		this.image = new SheetImage(sheet, 0, 0, 16, 16, 16, 16);
		this.id = 0;
		this.count = 0;
		this.type = items[0];
	}
}

class ItemType {
	constructor(max) {
		this.max = max;
	}
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
function updateSize() {
	const dpr = window.devicePixelRatio || 1;
	canvas.width = window.innerWidth * dpr;
	canvas.height = window.innerHeight * dpr;
	canvas.style.width = window.innerWidth + "px";
	canvas.style.height = window.innerHeight + "px";
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(dpr, dpr);
	ctx.imageSmoothingEnabled = false;
}
updateSize();

const sheet = document.getElementById("sheet");
const playerimage = document.getElementById("player");

const width = 16;
const height = 16;

const items = [
	new ItemType(0)
];

let mouse = new Vector(0, 0)

let map = new Chunk(sheet, width, height, 0, 0);

let player = new Player();
let keyboard = new Keyboard();
let zoom = 3;

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
});

function update(timestamp) {
	updateSize()
	player.tick(keyboard);
	//zoom = 3 - (Math.max(Math.abs(player.vel.x), Math.abs(player.vel.y)) / 5);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	map.draw(ctx, new Vector(0, 0), new Vector(zoom, zoom));
	player.image.draw(ctx, player.pos.multi(zoom), new Vector(zoom, zoom));
	player.inventory.draw(ctx, new Vector(0, 0), new Vector(1, 1));
    requestAnimationFrame(update);
}

requestAnimationFrame(update);
