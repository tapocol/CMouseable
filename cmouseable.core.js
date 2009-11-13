(function($) {
	$.canvas = {
		_init: function (canvas) {
			return {
				canvas: canvas,
				context: canvas.get(0).getContext('2d'),
				width: canvas.attr('width'),
				height: canvas.attr('height'),
				min_x: 0,
				min_y: 0,
				max_x: canvas.attr('width'),
				max_y: canvas.attr('height'),

				_findCoords: function(e) {
					return this._correctCoords({x: e.pageX, y: e.pageY});
				},

				_correctCoords: function(coords) {
					return {x: coords.x - this.canvas.get(0).offsetLeft, y: coords.y - this.canvas.get(0).offsetTop};
				},

				_renderClear: function() {
					this.context.clearRect(0, 0, this.width, this.height);
				}
			};
		}
	};
})(jQuery);

