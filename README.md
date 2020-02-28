# animation-trigger
Animation trigger adds "animation-trigger-visible" and "animation-trigger-active" classes while scrolling plus fires events when these change

Supports IE11+ with CustomEvent polyfill (in example.html)

- "**animation-trigger-visible**" class indicates that the element is currently visible. *Multiple elements can be visisble*
- "**animation-trigger-shown**" class indicates that the element has been shown. Useful for play-once animations
- "**animation-trigger-active**" class indicates that the center of the element is closest to center of the screen. *Only one element can be active*
- "**animation-trigger-active**" class indicates that the has been active. Useful for play-once animations

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
var animTrig = new AnimationTrigger({
	events:true
});


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
.animation-trigger-visible span {
	margin-top:16px;
	opacity:1;
}
```

## API Reference
Any of these can be passed into constructor to override or called on the instance
- **attributeAnimTrig**: String | Attribute to apply animation logic to | Default: *data-animation-trigger*

- **events**: Boolean | Enable javascript events | default: *false*
- **eventChangeVisible**: String | Event name for visibility change | default: *animation-trigger-event-visible*
- **eventChangeActive**: String | Event name for active change | default: *animation-trigger-event-active*

- **classVisible**: String | Class to add to visible elements | default: *animation-trigger-visible*
- **classShown**: String | Class to add to shown elements | default: *animation-trigger-shown*
- **classActive**: String | Class to add to active elements | default: *animation-trigger-active*
- **classActivated**: String | Class to add to activated elements | default: *animation-trigger-activated*

- **scrollDebounce**: Number | Time in milliseconds to wait after last scroll event before eval | default: *200*

- **init**: Initialize on a container element | default: *document*
- **destroy**: Clean up instance
- **getEls**: Get elements in container with attributeAnimTrig
- **getVisible**: Get elements in container with classVisible
- **getShown**: Get elements in container with classShown
- **getActive**: Get elements in container with classActive
- **getActivated**: Get elements in container with classActivated
- **updateEls**: Re-grab elements in container with attributeAnimTrig and cache bounds (cache if resizer present)
- **isVisible**: Returns true if the element argument is currently visible based on element / container bounds comparison
- **evalVisibility**: Check visibility of all elements in container with attributeAnimTrig and add classes/fire events
- **evalActive**: Find active element from elements in container with attributeAnimTrig and add classes/fire events