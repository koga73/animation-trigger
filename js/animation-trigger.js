/*
* animation-trigger v1.1.1 Copyright (c) 2020 AJ Savino
* https://github.com/koga73/animation-trigger
* MIT License
*/
//You can pass in "params" object to overwrite properties on instance
//Additionally you can change the scope from document to custom via params.el
var AnimationTrigger = function(params){
	var _instance = null;

	var _vars = {
		attributeAnimTrig:AnimationTrigger.DEFAULT_ATTRIBUTE_ANIM_TRIG,

		events:false, //Fire events
		eventChangeVisible:AnimationTrigger.DEFAULT_EVENT_CHANGE_VISIBLE,
		eventChangeActive:AnimationTrigger.DEFAULT_EVENT_CHANGE_ACTIVE,

		classVisible:AnimationTrigger.DEFAULT_CLASS_VISIBLE,
		classShown:AnimationTrigger.DEFAULT_CLASS_SHOWN,
		classActive:AnimationTrigger.DEFAULT_CLASS_ACTIVE,
		classActivated:AnimationTrigger.DEFAULT_CLASS_ACTIVATED,

		scrollDebounce:200, //ms

		_el:null,
		_animEls:[],
		_animElsBounds:[], //Cache
		_resizer:null,
		_scrollTimeout:0
	};

	var _methods = {
		init:function(el){
			el = el || document;
			_vars._el = el;

			if (typeof Resizer !== typeof undefined){
				_vars._resizer = new Resizer({onResize:_methods._handler_resize});
			}

			_instance.updateEls();
			_instance.evalVisibility();
			_instance.evalActive();
		},

		destroy:function(){
			_vars._el.removeEventListener("scroll", _methods._handler_scroll);

			clearTimeout(_vars._scrollTimeout);
			if (_vars._resizer){
				_vars._resizer.destroy();
				_vars._resizer = null;
			}
			_vars._animElsBounds = [];
			_vars._animEls = [];
			_vars._el = null;
		},

		getEls:function(){
			return _vars._animEls;
		},

		getVisible:function(){
			return _vars._el.querySelectorAll("." + _instance.classVisible);
		},

		getShown:function(){
			return _vars._el.querySelectorAll("." + _instance.classShown);
		},

		getActive:function(){
			return _vars._el.querySelector("." + _instance.classActive);
		},

		getActivated:function(){
			return _vars._el.querySelector("." + _instance.classActivated);
		},

		updateEls:function(){
			_vars._animEls = _vars._el.querySelectorAll("[" + _instance.attributeAnimTrig + "]");
			if (_vars._animEls.length){
				_vars._el.addEventListener("scroll", _methods._handler_scroll);
			} else {
				_vars._el.removeEventListener("scroll", _methods._handler_scroll);
			}

			if (!_vars._resizer){
				console.warn("Resizer excluded - cache disabled");
				_vars._animElsBounds = null;
				return;
			}

			//Cache bounds
			_vars._animElsBounds = [];
			for (var i = 0; i < _vars._animEls.length; i++){
				var animEl = _vars._animEls[i];
				_vars._animElsBounds.push(_methods._getBounds(animEl));
			}
		},

		_getBounds:function(el){
			return [
				el.offsetLeft, //Left
				el.offsetTop, //Top
				el.offsetLeft + el.clientWidth, //Right
				el.offsetTop + el.clientHeight, //Bottom
			];
		},

		isVisible:function(el){
			var scrollBounds = _methods._getScrollBounds();
			var elIndex = -1;
			if (_vars._animElsBounds){
				for (var i = 0; i < _vars._animEls.length; i++){
					if (_vars._animEls[i] == el){
						elIndex = i;
						break;
					}
				}
			}
			var elBounds;
			if (elIndex != -1){
				elBounds = _vars._animElsBounds[elIndex];
			} else {
				elBounds = _methods._getBounds(el);
			}

			//Check bounding box
			var inBoundX = (elBounds[0] >= scrollBounds[0] && elBounds[0] <= scrollBounds[2]) || (elBounds[2] >= scrollBounds[0] && elBounds[2] <= scrollBounds[2]) || (scrollBounds[0] >= elBounds[0] && scrollBounds[0] <= elBounds[2]) || (scrollBounds[2] >= elBounds[0] && scrollBounds[2] <= elBounds[2]);
			var inBoundY = (elBounds[1] >= scrollBounds[1] && elBounds[1] <= scrollBounds[3]) || (elBounds[3] >= scrollBounds[1] && elBounds[3] <= scrollBounds[3]) || (scrollBounds[1] >= elBounds[1] && scrollBounds[1] <= elBounds[3]) || (scrollBounds[3] >= elBounds[1] && scrollBounds[3] <= elBounds[3]);
			if (inBoundX && inBoundY){
				return true;
			}
			return false;
		},

		_handler_scroll:function(evt){
			//Debounce
			if (_instance.scrollDebounce){
				if (_vars._scrollTimeout){
					clearTimeout(_vars._scrollTimeout);
				}
				_vars._scrollTimeout = setTimeout(_methods._handler_scroll_timeout, _instance.scrollDebounce);
			} else {
				_methods._handler_scroll_timeout();
			}
		},

		_handler_scroll_timeout:function(){
			clearTimeout(_vars._scrollTimeout);

			_instance.evalVisibility();
			_instance.evalActive();
		},

		_handler_resize:function(width, height){
			_instance.updateEls();
			_instance.evalVisibility();
			_instance.evalActive();
		},

		_getScrollBounds:function(){
			if (_vars._el == document){
				var left = document.body.scrollLeft || document.documentElement.scrollLeft;
				var top = document.body.scrollTop || document.documentElement.scrollTop;
				return [
					left, //Left
					top, //Top
					left + window.innerWidth, //Right
					top + window.innerHeight //Bottom
				];
			} else {
				return [
					_vars._el.scrollLeft, //Left
					_vars._el.scrollTop, //Top
					_vars._el.scrollLeft, //Right
					_vars._el.scrollLeft, //Bottom
				];
			}
		},

		//Active is closest distance between elBounds and scrollBounds
		//This evaluates what is active and adds classes + fires events
		evalActive:function(){
			var scrollBounds = _methods._getScrollBounds();
			var scrollCenter = [
				scrollBounds[0] + Math.abs(scrollBounds[2] - scrollBounds[0]),
				scrollBounds[1] + Math.abs(scrollBounds[3] - scrollBounds[1])
			];

			var closestIndex = -1;
			var closestDist = -1;
			for (var i = 0; i < _vars._animEls.length; i++){
				var animEl = _vars._animEls[i];
				var elBounds;
				if (_vars._animElsBounds){
					elBounds = _vars._animElsBounds[i];
				} else {
					elBounds = _methods._getBounds(animEl);
				}
				var elCenter = [
					elBounds[0] + Math.abs(elBounds[2] - elBounds[0]),
					elBounds[1] + Math.abs(elBounds[3] - elBounds[1])
				];
				var diff = [
					Math.abs(scrollCenter[0] - elCenter[0]),
					Math.abs(scrollCenter[1] - elCenter[1])
				];
				var dist = Math.sqrt(Math.pow(diff[0], 2) + Math.pow(diff[1], 2));
				if (closestDist == -1 || dist < closestDist){
					closestDist = dist;
					closestIndex = i;
				}
			}

			//Classes + events
			for (var i = 0; i < _vars._animEls.length; i++){
				var animEl = _vars._animEls[i];
				if (i == closestIndex){
					if (!animEl.classList.contains(_instance.classActive)){
						animEl.classList.add(_instance.classActive);
						if (!animEl.classList.contains(_instance.classActivated)){
							animEl.classList.add(_instance.classActivated);
						}
						if (_instance.events){
							animEl.dispatchEvent(new CustomEvent(_instance.eventChangeActive, {
								detail:{
									isActive:true
								}
							}));
						}
					}
				} else {
					if (animEl.classList.contains(_instance.classActive)){
						animEl.classList.remove(_instance.classActive);
						if (_instance.events){
							animEl.dispatchEvent(new CustomEvent(_instance.eventChangeActive, {
								detail:{
									isActive:false
								}
							}));
						}
					}
				}
			}
		},

		//This evaluates what is visible and adds classes + fires events
		evalVisibility:function(){
			var dirtyEls = [];
			var visibleEls = [];
			//Toggle visibility class
			for (var i = 0; i < _vars._animEls.length; i++){
				var animEl = _vars._animEls[i];
				if (_instance.isVisible(animEl)){
					if (!animEl.classList.contains(_instance.classVisible)){
						animEl.classList.add(_instance.classVisible);
						if (!animEl.classList.contains(_instance.classShown)){
							animEl.classList.add(_instance.classShown);
						}
						dirtyEls.push({
							el:animEl,
							isVisible:true
						});
					}
					visibleEls.push(animEl);
				} else {
					if (animEl.classList.contains(_instance.classVisible)){
						animEl.classList.remove(_instance.classVisible);
						dirtyEls.push({
							el:animEl,
							isVisible:false
						});
					}
				}
			}
			if (_instance.events){
				for (var i = 0; i < dirtyEls.length; i++){
					var dirtyEl = dirtyEls[i];
					dirtyEl.el.dispatchEvent(new CustomEvent(_instance.eventChangeVisible, {
						detail:{
							isVisible:dirtyEl.isVisible
						}
					}));
				}
			}
		}
	};

	_instance = {
		attributeAnimTrig:_vars.attributeAnimTrig,

		events:_vars.events,
		eventChangeVisible:_vars.eventChangeVisible,
		eventChangeActive:_vars.eventChangeActive,

		classVisible:_vars.classVisible,
		classShown:_vars.classShown,
		classActive:_vars.classActive,
		classActivated:_vars.classActivated,

		scrollDebounce:_vars.scrollDebounce,

		init:_methods.init,
		destroy:_methods.destroy,
		getEls:_methods.getEls,
		getVisible:_methods.getVisible,
		getShown:_methods.getShown,
		getActive:_methods.getActive,
		getActivated:_methods.getActivated,
		updateEls:_methods.updateEls,
		isVisible:_methods.isVisible,
		evalVisibility:_methods.evalVisibility,
		evalActive:_methods.evalActive
	};

	//Apply params
	var el = null;
	if (params){
		for (var param in params){
			_instance[param] = params[param];
		}
		el = param.el || null;
	}
	_instance.init(el);

	return _instance;
};

//Static
AnimationTrigger.DEFAULT_ATTRIBUTE_ANIM_TRIG = "data-animation-trigger";

AnimationTrigger.DEFAULT_EVENT_CHANGE_VISIBLE = "animation-trigger-event-visible";
AnimationTrigger.DEFAULT_EVENT_CHANGE_ACTIVE = "animation-trigger-event-active";

AnimationTrigger.DEFAULT_CLASS_VISIBLE = "animation-trigger-visible";
AnimationTrigger.DEFAULT_CLASS_SHOWN = "animation-trigger-shown";
AnimationTrigger.DEFAULT_CLASS_ACTIVE = "animation-trigger-active";
AnimationTrigger.DEFAULT_CLASS_ACTIVATED = "animation-trigger-activated";

//Export via window - change this if you want
window.AnimationTrigger = AnimationTrigger;