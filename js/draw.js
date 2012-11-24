define([
	'knockout','underscore','layer',
	'lib/knockout/template',
	'lib/knockout/svgtemplate'
],function(ko,_,Layer,template,svgTemplate){
	var layers = ko.observableArray([new Layer()]),
		layer = ko.observable(),

		toView = function(b,label){
			b = ko.utils.unwrapObservable(b); 
			if(!b) return;
			var p = position(), z = zoom(), o = {};
			if('x' in b) o.x = (b.x*z - p.x); 
			if('y' in b) o.y = (b.y*z - p.y);
			if('width' in b) o.width = Math.round(b.width*z);
			if('height' in b) o.height = Math.round(b.height*z);
			if(label) o[label] = true;
			return o;
		},
		fromView = function(b,label){
			b = ko.utils.unwrapObservable(b);
			if(!b) return;
			var p = position(), z = zoom(), o = {};
			if('x' in b) o.x = (p.x + b.x)/z; 
			if('y' in b) o.y = (p.y + b.y)/z;
			if('width' in b) o.width = b.width/z;
			if('height' in b) o.height = b.height/z;
			if(label) o[label] = true;
			return o;
		},

		add = function(){
			layer().shapes.push.apply(
				layer().shapes,arguments);
		},

		position = ko.observable({x:0,y:0}),
		zoom = ko.observable(1),
		background = ko.observable('white'),
		transform = ko.computed(function(){
			var p = position(),
				z = Math.round(zoom()*1000)/1000;
			return 'translate('+(-p.x)+' '+(-p.y)+') scale('+z+')';
		}).extend({throttle: 1});


		selection = ko.observableArray([]),
		deselect = function(){
			selection.removeAll();
		},
		select = function(){
			selection(_(arguments).toArray());
		},

		options = {
			fill: ko.observable('red'),
			stroke: ko.observable('black'),
			strokeWidth: ko.observable(2),
			strokeLinecap: ko.observable('round')
		},

		controls = ko.observableArray(),
		controlsTemplate = svgTemplate(controls,function(control){
			return (control && control.view) ? control.view:'';
		}),
		baseControl = ko.observable(),

		tool = ko.observable(),
		tools = ko.observableArray(),
		toolTemplate = svgTemplate(tool,function(tool){
			return (tool && tool.view) ? tool.view:'';
		}),
		toolbarTemplate = template(tool,function(tool){
			return (tool && tool.toolbarView) ? tool.toolbarView: '';
		}),

		debounce = ko.observable(false),
		trigger = (function(){
			var active, 
				timeout = _.debounce(function(){
					debounce(false);
				},250);
			return function(type,e){
				if(type.match(/touch|wheel/) && !debounce()){
					active = _(controls()).find(function(t){
						return ('check' in t)
							&& t.check(ko.dataFor(e.target));
					}) || tool();
					debounce(true);
				} 
				if(type.match(/^touch|release$/)){
					debounce(false);
				}else if(type=='wheel')
					timeout();
				else if(type.match(/start/))
					debounce(true);

				if(active && _.isFunction(active[type]))
					active[type](e);
				else if(baseControl() && _.isFunction(baseControl()[type]))
					baseControl()[type](e);
			};
		})();

	selection.subscribe(function(shapes){
		//capture selection options
		if(shapes.length == 1){
			var shape = shapes[0];
			_(options).each(function(option, key){
				if(key in shape && shape[key]()!='none')
					option(shape[key]());
			});
		}
	});

	_(options).each(function(option,key){
		option.subscribe(function(val){
			//on option change apply to selection
			_(selection()).each(function(shape){
				if(key in shape) shape[key](val);
			});
		});
	});

	layer(layers()[0]);

	return {
		layers: layers,
		layer: layer,

		fromView:fromView,
		toView:toView,

		zoom:zoom, 
		position:position,
		transform:transform,

		background:background,
		add:add,

		selection: selection,
		select: select,
		deselect: deselect,
		trigger:trigger,
		debounce:debounce,

		options:options,
		tools:tools,
		tool: tool, 
		toolTemplate:toolTemplate,

		toolbarTemplate:toolbarTemplate,

		controls:controls,
		baseControl:baseControl,
		controlsTemplate:controlsTemplate
	}
});
