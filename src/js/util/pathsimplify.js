define([],function(){
	var sqr = function(x) { return x * x },
		dist2 = function(v, w){ return sqr(v.x - w.x) + sqr(v.y - w.y) },
		distToSegmentSquared = function(p, v, w) {
			var l2 = dist2(v, w);
			if (l2 == 0) return dist2(p, v);
			var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
			if (t < 0) return dist2(p, v);
			if (t > 1) return dist2(p, w);
			return dist2(p, { 
				x: v.x + t * (w.x - v.x),
				y: v.y + t * (w.y - v.y) 
			});
		};
});

