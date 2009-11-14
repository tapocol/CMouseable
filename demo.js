function CMouseableRect(startx, starty, width, height) {
	this.x = startx;
	this.y = starty;
	this.width = width;
	this.height = height;
	this.render_types = { normal: "rgb(128, 128, 128)", selecting: "rgb(192, 192, 192)", selected: "rgb(64, 64, 64)", dragging: "rgba(128, 128, 128, 0.7)" };
}
CMouseableRect.diffPoint = function(point, rect_point, rect_size) {
	if (point < rect_point) {
		return point - rect_point;
	}
	else if (point > rect_point + rect_size) {
		return point - (rect_point + rect_size);
	}
	return 0;
}
CMouseableRect.prototype.getX = function() {
	return this.x;
}
CMouseableRect.prototype.getY = function() {
	return this.y;
}
CMouseableRect.prototype.getWidth = function() {
	return this.width;
}
CMouseableRect.prototype.getHeight = function() {
	return this.height;
}
CMouseableRect.prototype.adjustCoords = function(dcoords) {
	this.x += dcoords.x;
	this.y += dcoords.y;
}
CMouseableRect.prototype.areCoordsIn = function(coords) {
	return (coords.x >= this.x && coords.x < this.x + this.width && coords.y >= this.y && coords.y < this.y + this.height);
}
CMouseableRect.prototype.doesRectIntersect = function(coords) {
	var dx1 = CMouseableRect.diffPoint(coords.x1, this.x, this.width);
	var dy1 = CMouseableRect.diffPoint(coords.y1, this.y, this.height);
	var dx2 = CMouseableRect.diffPoint(coords.x2, this.x, this.width);
	var dy2 = CMouseableRect.diffPoint(coords.y2, this.y, this.height);
	return (
		(dx1 == 0 || dx2 == 0 || dx1 * dx2 < 0) &&
		(dy1 == 0 || dy2 == 0 || dy1 * dy2 < 0)
	);
}
CMouseableRect.prototype.render = function(context, type, dcoords) {
	var style = eval("this.render_types." + type);
	if (style !== undefined) {
		context.fillStyle = style;
	}
	dcoords = $.extend({x: 0, y: 0}, dcoords);
	context.fillRect(this.x + dcoords.x, this.y + dcoords.y, this.width, this.height);
}
$(function() {
	var context = $("#canvas").get(0).getContext('2d');
	context.save();
	context.fillStyle = "rgb(240, 240, 240)";
	context.fillRect(0, 0, $("#canvas").attr('width'), $("#canvas").attr('height'));
	context.restore();

	$("#canvas").cdraggable({
		draggable_items: [
			new CMouseableRect(20, 0, 50, 50),
			new CMouseableRect(120, 100, 50, 50)
		],
		mousearea: $(window),
		dim: {x: 0, y: 0, width: 400, height: 400}
	});
});

