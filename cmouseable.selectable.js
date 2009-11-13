(function($) {
	$.scanvas = {
		_init: function(canvas) {
			return $.extend($.canvas._init(canvas), {
				selectables: [],
				non_selectables: [],
				currently_selecting: [],
				currently_selected: [],
				start_coords: {x: 0, y: 0},
				selecting: false,

				_addSelectable: function(selectable) {
					this.selectables.push(selectable);
				},

				_addNonSelectable: function(non_selectable) {
					this.non_selectables.push(non_selectable);
				},

				_getCurrentlySelected: function() {
					return this.currently_selected;
				},

				_mousedown: function(e) {
					if (!this.selecting) {
						this.selecting = true;
						this.currently_selected = [];
						this.start_coords = this._findCoords(e);
					}
				},

				_mousemove: function(e) {
					if (this.selecting) {
						this.currently_selecting = [];
						for (var i = 0; i < this.selectables.length; i++) {
							var fcoords = this._findCoords(e);
							if (this.selectables[i].doesRectIntersect({x1: this.start_coords.x, y1: this.start_coords.y, x2: fcoords.x, y2: fcoords.y})) {
								this.currently_selecting.push(this.selectables[i]);
							}
						}
					}
				},

				_mouseup: function(e) {
					if (this.selecting) {
						this.selecting = false;
						this.currently_selecting = [];
						for (var i = 0; i < this.selectables.length; i++) {
							var fcoords = this._findCoords(e);
							if (this.selectables[i].doesRectIntersect({x1: this.start_coords.x, y1: this.start_coords.y, x2: fcoords.x, y2: fcoords.y})) {
								this.currently_selected.push(this.selectables[i]);
							}
						}
					}
				},

				_render: function(coords, options) {
					this._renderClear();
					for (var i = 0; i < this.selectables.length; i++) {
						this._renderSelectable(this.selectables[i]);
					}
					for (var i = 0; i < this.non_selectables.length; i++) {
						this.non_selectables[i].renderNormal(this.context);
					}
					this._renderSelectArea(coords, options);
				},

				_renderSelectable: function(selectable) {
					var found = false;
					if (this.selecting) {
						for (var j = 0; j < this.currently_selecting.length; j++) {
							if (selectable === this.currently_selecting[j]) {
								this.context.save();
								selectable.renderSelecting(this.context);
								this.context.restore();
								found = true;
								break;
							}
						}
						if (found) {
							return;
						}
					}
					for (var j = 0; j < this.currently_selected.length; j++) {
						if (selectable === this.currently_selected[j]) {
							this.context.save();
							selectable.renderSelected(this.context);
							this.context.restore();
							found = true;
							break;
						}
					}
					if (!found) {
						selectable.renderNormal(this.context);
					}
				},

				_renderSelectArea: function(coords, options) {
					if (this.selecting) {
						this.context.save();
						this.context.fillStyle = options.selecting_box_fillStyle;
						this.context.fillRect(this.start_coords.x, this.start_coords.y, coords.x - this.start_coords.x, coords.y - this.start_coords.y);
						this.context.strokeStyle = options.selecting_box_strokeStyle;
						this.context.strokeRect(this.start_coords.x, this.start_coords.y, coords.x - this.start_coords.x, coords.y - this.start_coords.y);
						this.context.restore();
					}
				}
			});
		}
	};

	$.fn.extend({
		cselectable: function(options) {

			var defaults = {
				selectable_items: [],
				non_selectable_items: [],
				selecting_box_fillStyle: "rgba(128, 192, 255, 0.7)",
				selecting_box_strokeStyle: "rgba(64, 128, 192, 0.7)"
			}

			var options = $.extend(defaults, options);

			return this.each(function() {
				var o = options;
				var obj = $(this);
				var canvas = $.scanvas._init(obj);
				for (var i = 0; i < o.selectable_items.length; i++) {
					canvas._addSelectable(o.selectable_items[i]);
				}
				for (var i = 0; i < o.non_selectable_items.length; i++) {
					canvas._addNonSelectable(o.selectable_items[i]);
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
