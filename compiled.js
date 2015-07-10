(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* Draws an Ascii string onto a canvas element
*/


var charString = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
    .split("").reverse().join("");
var height = 512;  // bigger here = sharper edges on the characters
var block = "█";

var AsciiGradient = function(){
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = height + 'px monospace';
	metrics = context.measureText('i');

	canvas = document.createElement('canvas');
	canvas.height = height * 9/10;
	canvas.width = metrics.width * charString.length;
	// canvas.height =512;
	// canvas.width =512;

	context = canvas.getContext('2d');
	context.fillStyle = 'black';
	context.fillRect(0,0,canvas.width,canvas.height);
	context.font = height + 'px monospace';
	context.fillStyle = 'white';


    // yOffset is scaled so that it is 24 pixels at a height of 128.
    var yOffset = 24 * height / 128;
	context.fillText(charString, 0, canvas.height - yOffset);

	this.canvas = canvas;
	this.numChars = charString.length;
	//document.body.appendChild(canvas);

}

module.exports = AsciiGradient;


},{}],2:[function(require,module,exports){
/* Factory pattern for creating effects
http://javascript.info/tutorial/factory-constructor-pattern
*/

var ascii = require('./AsciiGradient.js');
var t;

function EffectChain(type, renderer, texture){
	  // Throw an error if no constructor for the given automobile
    
    //return eval("new " + type+"("+renderer+")");

    var newEff = eval("new "+type+"(renderer, texture)");
    return newEff;
}



var RgbDots = function(renderer, texture){
	console.log("rgb called");
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
	this.dotScreenEffect.uniforms[ 'scale' ].value = 0.8;
	this.composer.addPass( this.dotScreenEffect );
	this.rgbEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
	this.rgbEffect.uniforms[ 'amount' ].value = 0.0015;
	this.rgbEffect.renderToScreen = true;
	this.composer.addPass( this.rgbEffect);
}

RgbDots.prototype.render = function(x, y){
	//this.texture.needsUpdate = true;
	this.dotScreenEffect.uniforms[ 'scale' ].value = x*3 ;
	this.rgbEffect.uniforms[ 'amount' ].value = y ;
	this.composer.render();

}

var Kaleidoscope = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.KaleidoEffect = new THREE.ShaderPass( THREE.KaleidoShader);
	//this.KaleidoEffect.renderToScreen = true;
	this.composer.addPass( this.KaleidoEffect);
	this.ColorEffect = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.ColorEffect.renderToScreen = true;
	this.composer.addPass( this.ColorEffect);
}

Kaleidoscope.prototype.render = function(x, y, frame){
	var sides = Math.ceil(x*10);
	this.KaleidoEffect.uniforms[ 'sides' ].value = x*7;
	this.KaleidoEffect.uniforms[ 'offset' ].value = y*8;
	this.ColorEffect.uniforms[ 'hue' ].value = Math.cos(frame*0.01);
	this.composer.render();
}

var KaleidoColor = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.KaleidoEffect = new THREE.ShaderPass( THREE.KaleidoWarpShader);
	//this.KaleidoEffect.renderToScreen = true;
	this.composer.addPass( this.KaleidoEffect);
	this.ColorEffect = new THREE.ShaderPass( THREE.ColorEffectShader);
	//this.ColorEffect.uniforms[ 'saturation' ].value = 1.0;
	this.ColorEffect.renderToScreen = true;
	this.composer.addPass( this.ColorEffect);
}

KaleidoColor.prototype.render = function(x, y, frame){
	var sides = Math.ceil(x*10);
	this.KaleidoEffect.uniforms[ 'sides' ].value = x*7;
	this.KaleidoEffect.uniforms[ 'offset' ].value = y*6;
	this.ColorEffect.uniforms[ 'hue' ].value = Math.cos(frame*0.004);
	this.composer.render();
}

var Film = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));

	this.rgbEffect = new THREE.ShaderPass( THREE.ColorExperimentShader );
	this.rgbEffect.uniforms[ 'amount' ].value = 0.0015;
	//this.rgbEffect.renderToScreen = true;
	this.Experiment = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.Experiment.renderToScreen = true;
	

	this.composer.addPass( this.rgbEffect);
	this.composer.addPass( this.Experiment );
}

Film.prototype.render = function(x, y){

	this.rgbEffect.uniforms[ 'amount' ].value = 0.5-x;
	this.Experiment.uniforms[ 'hue' ].value = y*2.0 - 1.0;
		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		
	this.composer.render();
}

var Difference = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));

	this.Difference = new THREE.ShaderPass( THREE.DifferenceMirrorShader);
	
	//this.Difference.renderToScreen = true;
		this.Contrast = new THREE.ShaderPass( THREE.BrightnessContrastShader);
	this.Contrast.uniforms['contrast'].value = 0.0;
	this.Contrast.uniforms['brightness'].value = 0.2;
	this.composer.addPass( this.Contrast );
	this.composer.addPass( this.Difference);
	this.Experiment = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.Experiment.renderToScreen = true;
	this.composer.addPass( this.Experiment );
	
}

Difference.prototype.render = function(x, y){
	//this.Difference.uniforms[ 'sides' ].value = x*10;
	this.Experiment.uniforms[ 'hue' ].value = x*2.0 - 1.0;
	this.Contrast.uniforms['contrast'].value = y;
	//this.Contrast.uniforms['brightness'].value =  y*2.0 - 1.0;
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}

var Ascii = function(renderer, texture){
	var characters = new ascii();
	// characters.canvas.width = characters.canvas.height = 128;
	//document.body.appendChild(characters.canvas);
	//t = initTexture(characters.canvas);
t= new THREE.Texture( characters.canvas);
	//console.log(t);
	t.needsUpdate=true;
	var woodTexture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );
	this.composer = new THREE.EffectComposer( renderer );
	this.contrast = new THREE.ShaderPass( THREE.BrightnessContrastShader);
	this.contrast.uniforms['contrast'].value = 0.7;
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.composer.addPass( this.contrast );
	this.Ascii = new THREE.ShaderPass( THREE.AsciiShader);
	this.Ascii.uniforms['tDiffuse2'].value = t;
	this.Ascii.renderToScreen = true;
	this.Ascii.uniforms['numChars'].value = characters.numChars;
	this.composer.addPass( this.Ascii);
}

