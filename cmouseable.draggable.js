(function($) {
	$.dcanvas = {
		_init: function(canvas, dim) {
			return $.extend($.canvas._init(canvas, dim), {
				scanvas: $.scanvas._init(canvas, dim),
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

				_startDragging: function(draggables, coords) {
					this.dragging = true;
					this.currently_dragging = draggables;
					this.start_coords = coords;
					this.start_outer = {x1: undefined, y1: undefined, x2: undefined, y2: undefined};
					for (var i = 0; i < draggables.length; i++) {
						var current = draggables[i];
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
				},

				_findDiffCoords: function(coords) {
					var dcoords = {x: coords.x - this.start_coords.x, y: coords.y - this.start_coords.y};
					if (this.start_outer.x1 + dcoords.x < this.dim.x) {
						dcoords.x = this.dim.x - this.start_outer.x1;
					}
					else if (this.start_outer.x2 + dcoords.x > this.dim.x + this.dim.width) {
						dcoords.x = (this.dim.x + this.dim.width) - this.start_outer.x2;
					}
					if (this.start_outer.y1 + dcoords.y < this.dim.y) {
						dcoords.y = this.dim.y - this.start_outer.y1;
					}
					else if (this.start_outer.y2 + dcoords.y > this.dim.y + this.dim.height) {
						dcoords.y = (this.dim.y + this.dim.height) - this.start_outer.y2;
					}
					return dcoords;
				},

				_mousedown: function(e, o) {
					if (!this.dragging) {
						if (!e.shiftKey) {
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
								this._startDragging(selected, coords);
								return;
							}
						}
						this.scanvas._mousedown(e, o);
					}
				},

				_mousemove: function(e, o) {
					if (!this.dragging) {
						this.scanvas._mousemove(e, o);
					}
				},

				_mouseup: function(e, o) {
					if (this.dragging) {
						var coords = this._findCoords(e);
						for (var i = 0; i < this.currently_dragging.length; i++) {
							this.currently_dragging[i].adjustCoords(this._findDiffCoords(coords));
						}
						this.currently_dragging = [];
						this.dragging = false;
					}
					else {
						this.scanvas._mouseup(e, o);
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
								draggable.render(this.context, "dragging", this._findDiffCoords(coords));
								this.context.restore();
								found = true;
								break;
							}
						}
						if (!found) {
							draggable.render(this.context, "normal");
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
				minimum_rect: 5,
				selecting_box_fillStyle: "rgba(128, 192, 255, 0.7)",
				selecting_box_strokeStyle: "rgba(64, 128, 192, 0.7)"
			}

			var options = $.extend(defaults, options);
			var canvases = [];

			this.each(function() {
				var o = $.extend({mousearea: $(this), dim: {x: 0, y: 0, width: $(this).attr('width'), height: $(this).attr('height')}}, options);
				var canvas = $.dcanvas._init($(this), o.dim);
				for (var i = 0; i < o.draggable_items.length; i++) {
					canvas._addDraggable(o.draggable_items[i]);
				}
				for (var i = 0; i < o.non_draggable_items.length; i++) {
					canvas._addNonDraggable(o.draggable_items[i]);
				}
				canvas._render();

				o.mousearea.mousedown(function(e) {
					canvas._mousedown(e, o);
					canvas._render(canvas._findCoords(e), o);
				});

				o.mousearea.mousemove(function(e) {
					canvas._mousemove(e, o);
					canvas._render(canvas._findCoords(e), o);
				});

				o.mousearea.mouseup(function(e) {
					canvas._mouseup(e, o);
					canvas._render(canvas._findCoords(e), o);
				});

				canvases.push(canvas);
			});

			return canvases;
		}
	});
})(jQuery);
