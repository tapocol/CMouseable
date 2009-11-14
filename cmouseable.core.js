(function($) {
	$.canvas = {
		_init: function (canvas, dim) {
			return {
				canvas: canvas,
				context: canvas.get(0).getContext('2d'),
				width: canvas.attr('width'),
				height: canvas.attr('height'),
				dim: dim,

				_findCoords: function(e) {
					return this._correctCoords({x: e.pageX, y: e.pageY});
				},

				_correctCoords: function(coords) {
					return {x: coords.x - this.canvas.get(0).offsetLeft, y: coords.y - this.canvas.get(0).offsetTop};
				},

				_renderClear: function() {
					this.context.clearRect(dim.x, dim.y, dim.width, dim.height);
				}
			};
		}
	};
})(jQuery);