Ascii.prototype.render = function(x, y){
	var cols = Math.floor(x * 150);
//	tex.needsUpdate = true;
	this.Ascii.uniforms[ 'rows' ].value = cols * window.innerHeight / window.innerWidth;
	this.Ascii.uniforms[ 'cols' ].value = cols;
	this.contrast.uniforms ['contrast'].value = y;
	
	this.composer.render();
}

var Checkerboard = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.Checkerboard = new THREE.ShaderPass( THREE.CheckerboardShader);
	this.Checkerboard.renderToScreen = true;
	this.composer.addPass( this.Checkerboard);
}

Checkerboard.prototype.render = function(x, y){
	this.Checkerboard.uniforms[ 'width' ].value = 2.0 - x*2.0;
	this.Checkerboard.uniforms[ 'height' ].value = 2.0 - y*2.0;
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}

var GlassWarp = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.GlassWarp = new THREE.ShaderPass( THREE.GlassWarpShader);
	this.GlassWarp.renderToScreen = true;
	this.composer.addPass( this.GlassWarp);

	//this.composer.addPass( contrast );
}

GlassWarp.prototype.render = function(x, y, frame){
	this.GlassWarp.uniforms[ 'mouseX' ].value = x;
	this.GlassWarp.uniforms[ 'mouseY' ].value = y;
	this.GlassWarp.uniforms[ 'mag' ].value = 40*Math.sin(frame*0.002);
	//this.ColorEffect.uniforms[ 'hue' ].value = Math.cos(frame*0.01);
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}
var Experiment = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.Experiment = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.Experiment.renderToScreen = true;
	this.composer.addPass( this.Experiment );
}

Experiment.prototype.render = function(x, y, frame){
	this.Experiment.uniforms[ 'hue' ].value = x*2.0 - 1.0;
	this.Experiment.uniforms[ 'saturation' ].value = y*1.2 - 0.2;
	//this.Experiment.uniforms[ 'mouseY' ].value = y;
	
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}

function initTexture(canvas){
	var tex = new THREE.Texture( canvas );
	//needed because cant ensure that video has power of two dimensions
	//tex.wrapS = THREE.ClampToEdgeWrapping;
//	tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	return tex;
}

