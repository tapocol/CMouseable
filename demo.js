function Block(startx, starty, width, height) {
	this.x = startx;
	this.y = starty;
	this.width = width;
	this.height = height;
}
Block.prototype.getX = function() {
	return this.x;
}
Block.prototype.getY = function() {
	return this.y;
}
Block.prototype.getWidth = function() {
	return this.width;
}
Block.prototype.getHeight = function() {
	return this.height;
}
Block.prototype.adjustCoords = function(dcoords) {
	this.x += dcoords.x;
	this.y += dcoords.y;
}
Block.prototype.areCoordsIn = function(coords) {
	return (coords.x >= this.x && coords.x < this.x + this.width && coords.y >= this.y && coords.y < this.y + this.height);
}
Block.prototype.doesRectIntersect = function(coords) {
	var dx1, dy1, dx2, dy2;
	if (coords.x1 < this.x) {
		dx1 = coords.x1 - this.x;
	}
	else if (coords.x1 > this.x + this.width) {
		dx1 = coords.x1 - (this.x + this.width);
	}
	else {
		dx1 = 0;
	}
	if (coords.y1 < this.y) {
		dy1 = coords.y1 - this.y;
	}
	else if (coords.y1 > this.y + this.height) {
		dy1 = coords.y1 - (this.y + this.height);
	}
	else {
		dy1 = 0;
	}
	if (coords.x2 < this.x) {
		dx2 = coords.x2 - this.x;
	}
	else if (coords.x2 > this.x + this.width) {
		dx2 = coords.x2 - (this.x + this.width);
	}
	else {
		dx2 = 0;
	}
	if (coords.y2 < this.y) {
		dy2 = coords.y2 - this.y;
	}
	else if (coords.y2 > this.y + this.height) {
		dy2 = coords.y2 - (this.y + this.height);
	}
	else {
		dy2 = 0;
	}
	return (
		((dx1 == 0 || dx2 == 0) && (dy1 == 0 || dy2 == 0)) ||
		((dx1 == 0 || dx2 == 0) && (dy1 * dy2 < 0)) ||
		((dy1 == 0 || dy2 == 0) && (dx1 * dx2 < 0)) ||
		((dx1 * dx2 < 0) && (dy1 * dy2 < 0))
	);
}
Block.prototype.render = function(context) {
	context.fillRect(this.x, this.y, this.width, this.height);
}
Block.prototype.renderOffset = function(context, dcoords) {
	context.fillRect(this.x + dcoords.x, this.y + dcoords.y, this.width, this.height);
}
Block.prototype.renderNormal = function(context, opacity) {
	context.fillStyle = 'rgb(128, 128, 128)';
	this.render(context);
}
Block.prototype.renderSelecting = function(context) {
	context.fillStyle = 'rgb(192, 192, 192)';
	this.render(context);
}
Block.prototype.renderSelected = function(context) {
	context.fillStyle = 'rgb(64, 64, 64)';
	this.render(context);
}
Block.prototype.renderDragging = function(context, dcoords) {
	context.fillStyle = 'rgb(64, 64, 64, 0.7)';
	this.renderOffset(context, dcoords);
}
$(function() {
	$("#canvas").cdraggable({
		draggable_items: [
			new Block(0, 0, 50, 50),
			new Block(100, 100, 50, 50)
		]
	});
});

