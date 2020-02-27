# animation-trigger
Animation trigger adds "animation-trigger-visible" and "animation-trigger-active" classes while scrolling plus fires events when these change

Supports IE11+ with CustomEvent polyfill (in example.html)

- "**animation-trigger-visible**" class indicates that the element is currently visible. *Multiple elements can be visisble*
- "**animation-trigger-active**" class indicates that the center of the element is closest to center of the screen. *Only one element can be active*

## HTML
Just add attribute data-animation-trigger
```html
<header>HEADER</header>
<div>
	<section data-animation-trigger>
		<span>Section 1</span>
	</section>
	<section data-animation-trigger>
		<span>Section 2</span>
	</section>
	<section data-animation-trigger>
		<span>Section 3</span>
	</section>
</div>
<footer>FOOTER</footer>
```

## JS
Simple if you only care about classes

```javascript
var animTrig = new AnimationTrigger();
```

### Additional JS
More advanced if you want to know visible/active with events

```javascript
var animTrig = new AnimationTrigger();


//If you want to grab initially visible
var initialVisible = animTrig.getVisible();
console.log("Initially visible:", initialVisible);

//If you want to grab initially active
var initialActive = animTrig.getActive();
console.log("Initially active:", initialActive);


//If you want to register events when visible or active changes
var els = animTrig.getEls();
for (var i = 0; i < els.length; i++){
	var el = els[i];

	//Listen for visibility change
	el.addEventListener(animTrig.eventChangeVisible, function(evt){
		console.log("Visibility change", evt, evt.detail);
	});

	//Listen for active change
	el.addEventListener(animTrig.eventChangeActive, function(evt){
		console.log("Active change", evt, evt.detail);
	});
}
```

## CSS Example
Fade in span when section becomes visible
```css
span {
	display:inline-block;
	opacity:0;
	transition:all 0.5s;
	transition-delay:0.2s;
}
span.animation-trigger-visible {
	margin-top:16px;
	opacity:1;
}
```