module.exports = EffectChain;
	

},{"./AsciiGradient.js":1}],3:[function(require,module,exports){

var gifWidth = 600;

var GenerateGif = function(element, numFrames, effectChain){
	document.getElementById("recording").src = "textures/player_record.png";
	document.getElementById("recording").style.visibility = "visible";
	this.canvas = document.createElement( 'canvas' );
	this.canvas.width = gifWidth;
	this.canvas.height = gifWidth*element.height/element.width;
	this.context = this.canvas.getContext( '2d' );
	this.numFrames = numFrames;
	this.frameIndex = 0;
	this.gif = new GIF({
  		workers: 2,
  		quality: 100
	});
	this.gif.on('finished', function(blob) {
		document.getElementById("recording").style.visibility = "hidden";
	  window.open(URL.createObjectURL(blob));
	});

}

GenerateGif.prototype.addFrame = function(element){
	this.frameIndex++;
	if(this.frameIndex >= this.numFrames){
		this.finish();
		return false;
	} else {
	this.context.drawImage( element, 0, 0, this.canvas.width, this.canvas.height);
	this.gif.addFrame(this.canvas, {copy: true, delay:150});
	this.frameIndex++;
	return true;
	}
};

GenerateGif.prototype.finish = function(){
	document.getElementById("recording").src = "textures/ajax-loader.gif";
	//renderingGif = false;
	this.gif.render();
};

module.exports = GenerateGif;


},{}],4:[function(require,module,exports){
var renderer, effectChain, texture1, mouseX, mouseY, localVid;
var getUserMedia = require('getusermedia');
var EffectChain = require('./js/EffectChain.js');
var GenerateGif = require('./js/GenerateGif.js');

var gifFrames = 0;
var effects = ["KaleidoColor",  "GlassWarp",  "Film",  "Ascii", "Difference",  "Checkerboard" ];
var effectIndex = 0;
var renderingGif = false;
var currentGif;
var frameCount = 0;
mouseX = mouseY = 1;
var getImageData = false;
var localVid = document.getElementById('videoObj');

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mousedown", hideIntro);
document.onkeydown = checkKey;
window.addEventListener( 'resize', onWindowResize, false );



function askForMedia(){
//s = new LocalStream(localVid);
getUserMedia({video: true, audio: false}, function (err, stream) {
    // if the browser doesn't support user media
    // or the user says "no" the error gets passed
    // as the first argument.
    if (err) {
       //console.log('failed ');
       console.log(err);
       
      /* if(err.name == "NotSupportedError"){
       	 document.getElementById("blinky").innerHTML = "no camera available :[ try using Chrome or Firefox";
       } else {*/
       	document.getElementById("blinky").innerHTML = "no camera available :[";
      // }

    } else {
    	if (window.URL) 
	{   localVid.src = window.URL.createObjectURL(stream);   } 
       console.log('got a stream', stream);  
       texture1 = initVideoTexture(localVid);
       toggleInstructions();
       document.getElementById("blinky").style.color = '#000';
       effectIndex=0;
       effectChain = EffectChain(effects[effectIndex], renderer, texture1);
       setTimeout(function(){
       		if (document.getElementById("landing").style.visibility == "visible"){
       			toggleInstructions();
       		}
       }, 5000);
    }
});
}

function toggleInstructions(){
	var toggle = document.getElementById("landing").style.visibility == "visible" ?  "hidden": "visible";
    document.getElementById("instructions").style.visibility = document.getElementById("landing").style.visibility = toggle;
  
}
initWebGL();

function initWebGL(){
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	renderer.domElement.style.position = "absolute";
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	renderer.domElement.style.zIndex = '-20';
	texture1 = THREE.ImageUtils.loadTexture( "textures/lines.png" );

	initEffects();
	
	render();
}

function initVideoTexture(vid){
	var tex = new THREE.Texture( vid );
	//needed because cant ensure that video has power of two dimensions
	tex.wrapS = THREE.ClampToEdgeWrapping;
	tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	return tex;
}

function initEffects(){
	effectChain = EffectChain(effects[effectIndex], renderer, texture1);
}


	

function onMouseMove(e){
	mouseX = e.pageX;
	mouseY = e.pageY;
}

function render() {
	requestAnimationFrame( render );
	frameCount++;
	texture1.needsUpdate = true;
	effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
	if(renderingGif){
		if(frameCount%5==0){
			renderingGif = currentGif.addFrame(renderer.domElement);
		}
	}
}

function onWindowResize() {

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

function hideIntro(){
	var d = document.getElementById("landing");
	var d_nested = document.getElementById("start");
	var throwawayNode = d.removeChild(d_nested);
	document.getElementById("instructions").style.visibility = "visible";
	askForMedia();
	window.removeEventListener("mousedown", hideIntro);
}



function checkKey(e){
	 e = e || window.event;
	 
	 //Take screenshot
	if(e.keyCode ==  83){
		effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
		var imgData = renderer.domElement.toDataURL();
		window.open(imgData);
	//render gif
	} else if(e.keyCode ==  71){
		renderingGif = true;
		effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
		currentGif = new GenerateGif(renderer.domElement, 50, effectChain);
	//go to next effect
  } else if (e.keyCode == '37') {
    	effectIndex--;
    	 document.getElementById("instructions").style.visibility = "hidden";
       document.getElementById("landing").style.visibility = "hidden";
    	if(effectIndex < 0) effectIndex = effects.length-1;
    	effectChain = EffectChain(effects[effectIndex], renderer, texture1);
    }
    //go to previous effect
    else if (e.keyCode == '39') {
    	effectIndex++;
    	 document.getElementById("instructions").style.visibility = "hidden";
       document.getElementById("landing").style.visibility = "hidden";
    	if(effectIndex >= effects.length) effectIndex = 0;
    	effectChain = EffectChain(effects[effectIndex], renderer, texture1);
    //toggle instructions
    } else if (e.keyCode=='73'){
    	toggleInstructions();
    }
    
}



},{"./js/EffectChain.js":2,"./js/GenerateGif.js":3,"getusermedia":5}],5:[function(require,module,exports){
// getUserMedia helper by @HenrikJoreteg
var func = (window.navigator.getUserMedia ||
            window.navigator.webkitGetUserMedia ||
            window.navigator.mozGetUserMedia ||
            window.navigator.msGetUserMedia);


module.exports = function (constraints, cb) {
    var options, error;
    var haveOpts = arguments.length === 2;
    var defaultOpts = {video: true, audio: true};

    var denied = 'PermissionDeniedError';
    var altDenied = 'PERMISSION_DENIED';
    var notSatisfied = 'ConstraintNotSatisfiedError';

    // make constraints optional
    if (!haveOpts) {
        cb = constraints;
        constraints = defaultOpts;
    }

    // treat lack of browser support like an error
    if (!func) {
        // throw proper error per spec
        error = new Error('MediaStreamError');
        error.name = 'NotSupportedError';

        // keep all callbacks async
        return window.setTimeout(function () {
            cb(error);
        }, 0);
    }

    // normalize error handling when no media types are requested
    if (!constraints.audio && !constraints.video) {
        error = new Error('MediaStreamError');
        error.name = 'NoMediaRequestedError';

        // keep all callbacks async
        return window.setTimeout(function () {
            cb(error);
        }, 0);
    }

    if (localStorage && localStorage.useFirefoxFakeDevice === "true") {
        constraints.fake = true;
    }

    func.call(window.navigator, constraints, function (stream) {
        cb(null, stream);
    }, function (err) {
        var error;
        // coerce into an error object since FF gives us a string
        // there are only two valid names according to the spec
        // we coerce all non-denied to "constraint not satisfied".
        if (typeof err === 'string') {
            error = new Error('MediaStreamError');
            if (err === denied || err === altDenied) {
                error.name = denied;
            } else {
                error.name = notSatisfied;
            }
        } else {
            // if we get an error object make sure '.name' property is set
            // according to spec: http://dev.w3.org/2011/webrtc/editor/getusermedia.html#navigatorusermediaerror-and-navigatorusermediaerrorcallback
            error = err;
            if (!error.name) {
                // this is likely chrome which
                // sets a property called "ERROR_DENIED" on the error object
                // if so we make sure to set a name
                if (error[denied]) {
                    err.name = denied;
                } else {
                    err.name = notSatisfied;
                }
            }
        }

        cb(error);
    });
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0FzY2lpR3JhZGllbnQuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0VmZmVjdENoYWluLmpzIiwiL1VzZXJzL29qYWNrL2NvZGUvVklERU9fTUlYRVIvR0xJVENIX0NBTS9qcy9HZW5lcmF0ZUdpZi5qcyIsIi9Vc2Vycy9vamFjay9jb2RlL1ZJREVPX01JWEVSL0dMSVRDSF9DQU0vbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9nZXR1c2VybWVkaWEvaW5kZXgtYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUU7QUFDRjs7QUFFQSxJQUFJLFVBQVUsR0FBRywwRUFBMEU7S0FDdEYsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRSxnREFBZ0Q7QUFDbkUsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDOztBQUVoQixJQUFJLGFBQWEsR0FBRyxVQUFVLENBQUM7Q0FDOUIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5QyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUN4QyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUVuQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUMxQyxNQUFN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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4qIERyYXdzIGFuIEFzY2lpIHN0cmluZyBvbnRvIGEgY2FudmFzIGVsZW1lbnRcbiovXG5cblxudmFyIGNoYXJTdHJpbmcgPSBcIiRAQiU4JldNIypvYWhrYmRwcXdtWk8wUUxDSlVZWHpjdnVueHJqZnQvXFxcXHwoKTF7fVtdPy1fK348PmkhbEk7OixcXFwiXmAnLiBcIlxuICAgIC5zcGxpdChcIlwiKS5yZXZlcnNlKCkuam9pbihcIlwiKTtcbnZhciBoZWlnaHQgPSA1MTI7ICAvLyBiaWdnZXIgaGVyZSA9IHNoYXJwZXIgZWRnZXMgb24gdGhlIGNoYXJhY3RlcnNcbnZhciBibG9jayA9IFwi4paIXCI7XG5cbnZhciBBc2NpaUdyYWRpZW50ID0gZnVuY3Rpb24oKXtcblx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHR2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRjb250ZXh0LmZvbnQgPSBoZWlnaHQgKyAncHggbW9ub3NwYWNlJztcblx0bWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQoJ2knKTtcblxuXHRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0Y2FudmFzLmhlaWdodCA9IGhlaWdodCAqIDkvMTA7XG5cdGNhbnZhcy53aWR0aCA9IG1ldHJpY3Mud2lkdGggKiBjaGFyU3RyaW5nLmxlbmd0aDtcblx0Ly8gY2FudmFzLmhlaWdodCA9NTEyO1xuXHQvLyBjYW52YXMud2lkdGggPTUxMjtcblxuXHRjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdGNvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcblx0Y29udGV4dC5maWxsUmVjdCgwLDAsY2FudmFzLndpZHRoLGNhbnZhcy5oZWlnaHQpO1xuXHRjb250ZXh0LmZvbnQgPSBoZWlnaHQgKyAncHggbW9ub3NwYWNlJztcblx0Y29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG5cbiAgICAvLyB5T2Zmc2V0IGlzIHNjYWxlZCBzbyB0aGF0IGl0IGlzIDI0IHBpeGVscyBhdCBhIGhlaWdodCBvZiAxMjguXG4gICAgdmFyIHlPZmZzZXQgPSAyNCAqIGhlaWdodCAvIDEyODtcblx0Y29udGV4dC5maWxsVGV4dChjaGFyU3RyaW5nLCAwLCBjYW52YXMuaGVpZ2h0IC0geU9mZnNldCk7XG5cblx0dGhpcy5jYW52YXMgPSBjYW52YXM7XG5cdHRoaXMubnVtQ2hhcnMgPSBjaGFyU3RyaW5nLmxlbmd0aDtcblx0Ly9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBc2NpaUdyYWRpZW50O1xuIiwiLyogRmFjdG9yeSBwYXR0ZXJuIGZvciBjcmVhdGluZyBlZmZlY3RzXG5odHRwOi8vamF2YXNjcmlwdC5pbmZvL3R1dG9yaWFsL2ZhY3RvcnktY29uc3RydWN0b3ItcGF0dGVyblxuKi9cblxudmFyIGFzY2lpID0gcmVxdWlyZSgnLi9Bc2NpaUdyYWRpZW50LmpzJyk7XG52YXIgdDtcblxuZnVuY3Rpb24gRWZmZWN0Q2hhaW4odHlwZSwgcmVuZGVyZXIsIHRleHR1cmUpe1xuXHQgIC8vIFRocm93IGFuIGVycm9yIGlmIG5vIGNvbnN0cnVjdG9yIGZvciB0aGUgZ2l2ZW4gYXV0b21vYmlsZVxuICAgIFxuICAgIC8vcmV0dXJuIGV2YWwoXCJuZXcgXCIgKyB0eXBlK1wiKFwiK3JlbmRlcmVyK1wiKVwiKTtcblxuICAgIHZhciBuZXdFZmYgPSBldmFsKFwibmV3IFwiK3R5cGUrXCIocmVuZGVyZXIsIHRleHR1cmUpXCIpO1xuICAgIHJldHVybiBuZXdFZmY7XG59XG5cblxuXG52YXIgUmdiRG90cyA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0Y29uc29sZS5sb2coXCJyZ2IgY2FsbGVkXCIpO1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLmRvdFNjcmVlbkVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5Eb3RTY3JlZW5TaGFkZXIgKTtcblx0dGhpcy5kb3RTY3JlZW5FZmZlY3QudW5pZm9ybXNbICdzY2FsZScgXS52YWx1ZSA9IDAuODtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLmRvdFNjcmVlbkVmZmVjdCApO1xuXHR0aGlzLnJnYkVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5SR0JTaGlmdFNoYWRlciApO1xuXHR0aGlzLnJnYkVmZmVjdC51bmlmb3Jtc1sgJ2Ftb3VudCcgXS52YWx1ZSA9IDAuMDAxNTtcblx0dGhpcy5yZ2JFZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMucmdiRWZmZWN0KTtcbn1cblxuUmdiRG90cy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cdC8vdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0dGhpcy5kb3RTY3JlZW5FZmZlY3QudW5pZm9ybXNbICdzY2FsZScgXS52YWx1ZSA9IHgqMyA7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0geSA7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG5cbn1cblxudmFyIEthbGVpZG9zY29wZSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5LYWxlaWRvRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkthbGVpZG9TaGFkZXIpO1xuXHQvL3RoaXMuS2FsZWlkb0VmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5LYWxlaWRvRWZmZWN0KTtcblx0dGhpcy5Db2xvckVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5Db2xvckVmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5Db2xvckVmZmVjdCk7XG59XG5cbkthbGVpZG9zY29wZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSwgZnJhbWUpe1xuXHR2YXIgc2lkZXMgPSBNYXRoLmNlaWwoeCoxMCk7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdC51bmlmb3Jtc1sgJ3NpZGVzJyBdLnZhbHVlID0geCo3O1xuXHR0aGlzLkthbGVpZG9FZmZlY3QudW5pZm9ybXNbICdvZmZzZXQnIF0udmFsdWUgPSB5Kjg7XG5cdHRoaXMuQ29sb3JFZmZlY3QudW5pZm9ybXNbICdodWUnIF0udmFsdWUgPSBNYXRoLmNvcyhmcmFtZSowLjAxKTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIEthbGVpZG9Db2xvciA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5LYWxlaWRvRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkthbGVpZG9XYXJwU2hhZGVyKTtcblx0Ly90aGlzLkthbGVpZG9FZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuS2FsZWlkb0VmZmVjdCk7XG5cdHRoaXMuQ29sb3JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ29sb3JFZmZlY3RTaGFkZXIpO1xuXHQvL3RoaXMuQ29sb3JFZmZlY3QudW5pZm9ybXNbICdzYXR1cmF0aW9uJyBdLnZhbHVlID0gMS4wO1xuXHR0aGlzLkNvbG9yRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkNvbG9yRWZmZWN0KTtcbn1cblxuS2FsZWlkb0NvbG9yLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHZhciBzaWRlcyA9IE1hdGguY2VpbCh4KjEwKTtcblx0dGhpcy5LYWxlaWRvRWZmZWN0LnVuaWZvcm1zWyAnc2lkZXMnIF0udmFsdWUgPSB4Kjc7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdC51bmlmb3Jtc1sgJ29mZnNldCcgXS52YWx1ZSA9IHkqNjtcblx0dGhpcy5Db2xvckVmZmVjdC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IE1hdGguY29zKGZyYW1lKjAuMDA0KTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIEZpbG0gPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cblx0dGhpcy5yZ2JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ29sb3JFeHBlcmltZW50U2hhZGVyICk7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0gMC4wMDE1O1xuXHQvL3RoaXMucmdiRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5FeHBlcmltZW50ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkh1ZVNhdHVyYXRpb25TaGFkZXIpO1xuXHR0aGlzLkV4cGVyaW1lbnQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHRcblxuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMucmdiRWZmZWN0KTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcbn1cblxuRmlsbS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSAwLjUteDtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0geSoyLjAgLSAxLjA7XG5cdFx0Ly8gc2NhbmxpbmVzIGVmZmVjdCBpbnRlbnNpdHkgdmFsdWUgKDAgPSBubyBlZmZlY3QsIDEgPSBmdWxsIGVmZmVjdClcblx0XHRcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIERpZmZlcmVuY2UgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cblx0dGhpcy5EaWZmZXJlbmNlID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkRpZmZlcmVuY2VNaXJyb3JTaGFkZXIpO1xuXHRcblx0Ly90aGlzLkRpZmZlcmVuY2UucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHRcdHRoaXMuQ29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0dGhpcy5Db250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuMDtcblx0dGhpcy5Db250cmFzdC51bmlmb3Jtc1snYnJpZ2h0bmVzcyddLnZhbHVlID0gMC4yO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ29udHJhc3QgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkRpZmZlcmVuY2UpO1xuXHR0aGlzLkV4cGVyaW1lbnQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuRXhwZXJpbWVudC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5FeHBlcmltZW50ICk7XG5cdFxufVxuXG5EaWZmZXJlbmNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdzaWRlcycgXS52YWx1ZSA9IHgqMTA7XG5cdHRoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IHgqMi4wIC0gMS4wO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0geTtcblx0Ly90aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydicmlnaHRuZXNzJ10udmFsdWUgPSAgeSoyLjAgLSAxLjA7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgQXNjaWkgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHZhciBjaGFyYWN0ZXJzID0gbmV3IGFzY2lpKCk7XG5cdC8vIGNoYXJhY3RlcnMuY2FudmFzLndpZHRoID0gY2hhcmFjdGVycy5jYW52YXMuaGVpZ2h0ID0gMTI4O1xuXHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2hhcmFjdGVycy5jYW52YXMpO1xuXHQvL3QgPSBpbml0VGV4dHVyZShjaGFyYWN0ZXJzLmNhbnZhcyk7XG50PSBuZXcgVEhSRUUuVGV4dHVyZSggY2hhcmFjdGVycy5jYW52YXMpO1xuXHQvL2NvbnNvbGUubG9nKHQpO1xuXHR0Lm5lZWRzVXBkYXRlPXRydWU7XG5cdHZhciB3b29kVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoICd0ZXh0dXJlcy9jcmF0ZS5naWYnICk7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0dGhpcy5jb250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuNztcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLmNvbnRyYXN0ICk7XG5cdHRoaXMuQXNjaWkgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQXNjaWlTaGFkZXIpO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWyd0RGlmZnVzZTInXS52YWx1ZSA9IHQ7XG5cdHRoaXMuQXNjaWkucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWydudW1DaGFycyddLnZhbHVlID0gY2hhcmFjdGVycy5udW1DaGFycztcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkFzY2lpKTtcbn1cblxuQXNjaWkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHR2YXIgY29scyA9IE1hdGguZmxvb3IoeCAqIDE1MCk7XG4vL1x0dGV4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0dGhpcy5Bc2NpaS51bmlmb3Jtc1sgJ3Jvd3MnIF0udmFsdWUgPSBjb2xzICogd2luZG93LmlubmVySGVpZ2h0IC8gd2luZG93LmlubmVyV2lkdGg7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbICdjb2xzJyBdLnZhbHVlID0gY29scztcblx0dGhpcy5jb250cmFzdC51bmlmb3JtcyBbJ2NvbnRyYXN0J10udmFsdWUgPSB5O1xuXHRcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIENoZWNrZXJib2FyZCA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5DaGVja2VyYm9hcmQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ2hlY2tlcmJvYXJkU2hhZGVyKTtcblx0dGhpcy5DaGVja2VyYm9hcmQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ2hlY2tlcmJvYXJkKTtcbn1cblxuQ2hlY2tlcmJvYXJkLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0dGhpcy5DaGVja2VyYm9hcmQudW5pZm9ybXNbICd3aWR0aCcgXS52YWx1ZSA9IDIuMCAtIHgqMi4wO1xuXHR0aGlzLkNoZWNrZXJib2FyZC51bmlmb3Jtc1sgJ2hlaWdodCcgXS52YWx1ZSA9IDIuMCAtIHkqMi4wO1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIEdsYXNzV2FycCA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5HbGFzc1dhcnAgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuR2xhc3NXYXJwU2hhZGVyKTtcblx0dGhpcy5HbGFzc1dhcnAucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuR2xhc3NXYXJwKTtcblxuXHQvL3RoaXMuY29tcG9zZXIuYWRkUGFzcyggY29udHJhc3QgKTtcbn1cblxuR2xhc3NXYXJwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHRoaXMuR2xhc3NXYXJwLnVuaWZvcm1zWyAnbW91c2VYJyBdLnZhbHVlID0geDtcblx0dGhpcy5HbGFzc1dhcnAudW5pZm9ybXNbICdtb3VzZVknIF0udmFsdWUgPSB5O1xuXHR0aGlzLkdsYXNzV2FycC51bmlmb3Jtc1sgJ21hZycgXS52YWx1ZSA9IDQwKk1hdGguc2luKGZyYW1lKjAuMDAyKTtcblx0Ly90aGlzLkNvbG9yRWZmZWN0LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0gTWF0aC5jb3MoZnJhbWUqMC4wMSk7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxudmFyIEV4cGVyaW1lbnQgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5FeHBlcmltZW50LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcbn1cblxuRXhwZXJpbWVudC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSwgZnJhbWUpe1xuXHR0aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbICdodWUnIF0udmFsdWUgPSB4KjIuMCAtIDEuMDtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnc2F0dXJhdGlvbicgXS52YWx1ZSA9IHkqMS4yIC0gMC4yO1xuXHQvL3RoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ21vdXNlWScgXS52YWx1ZSA9IHk7XG5cdFxuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gaW5pdFRleHR1cmUoY2FudmFzKXtcblx0dmFyIHRleCA9IG5ldyBUSFJFRS5UZXh0dXJlKCBjYW52YXMgKTtcblx0Ly9uZWVkZWQgYmVjYXVzZSBjYW50IGVuc3VyZSB0aGF0IHZpZGVvIGhhcyBwb3dlciBvZiB0d28gZGltZW5zaW9uc1xuXHQvL3RleC53cmFwUyA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG4vL1x0dGV4LndyYXBUID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0dGV4Lm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0dGV4Lm1hZ0ZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0cmV0dXJuIHRleDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZmZlY3RDaGFpbjtcblx0IiwiXG52YXIgZ2lmV2lkdGggPSA2MDA7XG5cbnZhciBHZW5lcmF0ZUdpZiA9IGZ1bmN0aW9uKGVsZW1lbnQsIG51bUZyYW1lcywgZWZmZWN0Q2hhaW4pe1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zcmMgPSBcInRleHR1cmVzL3BsYXllcl9yZWNvcmQucG5nXCI7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb3JkaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcblx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuXHR0aGlzLmNhbnZhcy53aWR0aCA9IGdpZldpZHRoO1xuXHR0aGlzLmNhbnZhcy5oZWlnaHQgPSBnaWZXaWR0aCplbGVtZW50LmhlaWdodC9lbGVtZW50LndpZHRoO1xuXHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG5cdHRoaXMubnVtRnJhbWVzID0gbnVtRnJhbWVzO1xuXHR0aGlzLmZyYW1lSW5kZXggPSAwO1xuXHR0aGlzLmdpZiA9IG5ldyBHSUYoe1xuICBcdFx0d29ya2VyczogMixcbiAgXHRcdHF1YWxpdHk6IDEwMFxuXHR9KTtcblx0dGhpcy5naWYub24oJ2ZpbmlzaGVkJywgZnVuY3Rpb24oYmxvYikge1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb3JkaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXHQgIHdpbmRvdy5vcGVuKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuXHR9KTtcblxufVxuXG5HZW5lcmF0ZUdpZi5wcm90b3R5cGUuYWRkRnJhbWUgPSBmdW5jdGlvbihlbGVtZW50KXtcblx0dGhpcy5mcmFtZUluZGV4Kys7XG5cdGlmKHRoaXMuZnJhbWVJbmRleCA+PSB0aGlzLm51bUZyYW1lcyl7XG5cdFx0dGhpcy5maW5pc2goKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoIGVsZW1lbnQsIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuXHR0aGlzLmdpZi5hZGRGcmFtZSh0aGlzLmNhbnZhcywge2NvcHk6IHRydWUsIGRlbGF5OjE1MH0pO1xuXHR0aGlzLmZyYW1lSW5kZXgrKztcblx0cmV0dXJuIHRydWU7XG5cdH1cbn07XG5cbkdlbmVyYXRlR2lmLnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbigpe1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zcmMgPSBcInRleHR1cmVzL2FqYXgtbG9hZGVyLmdpZlwiO1xuXHQvL3JlbmRlcmluZ0dpZiA9IGZhbHNlO1xuXHR0aGlzLmdpZi5yZW5kZXIoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2VuZXJhdGVHaWY7XG4iLCJ2YXIgcmVuZGVyZXIsIGVmZmVjdENoYWluLCB0ZXh0dXJlMSwgbW91c2VYLCBtb3VzZVksIGxvY2FsVmlkO1xudmFyIGdldFVzZXJNZWRpYSA9IHJlcXVpcmUoJ2dldHVzZXJtZWRpYScpO1xudmFyIEVmZmVjdENoYWluID0gcmVxdWlyZSgnLi9qcy9FZmZlY3RDaGFpbi5qcycpO1xudmFyIEdlbmVyYXRlR2lmID0gcmVxdWlyZSgnLi9qcy9HZW5lcmF0ZUdpZi5qcycpO1xuXG52YXIgZ2lmRnJhbWVzID0gMDtcbnZhciBlZmZlY3RzID0gW1wiS2FsZWlkb0NvbG9yXCIsICBcIkdsYXNzV2FycFwiLCAgXCJGaWxtXCIsICBcIkFzY2lpXCIsIFwiRGlmZmVyZW5jZVwiLCAgXCJDaGVja2VyYm9hcmRcIiBdO1xudmFyIGVmZmVjdEluZGV4ID0gMDtcbnZhciByZW5kZXJpbmdHaWYgPSBmYWxzZTtcbnZhciBjdXJyZW50R2lmO1xudmFyIGZyYW1lQ291bnQgPSAwO1xubW91c2VYID0gbW91c2VZID0gMTtcbnZhciBnZXRJbWFnZURhdGEgPSBmYWxzZTtcbnZhciBsb2NhbFZpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aWRlb09iaicpO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBvbk1vdXNlTW92ZSk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBoaWRlSW50cm8pO1xuZG9jdW1lbnQub25rZXlkb3duID0gY2hlY2tLZXk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIG9uV2luZG93UmVzaXplLCBmYWxzZSApO1xuXG5cblxuZnVuY3Rpb24gYXNrRm9yTWVkaWEoKXtcbi8vcyA9IG5ldyBMb2NhbFN0cmVhbShsb2NhbFZpZCk7XG5nZXRVc2VyTWVkaWEoe3ZpZGVvOiB0cnVlLCBhdWRpbzogZmFsc2V9LCBmdW5jdGlvbiAoZXJyLCBzdHJlYW0pIHtcbiAgICAvLyBpZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdXNlciBtZWRpYVxuICAgIC8vIG9yIHRoZSB1c2VyIHNheXMgXCJub1wiIHRoZSBlcnJvciBnZXRzIHBhc3NlZFxuICAgIC8vIGFzIHRoZSBmaXJzdCBhcmd1bWVudC5cbiAgICBpZiAoZXJyKSB7XG4gICAgICAgLy9jb25zb2xlLmxvZygnZmFpbGVkICcpO1xuICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgXG4gICAgICAvKiBpZihlcnIubmFtZSA9PSBcIk5vdFN1cHBvcnRlZEVycm9yXCIpe1xuICAgICAgIFx0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxpbmt5XCIpLmlubmVySFRNTCA9IFwibm8gY2FtZXJhIGF2YWlsYWJsZSA6WyB0cnkgdXNpbmcgQ2hyb21lIG9yIEZpcmVmb3hcIjtcbiAgICAgICB9IGVsc2UgeyovXG4gICAgICAgXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsaW5reVwiKS5pbm5lckhUTUwgPSBcIm5vIGNhbWVyYSBhdmFpbGFibGUgOltcIjtcbiAgICAgIC8vIH1cblxuICAgIH0gZWxzZSB7XG4gICAgXHRpZiAod2luZG93LlVSTCkgXG5cdHsgICBsb2NhbFZpZC5zcmMgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pOyAgIH0gXG4gICAgICAgY29uc29sZS5sb2coJ2dvdCBhIHN0cmVhbScsIHN0cmVhbSk7ICBcbiAgICAgICB0ZXh0dXJlMSA9IGluaXRWaWRlb1RleHR1cmUobG9jYWxWaWQpO1xuICAgICAgIHRvZ2dsZUluc3RydWN0aW9ucygpO1xuICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxpbmt5XCIpLnN0eWxlLmNvbG9yID0gJyMwMDAnO1xuICAgICAgIGVmZmVjdEluZGV4PTA7XG4gICAgICAgZWZmZWN0Q2hhaW4gPSBFZmZlY3RDaGFpbihlZmZlY3RzW2VmZmVjdEluZGV4XSwgcmVuZGVyZXIsIHRleHR1cmUxKTtcbiAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgXHRcdGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9PSBcInZpc2libGVcIil7XG4gICAgICAgXHRcdFx0dG9nZ2xlSW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgXHRcdH1cbiAgICAgICB9LCA1MDAwKTtcbiAgICB9XG59KTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlSW5zdHJ1Y3Rpb25zKCl7XG5cdHZhciB0b2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9PSBcInZpc2libGVcIiA/ICBcImhpZGRlblwiOiBcInZpc2libGVcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3RydWN0aW9uc1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSB0b2dnbGU7XG4gIFxufVxuaW5pdFdlYkdMKCk7XG5cbmZ1bmN0aW9uIGluaXRXZWJHTCgpe1xuXHRyZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG5cdHJlbmRlcmVyLnNldFBpeGVsUmF0aW8oIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICk7XG5cdHJlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuXHRyZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXHRyZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRyZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAnLTIwJztcblx0dGV4dHVyZTEgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCBcInRleHR1cmVzL2xpbmVzLnBuZ1wiICk7XG5cblx0aW5pdEVmZmVjdHMoKTtcblx0XG5cdHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBpbml0VmlkZW9UZXh0dXJlKHZpZCl7XG5cdHZhciB0ZXggPSBuZXcgVEhSRUUuVGV4dHVyZSggdmlkICk7XG5cdC8vbmVlZGVkIGJlY2F1c2UgY2FudCBlbnN1cmUgdGhhdCB2aWRlbyBoYXMgcG93ZXIgb2YgdHdvIGRpbWVuc2lvbnNcblx0dGV4LndyYXBTID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0dGV4LndyYXBUID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0dGV4Lm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0dGV4Lm1hZ0ZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0cmV0dXJuIHRleDtcbn1cblxuZnVuY3Rpb24gaW5pdEVmZmVjdHMoKXtcblx0ZWZmZWN0Q2hhaW4gPSBFZmZlY3RDaGFpbihlZmZlY3RzW2VmZmVjdEluZGV4XSwgcmVuZGVyZXIsIHRleHR1cmUxKTtcbn1cblxuXG5cdFxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKXtcblx0bW91c2VYID0gZS5wYWdlWDtcblx0bW91c2VZID0gZS5wYWdlWTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHJlbmRlciApO1xuXHRmcmFtZUNvdW50Kys7XG5cdHRleHR1cmUxLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdGlmKHJlbmRlcmluZ0dpZil7XG5cdFx0aWYoZnJhbWVDb3VudCU1PT0wKXtcblx0XHRcdHJlbmRlcmluZ0dpZiA9IGN1cnJlbnRHaWYuYWRkRnJhbWUocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplKCkge1xuXG5cdFx0XHRcdHJlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblxuXHRcdFx0fVxuXG5mdW5jdGlvbiBoaWRlSW50cm8oKXtcblx0dmFyIGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIik7XG5cdHZhciBkX25lc3RlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XG5cdHZhciB0aHJvd2F3YXlOb2RlID0gZC5yZW1vdmVDaGlsZChkX25lc3RlZCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5zdHJ1Y3Rpb25zXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcblx0YXNrRm9yTWVkaWEoKTtcblx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgaGlkZUludHJvKTtcbn1cblxuXG5cbmZ1bmN0aW9uIGNoZWNrS2V5KGUpe1xuXHQgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHQgXG5cdCAvL1Rha2Ugc2NyZWVuc2hvdFxuXHRpZihlLmtleUNvZGUgPT0gIDgzKXtcblx0XHRlZmZlY3RDaGFpbi5yZW5kZXIobW91c2VYL3dpbmRvdy5pbm5lcldpZHRoLCBtb3VzZVkvd2luZG93LmlubmVySGVpZ2h0LCBmcmFtZUNvdW50KTtcblx0XHR2YXIgaW1nRGF0YSA9IHJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG5cdFx0d2luZG93Lm9wZW4oaW1nRGF0YSk7XG5cdC8vcmVuZGVyIGdpZlxuXHR9IGVsc2UgaWYoZS5rZXlDb2RlID09ICA3MSl7XG5cdFx0cmVuZGVyaW5nR2lmID0gdHJ1ZTtcblx0XHRlZmZlY3RDaGFpbi5yZW5kZXIobW91c2VYL3dpbmRvdy5pbm5lcldpZHRoLCBtb3VzZVkvd2luZG93LmlubmVySGVpZ2h0LCBmcmFtZUNvdW50KTtcblx0XHRjdXJyZW50R2lmID0gbmV3IEdlbmVyYXRlR2lmKHJlbmRlcmVyLmRvbUVsZW1lbnQsIDUwLCBlZmZlY3RDaGFpbik7XG5cdC8vZ28gdG8gbmV4dCBlZmZlY3RcbiAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM3Jykge1xuICAgIFx0ZWZmZWN0SW5kZXgtLTtcbiAgICBcdCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3RydWN0aW9uc1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgXHRpZihlZmZlY3RJbmRleCA8IDApIGVmZmVjdEluZGV4ID0gZWZmZWN0cy5sZW5ndGgtMTtcbiAgICBcdGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG4gICAgfVxuICAgIC8vZ28gdG8gcHJldmlvdXMgZWZmZWN0XG4gICAgZWxzZSBpZiAoZS5rZXlDb2RlID09ICczOScpIHtcbiAgICBcdGVmZmVjdEluZGV4Kys7XG4gICAgXHQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnN0cnVjdGlvbnNcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIFx0aWYoZWZmZWN0SW5kZXggPj0gZWZmZWN0cy5sZW5ndGgpIGVmZmVjdEluZGV4ID0gMDtcbiAgICBcdGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG4gICAgLy90b2dnbGUgaW5zdHJ1Y3Rpb25zXG4gICAgfSBlbHNlIGlmIChlLmtleUNvZGU9PSc3Mycpe1xuICAgIFx0dG9nZ2xlSW5zdHJ1Y3Rpb25zKCk7XG4gICAgfVxuICAgIFxufVxuXG4iLCIvLyBnZXRVc2VyTWVkaWEgaGVscGVyIGJ5IEBIZW5yaWtKb3JldGVnXG52YXIgZnVuYyA9ICh3aW5kb3cubmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25zdHJhaW50cywgY2IpIHtcbiAgICB2YXIgb3B0aW9ucywgZXJyb3I7XG4gICAgdmFyIGhhdmVPcHRzID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMjtcbiAgICB2YXIgZGVmYXVsdE9wdHMgPSB7dmlkZW86IHRydWUsIGF1ZGlvOiB0cnVlfTtcblxuICAgIHZhciBkZW5pZWQgPSAnUGVybWlzc2lvbkRlbmllZEVycm9yJztcbiAgICB2YXIgYWx0RGVuaWVkID0gJ1BFUk1JU1NJT05fREVOSUVEJztcbiAgICB2YXIgbm90U2F0aXNmaWVkID0gJ0NvbnN0cmFpbnROb3RTYXRpc2ZpZWRFcnJvcic7XG5cbiAgICAvLyBtYWtlIGNvbnN0cmFpbnRzIG9wdGlvbmFsXG4gICAgaWYgKCFoYXZlT3B0cykge1xuICAgICAgICBjYiA9IGNvbnN0cmFpbnRzO1xuICAgICAgICBjb25zdHJhaW50cyA9IGRlZmF1bHRPcHRzO1xuICAgIH1cblxuICAgIC8vIHRyZWF0IGxhY2sgb2YgYnJvd3NlciBzdXBwb3J0IGxpa2UgYW4gZXJyb3JcbiAgICBpZiAoIWZ1bmMpIHtcbiAgICAgICAgLy8gdGhyb3cgcHJvcGVyIGVycm9yIHBlciBzcGVjXG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdNZWRpYVN0cmVhbUVycm9yJyk7XG4gICAgICAgIGVycm9yLm5hbWUgPSAnTm90U3VwcG9ydGVkRXJyb3InO1xuXG4gICAgICAgIC8vIGtlZXAgYWxsIGNhbGxiYWNrcyBhc3luY1xuICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2IoZXJyb3IpO1xuICAgICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICAvLyBub3JtYWxpemUgZXJyb3IgaGFuZGxpbmcgd2hlbiBubyBtZWRpYSB0eXBlcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKCFjb25zdHJhaW50cy5hdWRpbyAmJiAhY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ01lZGlhU3RyZWFtRXJyb3InKTtcbiAgICAgICAgZXJyb3IubmFtZSA9ICdOb01lZGlhUmVxdWVzdGVkRXJyb3InO1xuXG4gICAgICAgIC8vIGtlZXAgYWxsIGNhbGxiYWNrcyBhc3luY1xuICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2IoZXJyb3IpO1xuICAgICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS51c2VGaXJlZm94RmFrZURldmljZSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgY29uc3RyYWludHMuZmFrZSA9IHRydWU7XG4gICAgfVxuXG4gICAgZnVuYy5jYWxsKHdpbmRvdy5uYXZpZ2F0b3IsIGNvbnN0cmFpbnRzLCBmdW5jdGlvbiAoc3RyZWFtKSB7XG4gICAgICAgIGNiKG51bGwsIHN0cmVhbSk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICB2YXIgZXJyb3I7XG4gICAgICAgIC8vIGNvZXJjZSBpbnRvIGFuIGVycm9yIG9iamVjdCBzaW5jZSBGRiBnaXZlcyB1cyBhIHN0cmluZ1xuICAgICAgICAvLyB0aGVyZSBhcmUgb25seSB0d28gdmFsaWQgbmFtZXMgYWNjb3JkaW5nIHRvIHRoZSBzcGVjXG4gICAgICAgIC8vIHdlIGNvZXJjZSBhbGwgbm9uLWRlbmllZCB0byBcImNvbnN0cmFpbnQgbm90IHNhdGlzZmllZFwiLlxuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdNZWRpYVN0cmVhbUVycm9yJyk7XG4gICAgICAgICAgICBpZiAoZXJyID09PSBkZW5pZWQgfHwgZXJyID09PSBhbHREZW5pZWQpIHtcbiAgICAgICAgICAgICAgICBlcnJvci5uYW1lID0gZGVuaWVkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvci5uYW1lID0gbm90U2F0aXNmaWVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgd2UgZ2V0IGFuIGVycm9yIG9iamVjdCBtYWtlIHN1cmUgJy5uYW1lJyBwcm9wZXJ0eSBpcyBzZXRcbiAgICAgICAgICAgIC8vIGFjY29yZGluZyB0byBzcGVjOiBodHRwOi8vZGV2LnczLm9yZy8yMDExL3dlYnJ0Yy9lZGl0b3IvZ2V0dXNlcm1lZGlhLmh0bWwjbmF2aWdhdG9ydXNlcm1lZGlhZXJyb3ItYW5kLW5hdmlnYXRvcnVzZXJtZWRpYWVycm9yY2FsbGJhY2tcbiAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgaWYgKCFlcnJvci5uYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBsaWtlbHkgY2hyb21lIHdoaWNoXG4gICAgICAgICAgICAgICAgLy8gc2V0cyBhIHByb3BlcnR5IGNhbGxlZCBcIkVSUk9SX0RFTklFRFwiIG9uIHRoZSBlcnJvciBvYmplY3RcbiAgICAgICAgICAgICAgICAvLyBpZiBzbyB3ZSBtYWtlIHN1cmUgdG8gc2V0IGEgbmFtZVxuICAgICAgICAgICAgICAgIGlmIChlcnJvcltkZW5pZWRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGVyci5uYW1lID0gZGVuaWVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVyci5uYW1lID0gbm90U2F0aXNmaWVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNiKGVycm9yKTtcbiAgICB9KTtcbn07XG4iXX0=
