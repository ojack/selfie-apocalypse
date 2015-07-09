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
	this.KaleidoEffect = new THREE.ShaderPass( THREE.KaleidoShader);
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

	this.rgbEffect.uniforms[ 'amount' ].value = x*0.8;
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
	this.GlassWarp.uniforms[ 'mag' ].value = 40*Math.sin(frame*0.0009);
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
var effects = ["KaleidoColor",  "GlassWarp",  "Ascii", "Difference", "Checkerboard", "Film"];
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
       
       if(err.name == "NotSupportedError"){
       	 document.getElementById("blinky").innerHTML = "no camera available :[ try using Chrome or Firefox";
       } else {
       	document.getElementById("blinky").innerHTML = "no camera available :[";
       }

    } else {
    	if (window.URL) 
	{   localVid.src = window.URL.createObjectURL(stream);   } 
       console.log('got a stream', stream);  
       texture1 = initVideoTexture(localVid);
       toggleInstructions();
       document.getElementById("blinky").style.color = '#000';
       effectIndex=0;
       effectChain = EffectChain(effects[effectIndex], renderer, texture1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0FzY2lpR3JhZGllbnQuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0VmZmVjdENoYWluLmpzIiwiL1VzZXJzL29qYWNrL2NvZGUvVklERU9fTUlYRVIvR0xJVENIX0NBTS9qcy9HZW5lcmF0ZUdpZi5qcyIsIi9Vc2Vycy9vamFjay9jb2RlL1ZJREVPX01JWEVSL0dMSVRDSF9DQU0vbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9nZXR1c2VybWVkaWEvaW5kZXgtYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUU7QUFDRjs7QUFFQSxJQUFJLFVBQVUsR0FBRywwRUFBMEU7S0FDdEYsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRSxnREFBZ0Q7QUFDbkUsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDOztBQUVoQixJQUFJLGFBQWEsR0FBRyxVQUFVLENBQUM7Q0FDOUIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5QyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUN4QyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUVuQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUMxQyxNQUFN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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuKiBEcmF3cyBhbiBBc2NpaSBzdHJpbmcgb250byBhIGNhbnZhcyBlbGVtZW50XG4qL1xuXG5cbnZhciBjaGFyU3RyaW5nID0gXCIkQEIlOCZXTSMqb2Foa2JkcHF3bVpPMFFMQ0pVWVh6Y3Z1bnhyamZ0L1xcXFx8KCkxe31bXT8tXyt+PD5pIWxJOzosXFxcIl5gJy4gXCJcbiAgICAuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG52YXIgaGVpZ2h0ID0gNTEyOyAgLy8gYmlnZ2VyIGhlcmUgPSBzaGFycGVyIGVkZ2VzIG9uIHRoZSBjaGFyYWN0ZXJzXG52YXIgYmxvY2sgPSBcIuKWiFwiO1xuXG52YXIgQXNjaWlHcmFkaWVudCA9IGZ1bmN0aW9uKCl7XG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0dmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0Y29udGV4dC5mb250ID0gaGVpZ2h0ICsgJ3B4IG1vbm9zcGFjZSc7XG5cdG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KCdpJyk7XG5cblx0Y2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiA5LzEwO1xuXHRjYW52YXMud2lkdGggPSBtZXRyaWNzLndpZHRoICogY2hhclN0cmluZy5sZW5ndGg7XG5cdC8vIGNhbnZhcy5oZWlnaHQgPTUxMjtcblx0Ly8gY2FudmFzLndpZHRoID01MTI7XG5cblx0Y29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRjb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjayc7XG5cdGNvbnRleHQuZmlsbFJlY3QoMCwwLGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcblx0Y29udGV4dC5mb250ID0gaGVpZ2h0ICsgJ3B4IG1vbm9zcGFjZSc7XG5cdGNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcblxuXG4gICAgLy8geU9mZnNldCBpcyBzY2FsZWQgc28gdGhhdCBpdCBpcyAyNCBwaXhlbHMgYXQgYSBoZWlnaHQgb2YgMTI4LlxuICAgIHZhciB5T2Zmc2V0ID0gMjQgKiBoZWlnaHQgLyAxMjg7XG5cdGNvbnRleHQuZmlsbFRleHQoY2hhclN0cmluZywgMCwgY2FudmFzLmhlaWdodCAtIHlPZmZzZXQpO1xuXG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xuXHR0aGlzLm51bUNoYXJzID0gY2hhclN0cmluZy5sZW5ndGg7XG5cdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXNjaWlHcmFkaWVudDtcbiIsIi8qIEZhY3RvcnkgcGF0dGVybiBmb3IgY3JlYXRpbmcgZWZmZWN0c1xuaHR0cDovL2phdmFzY3JpcHQuaW5mby90dXRvcmlhbC9mYWN0b3J5LWNvbnN0cnVjdG9yLXBhdHRlcm5cbiovXG5cbnZhciBhc2NpaSA9IHJlcXVpcmUoJy4vQXNjaWlHcmFkaWVudC5qcycpO1xudmFyIHQ7XG5cbmZ1bmN0aW9uIEVmZmVjdENoYWluKHR5cGUsIHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0ICAvLyBUaHJvdyBhbiBlcnJvciBpZiBubyBjb25zdHJ1Y3RvciBmb3IgdGhlIGdpdmVuIGF1dG9tb2JpbGVcbiAgICBcbiAgICAvL3JldHVybiBldmFsKFwibmV3IFwiICsgdHlwZStcIihcIityZW5kZXJlcitcIilcIik7XG5cbiAgICB2YXIgbmV3RWZmID0gZXZhbChcIm5ldyBcIit0eXBlK1wiKHJlbmRlcmVyLCB0ZXh0dXJlKVwiKTtcbiAgICByZXR1cm4gbmV3RWZmO1xufVxuXG5cblxudmFyIFJnYkRvdHMgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdGNvbnNvbGUubG9nKFwicmdiIGNhbGxlZFwiKTtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5kb3RTY3JlZW5FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuRG90U2NyZWVuU2hhZGVyICk7XG5cdHRoaXMuZG90U2NyZWVuRWZmZWN0LnVuaWZvcm1zWyAnc2NhbGUnIF0udmFsdWUgPSAwLjg7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5kb3RTY3JlZW5FZmZlY3QgKTtcblx0dGhpcy5yZ2JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuUkdCU2hpZnRTaGFkZXIgKTtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSAwLjAwMTU7XG5cdHRoaXMucmdiRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLnJnYkVmZmVjdCk7XG59XG5cblJnYkRvdHMucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHQvL3RoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdHRoaXMuZG90U2NyZWVuRWZmZWN0LnVuaWZvcm1zWyAnc2NhbGUnIF0udmFsdWUgPSB4KjMgO1xuXHR0aGlzLnJnYkVmZmVjdC51bmlmb3Jtc1sgJ2Ftb3VudCcgXS52YWx1ZSA9IHkgO1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xuXG59XG5cbnZhciBLYWxlaWRvc2NvcGUgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5LYWxlaWRvU2hhZGVyKTtcblx0Ly90aGlzLkthbGVpZG9FZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuS2FsZWlkb0VmZmVjdCk7XG5cdHRoaXMuQ29sb3JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuQ29sb3JFZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ29sb3JFZmZlY3QpO1xufVxuXG5LYWxlaWRvc2NvcGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKXtcblx0dmFyIHNpZGVzID0gTWF0aC5jZWlsKHgqMTApO1xuXHR0aGlzLkthbGVpZG9FZmZlY3QudW5pZm9ybXNbICdzaWRlcycgXS52YWx1ZSA9IHgqNztcblx0dGhpcy5LYWxlaWRvRWZmZWN0LnVuaWZvcm1zWyAnb2Zmc2V0JyBdLnZhbHVlID0geSo4O1xuXHR0aGlzLkNvbG9yRWZmZWN0LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0gTWF0aC5jb3MoZnJhbWUqMC4wMSk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbnZhciBLYWxlaWRvQ29sb3IgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5LYWxlaWRvU2hhZGVyKTtcblx0Ly90aGlzLkthbGVpZG9FZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuS2FsZWlkb0VmZmVjdCk7XG5cdHRoaXMuQ29sb3JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ29sb3JFZmZlY3RTaGFkZXIpO1xuXHQvL3RoaXMuQ29sb3JFZmZlY3QudW5pZm9ybXNbICdzYXR1cmF0aW9uJyBdLnZhbHVlID0gMS4wO1xuXHR0aGlzLkNvbG9yRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkNvbG9yRWZmZWN0KTtcbn1cblxuS2FsZWlkb0NvbG9yLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHZhciBzaWRlcyA9IE1hdGguY2VpbCh4KjEwKTtcblx0dGhpcy5LYWxlaWRvRWZmZWN0LnVuaWZvcm1zWyAnc2lkZXMnIF0udmFsdWUgPSB4Kjc7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdC51bmlmb3Jtc1sgJ29mZnNldCcgXS52YWx1ZSA9IHkqNjtcblx0dGhpcy5Db2xvckVmZmVjdC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IE1hdGguY29zKGZyYW1lKjAuMDA0KTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIEZpbG0gPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cblx0dGhpcy5yZ2JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ29sb3JFeHBlcmltZW50U2hhZGVyICk7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0gMC4wMDE1O1xuXHQvL3RoaXMucmdiRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5FeHBlcmltZW50ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkh1ZVNhdHVyYXRpb25TaGFkZXIpO1xuXHR0aGlzLkV4cGVyaW1lbnQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHRcblxuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMucmdiRWZmZWN0KTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcbn1cblxuRmlsbS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSB4KjAuODtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0geSoyLjAgLSAxLjA7XG5cdFx0Ly8gc2NhbmxpbmVzIGVmZmVjdCBpbnRlbnNpdHkgdmFsdWUgKDAgPSBubyBlZmZlY3QsIDEgPSBmdWxsIGVmZmVjdClcblx0XHRcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIERpZmZlcmVuY2UgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cblx0dGhpcy5EaWZmZXJlbmNlID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkRpZmZlcmVuY2VNaXJyb3JTaGFkZXIpO1xuXHRcblx0Ly90aGlzLkRpZmZlcmVuY2UucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHRcdHRoaXMuQ29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0dGhpcy5Db250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuMDtcblx0dGhpcy5Db250cmFzdC51bmlmb3Jtc1snYnJpZ2h0bmVzcyddLnZhbHVlID0gMC4yO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ29udHJhc3QgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkRpZmZlcmVuY2UpO1xuXHR0aGlzLkV4cGVyaW1lbnQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuRXhwZXJpbWVudC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5FeHBlcmltZW50ICk7XG5cdFxufVxuXG5EaWZmZXJlbmNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdzaWRlcycgXS52YWx1ZSA9IHgqMTA7XG5cdHRoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IHgqMi4wIC0gMS4wO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0geTtcblx0Ly90aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydicmlnaHRuZXNzJ10udmFsdWUgPSAgeSoyLjAgLSAxLjA7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgQXNjaWkgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHZhciBjaGFyYWN0ZXJzID0gbmV3IGFzY2lpKCk7XG5cdC8vIGNoYXJhY3RlcnMuY2FudmFzLndpZHRoID0gY2hhcmFjdGVycy5jYW52YXMuaGVpZ2h0ID0gMTI4O1xuXHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2hhcmFjdGVycy5jYW52YXMpO1xuXHQvL3QgPSBpbml0VGV4dHVyZShjaGFyYWN0ZXJzLmNhbnZhcyk7XG50PSBuZXcgVEhSRUUuVGV4dHVyZSggY2hhcmFjdGVycy5jYW52YXMpO1xuXHQvL2NvbnNvbGUubG9nKHQpO1xuXHR0Lm5lZWRzVXBkYXRlPXRydWU7XG5cdHZhciB3b29kVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoICd0ZXh0dXJlcy9jcmF0ZS5naWYnICk7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0dGhpcy5jb250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuNztcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLmNvbnRyYXN0ICk7XG5cdHRoaXMuQXNjaWkgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQXNjaWlTaGFkZXIpO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWyd0RGlmZnVzZTInXS52YWx1ZSA9IHQ7XG5cdHRoaXMuQXNjaWkucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWydudW1DaGFycyddLnZhbHVlID0gY2hhcmFjdGVycy5udW1DaGFycztcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkFzY2lpKTtcbn1cblxuQXNjaWkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHR2YXIgY29scyA9IE1hdGguZmxvb3IoeCAqIDE1MCk7XG4vL1x0dGV4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0dGhpcy5Bc2NpaS51bmlmb3Jtc1sgJ3Jvd3MnIF0udmFsdWUgPSBjb2xzICogd2luZG93LmlubmVySGVpZ2h0IC8gd2luZG93LmlubmVyV2lkdGg7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbICdjb2xzJyBdLnZhbHVlID0gY29scztcblx0dGhpcy5jb250cmFzdC51bmlmb3JtcyBbJ2NvbnRyYXN0J10udmFsdWUgPSB5O1xuXHRcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIENoZWNrZXJib2FyZCA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5DaGVja2VyYm9hcmQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ2hlY2tlcmJvYXJkU2hhZGVyKTtcblx0dGhpcy5DaGVja2VyYm9hcmQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ2hlY2tlcmJvYXJkKTtcbn1cblxuQ2hlY2tlcmJvYXJkLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0dGhpcy5DaGVja2VyYm9hcmQudW5pZm9ybXNbICd3aWR0aCcgXS52YWx1ZSA9IDIuMCAtIHgqMi4wO1xuXHR0aGlzLkNoZWNrZXJib2FyZC51bmlmb3Jtc1sgJ2hlaWdodCcgXS52YWx1ZSA9IDIuMCAtIHkqMi4wO1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIEdsYXNzV2FycCA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5HbGFzc1dhcnAgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuR2xhc3NXYXJwU2hhZGVyKTtcblx0dGhpcy5HbGFzc1dhcnAucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuR2xhc3NXYXJwKTtcblxuXHQvL3RoaXMuY29tcG9zZXIuYWRkUGFzcyggY29udHJhc3QgKTtcbn1cblxuR2xhc3NXYXJwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHRoaXMuR2xhc3NXYXJwLnVuaWZvcm1zWyAnbW91c2VYJyBdLnZhbHVlID0geDtcblx0dGhpcy5HbGFzc1dhcnAudW5pZm9ybXNbICdtb3VzZVknIF0udmFsdWUgPSB5O1xuXHR0aGlzLkdsYXNzV2FycC51bmlmb3Jtc1sgJ21hZycgXS52YWx1ZSA9IDQwKk1hdGguc2luKGZyYW1lKjAuMDAwOSk7XG5cdC8vdGhpcy5Db2xvckVmZmVjdC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IE1hdGguY29zKGZyYW1lKjAuMDEpO1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cbnZhciBFeHBlcmltZW50ID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkV4cGVyaW1lbnQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuRXhwZXJpbWVudC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5FeHBlcmltZW50ICk7XG59XG5cbkV4cGVyaW1lbnQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKXtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0geCoyLjAgLSAxLjA7XG5cdHRoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ3NhdHVyYXRpb24nIF0udmFsdWUgPSB5KjEuMiAtIDAuMjtcblx0Ly90aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbICdtb3VzZVknIF0udmFsdWUgPSB5O1xuXHRcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdtaXhSYXRpbycgXS52YWx1ZSA9IHk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGluaXRUZXh0dXJlKGNhbnZhcyl7XG5cdHZhciB0ZXggPSBuZXcgVEhSRUUuVGV4dHVyZSggY2FudmFzICk7XG5cdC8vbmVlZGVkIGJlY2F1c2UgY2FudCBlbnN1cmUgdGhhdCB2aWRlbyBoYXMgcG93ZXIgb2YgdHdvIGRpbWVuc2lvbnNcblx0Ly90ZXgud3JhcFMgPSBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nO1xuLy9cdHRleC53cmFwVCA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHRleC5tYWdGaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHJldHVybiB0ZXg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWZmZWN0Q2hhaW47XG5cdCIsIlxudmFyIGdpZldpZHRoID0gNjAwO1xuXG52YXIgR2VuZXJhdGVHaWYgPSBmdW5jdGlvbihlbGVtZW50LCBudW1GcmFtZXMsIGVmZmVjdENoYWluKXtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3JjID0gXCJ0ZXh0dXJlcy9wbGF5ZXJfcmVjb3JkLnBuZ1wiO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG5cdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0dGhpcy5jYW52YXMud2lkdGggPSBnaWZXaWR0aDtcblx0dGhpcy5jYW52YXMuaGVpZ2h0ID0gZ2lmV2lkdGgqZWxlbWVudC5oZWlnaHQvZWxlbWVudC53aWR0aDtcblx0dGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuXHR0aGlzLm51bUZyYW1lcyA9IG51bUZyYW1lcztcblx0dGhpcy5mcmFtZUluZGV4ID0gMDtcblx0dGhpcy5naWYgPSBuZXcgR0lGKHtcbiAgXHRcdHdvcmtlcnM6IDIsXG4gIFx0XHRxdWFsaXR5OiAxMDBcblx0fSk7XG5cdHRoaXMuZ2lmLm9uKCdmaW5pc2hlZCcsIGZ1bmN0aW9uKGJsb2IpIHtcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcblx0ICB3aW5kb3cub3BlbihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcblx0fSk7XG5cbn1cblxuR2VuZXJhdGVHaWYucHJvdG90eXBlLmFkZEZyYW1lID0gZnVuY3Rpb24oZWxlbWVudCl7XG5cdHRoaXMuZnJhbWVJbmRleCsrO1xuXHRpZih0aGlzLmZyYW1lSW5kZXggPj0gdGhpcy5udW1GcmFtZXMpe1xuXHRcdHRoaXMuZmluaXNoKCk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGVsc2Uge1xuXHR0aGlzLmNvbnRleHQuZHJhd0ltYWdlKCBlbGVtZW50LCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcblx0dGhpcy5naWYuYWRkRnJhbWUodGhpcy5jYW52YXMsIHtjb3B5OiB0cnVlLCBkZWxheToxNTB9KTtcblx0dGhpcy5mcmFtZUluZGV4Kys7XG5cdHJldHVybiB0cnVlO1xuXHR9XG59O1xuXG5HZW5lcmF0ZUdpZi5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24oKXtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3JjID0gXCJ0ZXh0dXJlcy9hamF4LWxvYWRlci5naWZcIjtcblx0Ly9yZW5kZXJpbmdHaWYgPSBmYWxzZTtcblx0dGhpcy5naWYucmVuZGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyYXRlR2lmO1xuIiwidmFyIHJlbmRlcmVyLCBlZmZlY3RDaGFpbiwgdGV4dHVyZTEsIG1vdXNlWCwgbW91c2VZLCBsb2NhbFZpZDtcbnZhciBnZXRVc2VyTWVkaWEgPSByZXF1aXJlKCdnZXR1c2VybWVkaWEnKTtcbnZhciBFZmZlY3RDaGFpbiA9IHJlcXVpcmUoJy4vanMvRWZmZWN0Q2hhaW4uanMnKTtcbnZhciBHZW5lcmF0ZUdpZiA9IHJlcXVpcmUoJy4vanMvR2VuZXJhdGVHaWYuanMnKTtcblxudmFyIGdpZkZyYW1lcyA9IDA7XG52YXIgZWZmZWN0cyA9IFtcIkthbGVpZG9Db2xvclwiLCAgXCJHbGFzc1dhcnBcIiwgIFwiQXNjaWlcIiwgXCJEaWZmZXJlbmNlXCIsIFwiQ2hlY2tlcmJvYXJkXCIsIFwiRmlsbVwiXTtcbnZhciBlZmZlY3RJbmRleCA9IDA7XG52YXIgcmVuZGVyaW5nR2lmID0gZmFsc2U7XG52YXIgY3VycmVudEdpZjtcbnZhciBmcmFtZUNvdW50ID0gMDtcbm1vdXNlWCA9IG1vdXNlWSA9IDE7XG52YXIgZ2V0SW1hZ2VEYXRhID0gZmFsc2U7XG52YXIgbG9jYWxWaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlkZW9PYmonKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgb25Nb3VzZU1vdmUpO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgaGlkZUludHJvKTtcbmRvY3VtZW50Lm9ua2V5ZG93biA9IGNoZWNrS2V5O1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZSwgZmFsc2UgKTtcblxuXG5cbmZ1bmN0aW9uIGFza0Zvck1lZGlhKCl7XG4vL3MgPSBuZXcgTG9jYWxTdHJlYW0obG9jYWxWaWQpO1xuZ2V0VXNlck1lZGlhKHt2aWRlbzogdHJ1ZSwgYXVkaW86IGZhbHNlfSwgZnVuY3Rpb24gKGVyciwgc3RyZWFtKSB7XG4gICAgLy8gaWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHVzZXIgbWVkaWFcbiAgICAvLyBvciB0aGUgdXNlciBzYXlzIFwibm9cIiB0aGUgZXJyb3IgZ2V0cyBwYXNzZWRcbiAgICAvLyBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgaWYgKGVycikge1xuICAgICAgIC8vY29uc29sZS5sb2coJ2ZhaWxlZCAnKTtcbiAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgIFxuICAgICAgIGlmKGVyci5uYW1lID09IFwiTm90U3VwcG9ydGVkRXJyb3JcIil7XG4gICAgICAgXHQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibGlua3lcIikuaW5uZXJIVE1MID0gXCJubyBjYW1lcmEgYXZhaWxhYmxlIDpbIHRyeSB1c2luZyBDaHJvbWUgb3IgRmlyZWZveFwiO1xuICAgICAgIH0gZWxzZSB7XG4gICAgICAgXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsaW5reVwiKS5pbm5lckhUTUwgPSBcIm5vIGNhbWVyYSBhdmFpbGFibGUgOltcIjtcbiAgICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgIFx0aWYgKHdpbmRvdy5VUkwpIFxuXHR7ICAgbG9jYWxWaWQuc3JjID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTsgICB9IFxuICAgICAgIGNvbnNvbGUubG9nKCdnb3QgYSBzdHJlYW0nLCBzdHJlYW0pOyAgXG4gICAgICAgdGV4dHVyZTEgPSBpbml0VmlkZW9UZXh0dXJlKGxvY2FsVmlkKTtcbiAgICAgICB0b2dnbGVJbnN0cnVjdGlvbnMoKTtcbiAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsaW5reVwiKS5zdHlsZS5jb2xvciA9ICcjMDAwJztcbiAgICAgICBlZmZlY3RJbmRleD0wO1xuICAgICAgIGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG4gICAgfVxufSk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZUluc3RydWN0aW9ucygpe1xuXHR2YXIgdG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPT0gXCJ2aXNpYmxlXCIgPyAgXCJoaWRkZW5cIjogXCJ2aXNpYmxlXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnN0cnVjdGlvbnNcIikuc3R5bGUudmlzaWJpbGl0eSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGFuZGluZ1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gdG9nZ2xlO1xuICBcbn1cbmluaXRXZWJHTCgpO1xuXG5mdW5jdGlvbiBpbml0V2ViR0woKXtcblx0cmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyApO1xuXHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJy0yMCc7XG5cdHRleHR1cmUxID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJ0ZXh0dXJlcy9saW5lcy5wbmdcIiApO1xuXG5cdGluaXRFZmZlY3RzKCk7XG5cdFxuXHRyZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gaW5pdFZpZGVvVGV4dHVyZSh2aWQpe1xuXHR2YXIgdGV4ID0gbmV3IFRIUkVFLlRleHR1cmUoIHZpZCApO1xuXHQvL25lZWRlZCBiZWNhdXNlIGNhbnQgZW5zdXJlIHRoYXQgdmlkZW8gaGFzIHBvd2VyIG9mIHR3byBkaW1lbnNpb25zXG5cdHRleC53cmFwUyA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC53cmFwVCA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHRleC5tYWdGaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHJldHVybiB0ZXg7XG59XG5cbmZ1bmN0aW9uIGluaXRFZmZlY3RzKCl7XG5cdGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG59XG5cblxuXHRcblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7XG5cdG1vdXNlWCA9IGUucGFnZVg7XG5cdG1vdXNlWSA9IGUucGFnZVk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCByZW5kZXIgKTtcblx0ZnJhbWVDb3VudCsrO1xuXHR0ZXh0dXJlMS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdGVmZmVjdENoYWluLnJlbmRlcihtb3VzZVgvd2luZG93LmlubmVyV2lkdGgsIG1vdXNlWS93aW5kb3cuaW5uZXJIZWlnaHQsIGZyYW1lQ291bnQpO1xuXHRpZihyZW5kZXJpbmdHaWYpe1xuXHRcdGlmKGZyYW1lQ291bnQlNT09MCl7XG5cdFx0XHRyZW5kZXJpbmdHaWYgPSBjdXJyZW50R2lmLmFkZEZyYW1lKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcblxuXHRcdFx0XHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cblx0XHRcdH1cblxuZnVuY3Rpb24gaGlkZUludHJvKCl7XG5cdHZhciBkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpO1xuXHR2YXIgZF9uZXN0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpO1xuXHR2YXIgdGhyb3dhd2F5Tm9kZSA9IGQucmVtb3ZlQ2hpbGQoZF9uZXN0ZWQpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3RydWN0aW9uc1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG5cdGFza0Zvck1lZGlhKCk7XG5cdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGhpZGVJbnRybyk7XG59XG5cblxuXG5mdW5jdGlvbiBjaGVja0tleShlKXtcblx0IGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0IFxuXHQgLy9UYWtlIHNjcmVlbnNob3Rcblx0aWYoZS5rZXlDb2RlID09ICA4Myl7XG5cdFx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdFx0dmFyIGltZ0RhdGEgPSByZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgpO1xuXHRcdHdpbmRvdy5vcGVuKGltZ0RhdGEpO1xuXHQvL3JlbmRlciBnaWZcblx0fSBlbHNlIGlmKGUua2V5Q29kZSA9PSAgNzEpe1xuXHRcdHJlbmRlcmluZ0dpZiA9IHRydWU7XG5cdFx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdFx0Y3VycmVudEdpZiA9IG5ldyBHZW5lcmF0ZUdpZihyZW5kZXJlci5kb21FbGVtZW50LCA1MCwgZWZmZWN0Q2hhaW4pO1xuXHQvL2dvIHRvIG5leHQgZWZmZWN0XG4gIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09ICczNycpIHtcbiAgICBcdGVmZmVjdEluZGV4LS07XG4gICAgXHQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnN0cnVjdGlvbnNcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIFx0aWYoZWZmZWN0SW5kZXggPCAwKSBlZmZlY3RJbmRleCA9IGVmZmVjdHMubGVuZ3RoLTE7XG4gICAgXHRlZmZlY3RDaGFpbiA9IEVmZmVjdENoYWluKGVmZmVjdHNbZWZmZWN0SW5kZXhdLCByZW5kZXJlciwgdGV4dHVyZTEpO1xuICAgIH1cbiAgICAvL2dvIHRvIHByZXZpb3VzIGVmZmVjdFxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgXHRlZmZlY3RJbmRleCsrO1xuICAgIFx0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5zdHJ1Y3Rpb25zXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGFuZGluZ1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICBcdGlmKGVmZmVjdEluZGV4ID49IGVmZmVjdHMubGVuZ3RoKSBlZmZlY3RJbmRleCA9IDA7XG4gICAgXHRlZmZlY3RDaGFpbiA9IEVmZmVjdENoYWluKGVmZmVjdHNbZWZmZWN0SW5kZXhdLCByZW5kZXJlciwgdGV4dHVyZTEpO1xuICAgIC8vdG9nZ2xlIGluc3RydWN0aW9uc1xuICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlPT0nNzMnKXtcbiAgICBcdHRvZ2dsZUluc3RydWN0aW9ucygpO1xuICAgIH1cbiAgICBcbn1cblxuIiwiLy8gZ2V0VXNlck1lZGlhIGhlbHBlciBieSBASGVucmlrSm9yZXRlZ1xudmFyIGZ1bmMgPSAod2luZG93Lm5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uc3RyYWludHMsIGNiKSB7XG4gICAgdmFyIG9wdGlvbnMsIGVycm9yO1xuICAgIHZhciBoYXZlT3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDI7XG4gICAgdmFyIGRlZmF1bHRPcHRzID0ge3ZpZGVvOiB0cnVlLCBhdWRpbzogdHJ1ZX07XG5cbiAgICB2YXIgZGVuaWVkID0gJ1Blcm1pc3Npb25EZW5pZWRFcnJvcic7XG4gICAgdmFyIGFsdERlbmllZCA9ICdQRVJNSVNTSU9OX0RFTklFRCc7XG4gICAgdmFyIG5vdFNhdGlzZmllZCA9ICdDb25zdHJhaW50Tm90U2F0aXNmaWVkRXJyb3InO1xuXG4gICAgLy8gbWFrZSBjb25zdHJhaW50cyBvcHRpb25hbFxuICAgIGlmICghaGF2ZU9wdHMpIHtcbiAgICAgICAgY2IgPSBjb25zdHJhaW50cztcbiAgICAgICAgY29uc3RyYWludHMgPSBkZWZhdWx0T3B0cztcbiAgICB9XG5cbiAgICAvLyB0cmVhdCBsYWNrIG9mIGJyb3dzZXIgc3VwcG9ydCBsaWtlIGFuIGVycm9yXG4gICAgaWYgKCFmdW5jKSB7XG4gICAgICAgIC8vIHRocm93IHByb3BlciBlcnJvciBwZXIgc3BlY1xuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignTWVkaWFTdHJlYW1FcnJvcicpO1xuICAgICAgICBlcnJvci5uYW1lID0gJ05vdFN1cHBvcnRlZEVycm9yJztcblxuICAgICAgICAvLyBrZWVwIGFsbCBjYWxsYmFja3MgYXN5bmNcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNiKGVycm9yKTtcbiAgICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgLy8gbm9ybWFsaXplIGVycm9yIGhhbmRsaW5nIHdoZW4gbm8gbWVkaWEgdHlwZXMgYXJlIHJlcXVlc3RlZFxuICAgIGlmICghY29uc3RyYWludHMuYXVkaW8gJiYgIWNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdNZWRpYVN0cmVhbUVycm9yJyk7XG4gICAgICAgIGVycm9yLm5hbWUgPSAnTm9NZWRpYVJlcXVlc3RlZEVycm9yJztcblxuICAgICAgICAvLyBrZWVwIGFsbCBjYWxsYmFja3MgYXN5bmNcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNiKGVycm9yKTtcbiAgICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgaWYgKGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UudXNlRmlyZWZveEZha2VEZXZpY2UgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGNvbnN0cmFpbnRzLmZha2UgPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmMuY2FsbCh3aW5kb3cubmF2aWdhdG9yLCBjb25zdHJhaW50cywgZnVuY3Rpb24gKHN0cmVhbSkge1xuICAgICAgICBjYihudWxsLCBzdHJlYW0pO1xuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIGVycm9yO1xuICAgICAgICAvLyBjb2VyY2UgaW50byBhbiBlcnJvciBvYmplY3Qgc2luY2UgRkYgZ2l2ZXMgdXMgYSBzdHJpbmdcbiAgICAgICAgLy8gdGhlcmUgYXJlIG9ubHkgdHdvIHZhbGlkIG5hbWVzIGFjY29yZGluZyB0byB0aGUgc3BlY1xuICAgICAgICAvLyB3ZSBjb2VyY2UgYWxsIG5vbi1kZW5pZWQgdG8gXCJjb25zdHJhaW50IG5vdCBzYXRpc2ZpZWRcIi5cbiAgICAgICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignTWVkaWFTdHJlYW1FcnJvcicpO1xuICAgICAgICAgICAgaWYgKGVyciA9PT0gZGVuaWVkIHx8IGVyciA9PT0gYWx0RGVuaWVkKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IubmFtZSA9IGRlbmllZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3IubmFtZSA9IG5vdFNhdGlzZmllZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGdldCBhbiBlcnJvciBvYmplY3QgbWFrZSBzdXJlICcubmFtZScgcHJvcGVydHkgaXMgc2V0XG4gICAgICAgICAgICAvLyBhY2NvcmRpbmcgdG8gc3BlYzogaHR0cDovL2Rldi53My5vcmcvMjAxMS93ZWJydGMvZWRpdG9yL2dldHVzZXJtZWRpYS5odG1sI25hdmlnYXRvcnVzZXJtZWRpYWVycm9yLWFuZC1uYXZpZ2F0b3J1c2VybWVkaWFlcnJvcmNhbGxiYWNrXG4gICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIGlmICghZXJyb3IubmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgbGlrZWx5IGNocm9tZSB3aGljaFxuICAgICAgICAgICAgICAgIC8vIHNldHMgYSBwcm9wZXJ0eSBjYWxsZWQgXCJFUlJPUl9ERU5JRURcIiBvbiB0aGUgZXJyb3Igb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gaWYgc28gd2UgbWFrZSBzdXJlIHRvIHNldCBhIG5hbWVcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JbZGVuaWVkXSkge1xuICAgICAgICAgICAgICAgICAgICBlcnIubmFtZSA9IGRlbmllZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnIubmFtZSA9IG5vdFNhdGlzZmllZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYihlcnJvcik7XG4gICAgfSk7XG59O1xuIl19
