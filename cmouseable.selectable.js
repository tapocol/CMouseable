(function($) {
	$.scanvas = {
		_init: function(canvas, dim) {
			return $.extend($.canvas._init(canvas, dim), {
				selectables: [],
				non_selectables: [],
				currently_selecting: [],
				currently_selected: [],
				start_coords: {x: 0, y: 0},
				selecting: false,
				add_selecting: false,

				_addSelectable: function(selectable) {
					this.selectables.push(selectable);
				},

				_addNonSelectable: function(non_selectable) {
					this.non_selectables.push(non_selectable);
				},

				_getCurrentlySelected: function() {
					return this.currently_selected;
				},

				_mousedown: function(e, o) {
					if (!this.selecting) {
						this.selecting = true;
						if (e.shiftKey) {
							this.add_selecting = true;
						}
						else {
							this.currently_selected = [];
						}
						this.start_coords = this._findCoords(e);
					}
				},

				_mousemove: function(e, o) {
					if (this.selecting) {
						this.currently_selecting = [];
						var fcoords = this._findCoords(e);
						var use_rect = Math.abs(fcoords.x - this.start_coords.x) > o.minimum_rect || Math.abs(fcoords.y - this.start_coords.y) > o.minimum_rect;
						for (var i = this.selectables.length - 1; i >= 0; i--) {
							if (use_rect) {
								if (this.selectables[i].doesRectIntersect({x1: this.start_coords.x, y1: this.start_coords.y, x2: fcoords.x, y2: fcoords.y})) {
									var found = false;
									for (var j = 0; j < this.currently_selected.length; j++) {
										if (this.selectables[i] === this.currently_selected[j]) {
											found = true;
											break;
										}
									}
									if (!found) {
										this.currently_selecting.push(this.selectables[i]);
									}
								}
							}
							else {
								if (this.selectables[i].areCoordsIn({x: this.start_coords.x, y: this.start_coords.y})) {
									this.currently_selecting.push(this.selectables[i]);
									break;
								}
							}
						}
					}
				},

				_mouseup: function(e, o) {
					if (this.selecting) {
						this.currently_selecting = [];
						var fcoords = this._findCoords(e);
						var use_rect = Math.abs(fcoords.x - this.start_coords.x) > o.minimum_rect || Math.abs(fcoords.y - this.start_coords.y) > o.minimum_rect;
						for (var i = this.selectables.length - 1; i >= 0; i--) {
							if (use_rect) {
								if (this.selectables[i].doesRectIntersect({x1: this.start_coords.x, y1: this.start_coords.y, x2: fcoords.x, y2: fcoords.y})) {
									var found = false;
									for (var j = 0; j < this.currently_selected.length; j++) {
										if (this.selectables[i] === this.currently_selected[j]) {
											found = true;
											break;
										}
									}
									if (!found) {
										this.currently_selected.push(this.selectables[i]);
									}
								}
							}
							else {
								if (this.selectables[i].areCoordsIn({x: this.start_coords.x, y: this.start_coords.y})) {
									this.currently_selected.push(this.selectables[i]);
									break;
								}
							}
						}
						this.add_selecting = false;
						this.selecting = false;
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
								selectable.render(this.context, "selecting");
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
							selectable.render(this.context, "selected");
							this.context.restore();
							found = true;
							break;
						}
					}
					if (!found) {
						selectable.render(this.context, "normal");
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
				minimum_rect: 5,
				selecting_box_fillStyle: "rgba(128, 192, 255, 0.7)",
				selecting_box_strokeStyle: "rgba(64, 128, 192, 0.7)"
			}

			var options = $.extend(defaults, options);
			var canvases = [];

			this.each(function() {
				var o = $.extend({mousearea: $(this), dim: {x: 0, y: 0, width: $(this).attr('width'), height: $(this).attr('height')}}, options);
				var canvas = $.scanvas._init($(this), o.dim);
				for (var i = 0; i < o.selectable_items.length; i++) {
					canvas._addSelectable(o.selectable_items[i]);
				}
				for (var i = 0; i < o.non_selectable_items.length; i++) {
					canvas._addNonSelectable(o.selectable_items[i]);
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
