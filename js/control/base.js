define(['knockout','draw','util/points'],function(ko,Draw,points){
	function select(e){
		var vm = ko.dataFor(e.target);
		if(vm && vm._shape)
			Draw.select(vm);
	}
	function wheel(e){
		var pos = Draw.position(),
			p = e.position;
		Draw.zoom(Draw.zoom()*(1+e.delta));
		Draw.position({
			x: pos.x + e.delta*(pos.x + p.x),
			y: pos.y + e.delta*(pos.y + p.y)
		});
	}
	var zoom, pos;
	function transformstart(e){
		zoom = Draw.zoom();
		pos = Draw.position();
	}
	function transform(e){
		//todo
		var dx = e.distanceX,
			dy = e.distanceY,
			delta = e.scale - 1,
			p = e.position;
		Draw.zoom(zoom*e.scale);
		Draw.position({
			x: pos.x - dx + delta*(pos.x - dx + p.x),
			y: pos.y - dy + delta*(pos.y - dy + p.y)
		});
	}
	return {
		tap:select,
		hold:select,
		wheel:wheel,
		transformstart:transformstart,
		transform:transform
	};
});
