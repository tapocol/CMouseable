(function($) {
	$.dcanvas = {
		_init: function(canvas) {
			return $.extend($.canvas._init(canvas), {
				scanvas: $.scanvas._init(canvas),
				draggables: [],
				non_draggables: [],
				currently_dragging: [],
				start_coords: {x: 0, y: 0},
				start_outer: {x1: 0, y1: 0, x2: 0, y2: 0},
				dragging: false,

				_addDraggable: function(draggable) {
					this.draggables.push(draggable);
					this.scanvas._addSelectable(draggable);
				},

				_addNonDraggable: function(non_draggable) {
					this.non_draggables.push(non_draggable);
					this.scanvas._addNonSelectable(non_draggable);
				},

				_mousedown: function(e) {
					if (!this.dragging) {
						var coords = this._findCoords(e);
						var selected = this.scanvas._getCurrentlySelected();
						var match = false;
						for (var i = 0; i < selected.length; i++) {
							if (selected[i].areCoordsIn(coords)) {
								match = true;
								break;
							}
						}
						if (match) {
							this.dragging = true;
							this.currently_dragging = selected;
							this.start_coords = this._findCoords(e);
							this.start_outer = {x1: undefined, y1: undefined, x2: undefined, y2: undefined};
							for (var i = 0; i < selected.length; i++) {
								var current = selected[i];
								if (this.start_outer.x1 === undefined || current.getX() < this.start_outer.x1) {
									this.start_outer.x1 = current.getX();
								}
								if (this.start_outer.y1 === undefined || current.getY() < this.start_outer.y1) {
									this.start_outer.y1 = current.getY();
								}
								if (this.start_outer.x2 === undefined || current.getX() + current.getWidth() > this.start_outer.x2) {
									this.start_outer.x2 = current.getX() + current.getWidth();
								}
								if (this.start_outer.y2 === undefined || current.getY() + current.getHeight() > this.start_outer.y2) {
									this.start_outer.y2 = current.getY() + current.getHeight();
								}
							}
						}
						else {
							this.scanvas._mousedown(e);
						}
					}
				},

				_mousemove: function(e) {
					if (!this.dragging) {
						this.scanvas._mousemove(e);
					}
				},

				_mouseup: function(e) {
					if (this.dragging) {
						for (var i = 0; i < this.currently_dragging.length; i++) {
							var coords = this._findCoords(e);
							var dcoords = {x: coords.x - this.start_coords.x, y: coords.y - this.start_coords.y};
							if (this.start_outer.x1 + dcoords.x < this.min_x) {
								dcoords.x = this.min_x - this.start_outer.x1;
							}
							else if (this.start_outer.x2 + dcoords.x > this.max_x) {
								dcoords.x = this.max_x - this.start_outer.x2;
							}
							if (this.start_outer.y1 + dcoords.y < this.min_y) {
								dcoords.y = this.min_y - this.start_outer.y1;
							}
							else if (this.start_outer.y2 + dcoords.y > this.max_y) {
								dcoords.y = this.max_y - this.start_outer.y2;
							}
							this.currently_dragging[i].adjustCoords(dcoords);
						}
						this.currently_dragging = [];
						this.dragging = false;
					}
					else {
						this.scanvas._mouseup(e);
					}
				},

				_render: function(coords, options) {
					this._renderClear();
					for (var i = 0; i < this.draggables.length; i++) {
						this._renderDraggable(this.draggables[i], coords);
					}
					for (var i = 0; i < this.non_draggables.length; i++) {
						this.non_draggables[i].renderNormal(this.context);
					}
					this.scanvas._renderSelectArea(coords, options);
				},

				_renderDraggable: function(draggable, coords) {
					if (this.dragging) {
						var found = false;
						for (var j = 0; j < this.currently_dragging.length; j++) {
							if (draggable === this.currently_dragging[j]) {
								this.context.save();
								var dcoords = {x: coords.x - this.start_coords.x, y: coords.y - this.start_coords.y};
								if (this.start_outer.x1 + dcoords.x < this.min_x) {
									dcoords.x = this.min_x - this.start_outer.x1;
								}
								else if (this.start_outer.x2 + dcoords.x > this.max_x) {
									dcoords.x = this.max_x - this.start_outer.x2;
								}
								if (this.start_outer.y1 + dcoords.y < this.min_y) {
									dcoords.y = this.min_y - this.start_outer.y1;
								}
								else if (this.start_outer.y2 + dcoords.y > this.max_y) {
									dcoords.y = this.max_y - this.start_outer.y2;
								}
								draggable.renderDragging(this.context, dcoords);
								this.context.restore();
								found = true;
								break;
							}
						}
						if (!found) {
							draggable.renderNormal(this.context);
						}
					}
					else {
						this.scanvas._renderSelectable(draggable);
					}
				}
			});
		}
	};

	$.fn.extend({
		cdraggable: function(options) {

			var defaults = {
				draggable_items: [],
				non_draggable_items: [],
				selecting_box_fillStyle: "rgba(128, 192, 255, 0.7)",
				selecting_box_strokeStyle: "rgba(64, 128, 192, 0.7)"
			}

			var options = $.extend(defaults, options);

			return this.each(function() {
				var o = options;
				var obj = $(this);
				var canvas = $.dcanvas._init(obj);
				for (var i = 0; i < o.draggable_items.length; i++) {
					canvas._addDraggable(o.draggable_items[i]);
				}
				for (var i = 0; i < o.non_draggable_items.length; i++) {
					canvas._addNonDraggable(o.draggable_items[i]);
				}
				canvas._render();

				obj.mousedown(function(e) {
					canvas._mousedown(e);
					canvas._render(canvas._findCoords(e), o);
				});

				obj.mousemove(function(e) {
					canvas._mousemove(e);
					canvas._render(canvas._findCoords(e), o);
				});

				obj.mouseup(function(e) {
					canvas._mouseup(e);
					canvas._render(canvas._findCoords(e), o);
				});
			});
		}
	});
})(jQuery);
