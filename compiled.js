(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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
	this.dotScreenEffect.uniforms[ 'scale' ].value = x ;
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
	this.FilmEffect = new THREE.ShaderPass( THREE.FilmShader);
	//this.FilmEffect.renderToScreen = true;
	this.rgbEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
	this.rgbEffect.uniforms[ 'amount' ].value = 0.0015;
	this.rgbEffect.renderToScreen = true;
	this.composer.addPass( this.FilmEffect);
	this.composer.addPass( this.rgbEffect);
}

Film.prototype.render = function(x, y){
	// noise effect intensity value (0 = no effect, 1 = full effect)
	this.FilmEffect.uniforms['sIntensity'].value = y;
	this.FilmEffect.uniforms['nIntensity'].value = y;
	this.FilmEffect.uniforms['sCount'].value = y*100;
	this.rgbEffect.uniforms[ 'amount' ].value = x*0.8;
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
	//this.GlassWarp.renderToScreen = true;
	this.composer.addPass( this.GlassWarp);
	this.Experiment = new THREE.ShaderPass( THREE.HueSaturationShader);
	//this.Experiment.renderToScreen = true;
	this.Experiment.uniforms['saturation'].value = -.5;
	this.composer.addPass( this.Experiment );
	contrast = new THREE.ShaderPass( THREE.BrightnessContrastShader);
	contrast.renderToScreen = true;
	contrast.uniforms['contrast'].value = 0.7;
	contrast.uniforms['brightness'].value = 0.25;
	this.composer.addPass( contrast );
}

GlassWarp.prototype.render = function(x, y, frame){
	this.GlassWarp.uniforms[ 'mouseX' ].value = x;
	this.GlassWarp.uniforms[ 'mouseY' ].value = y;
	this.GlassWarp.uniforms[ 'mag' ].value = 40*Math.sin(frame*0.0005);
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

var GenerateGif = function(element, numFrames, effectChain){
	document.getElementById("recording").src = "textures/player_record.png";
	document.getElementById("recording").style.visibility = "visible";
	this.canvas = document.createElement( 'canvas' );
	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
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
	this.context.drawImage( element, 0, 0 );
	this.gif.addFrame(this.canvas, {copy: true, delay:200});
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
var getUserMedia = require('getusermedia');
var EffectChain = require('./js/EffectChain.js');
var GenerateGif = require('./js/GenerateGif.js');

var gifFrames = 0;
var effects = ["KaleidoColor", "Ascii",  "Kaleidoscope", "GlassWarp",  "Difference", "RgbDots", "Checkerboard","Film"];
var effectIndex = 0;
var renderingGif = false;
var currentGif;
var frameCount = 0;
var renderer, effectChain, scene, camera, cube, mesh, texture1, texture2, composer, dotScreenEffect, rgbEffect, mouseX, mouseY, shader, remoteVid, localVid, blendEffect;
mouseX = mouseY = 1;
var getImageData = false;
var localVid = document.getElementById('videoObj');
//var remoteVid = document.getElementById('remoteVideo');
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mousedown", function(){
	console.log("click");
	var d = document.getElementById("landing");
var d_nested = document.getElementById("start");
var throwawayNode = d.removeChild(d_nested);
	document.getElementById("instructions").style.visibility = "visible";
	askForMedia();
});
document.onkeydown = checkKey;
window.addEventListener( 'resize', onWindowResize, false );



function askForMedia(){
//s = new LocalStream(localVid);
getUserMedia({video: true, audio: false}, function (err, stream) {
    // if the browser doesn't support user media
    // or the user says "no" the error gets passed
    // as the first argument.
    if (err) {
       console.log('failed ');
       console.log(err);
    } else {
    	if (window.URL) 
	{   localVid.src = window.URL.createObjectURL(stream);   } 
       console.log('got a stream', stream);  
       texture1 = initVideoTexture(localVid);
       document.getElementById("landing").style.visibility = "hidden";
       document.getElementById("instructions").style.visibility = "hidden";
       effectIndex=1;
       effectChain = EffectChain(effects[effectIndex], renderer, texture1);
    //  initWebGL();
  
    }
});
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
	console.log("mouse move");
	mouseX = e.pageX;
	mouseY = e.pageY;
}

function render() {
	requestAnimationFrame( render );
	frameCount++;
	texture1.needsUpdate = true;
	effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
	if(renderingGif){
		if(frameCount%10==0){
			renderingGif = currentGif.addFrame(renderer.domElement);
		}
	}
}

function onWindowResize() {

				renderer.setSize( window.innerWidth, window.innerHeight );

			}





function checkKey(e){
	 e = e || window.event;
	 

	if(e.keyCode ==  83){
		effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
		var imgData = renderer.domElement.toDataURL();
		window.open(imgData);
	} else if(e.keyCode ==  71){
		renderingGif = true;
		console.log(renderer.domElement);
		effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);

		currentGif = new GenerateGif(renderer.domElement, 50, effectChain);

  } else if (e.keyCode == '37') {
    	effectIndex--;
    	 document.getElementById("instructions").style.visibility = "hidden";
       document.getElementById("landing").style.visibility = "hidden";
    	if(effectIndex < 0) effectIndex = effects.length-1;
    }
    else if (e.keyCode == '39') {
    	effectIndex++;
    	 document.getElementById("instructions").style.visibility = "hidden";
       document.getElementById("landing").style.visibility = "hidden";
    	if(effectIndex >= effects.length) effectIndex = 1;
    }
    effectChain = EffectChain(effects[effectIndex], renderer, texture1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0FzY2lpR3JhZGllbnQuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0VmZmVjdENoYWluLmpzIiwiL1VzZXJzL29qYWNrL2NvZGUvVklERU9fTUlYRVIvR0xJVENIX0NBTS9qcy9HZW5lcmF0ZUdpZi5qcyIsIi9Vc2Vycy9vamFjay9jb2RlL1ZJREVPX01JWEVSL0dMSVRDSF9DQU0vbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9nZXR1c2VybWVkaWEvaW5kZXgtYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0EsSUFBSSxVQUFVLEdBQUcsMEVBQTBFO0tBQ3RGLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEMsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQUUsZ0RBQWdEO0FBQ25FLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQzs7QUFFaEIsSUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDO0NBQzlCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDOUMsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxjQUFjLENBQUM7QUFDeEMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Q0FFbkMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDMUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxN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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnZhciBjaGFyU3RyaW5nID0gXCIkQEIlOCZXTSMqb2Foa2JkcHF3bVpPMFFMQ0pVWVh6Y3Z1bnhyamZ0L1xcXFx8KCkxe31bXT8tXyt+PD5pIWxJOzosXFxcIl5gJy4gXCJcbiAgICAuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG52YXIgaGVpZ2h0ID0gNTEyOyAgLy8gYmlnZ2VyIGhlcmUgPSBzaGFycGVyIGVkZ2VzIG9uIHRoZSBjaGFyYWN0ZXJzXG52YXIgYmxvY2sgPSBcIuKWiFwiO1xuXG52YXIgQXNjaWlHcmFkaWVudCA9IGZ1bmN0aW9uKCl7XG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0dmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0Y29udGV4dC5mb250ID0gaGVpZ2h0ICsgJ3B4IG1vbm9zcGFjZSc7XG5cdG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KCdpJyk7XG5cblx0Y2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiA5LzEwO1xuXHRjYW52YXMud2lkdGggPSBtZXRyaWNzLndpZHRoICogY2hhclN0cmluZy5sZW5ndGg7XG5cdC8vIGNhbnZhcy5oZWlnaHQgPTUxMjtcblx0Ly8gY2FudmFzLndpZHRoID01MTI7XG5cblx0Y29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRjb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjayc7XG5cdGNvbnRleHQuZmlsbFJlY3QoMCwwLGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcblx0Y29udGV4dC5mb250ID0gaGVpZ2h0ICsgJ3B4IG1vbm9zcGFjZSc7XG5cdGNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcblxuXG4gICAgLy8geU9mZnNldCBpcyBzY2FsZWQgc28gdGhhdCBpdCBpcyAyNCBwaXhlbHMgYXQgYSBoZWlnaHQgb2YgMTI4LlxuICAgIHZhciB5T2Zmc2V0ID0gMjQgKiBoZWlnaHQgLyAxMjg7XG5cdGNvbnRleHQuZmlsbFRleHQoY2hhclN0cmluZywgMCwgY2FudmFzLmhlaWdodCAtIHlPZmZzZXQpO1xuXG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xuXHR0aGlzLm51bUNoYXJzID0gY2hhclN0cmluZy5sZW5ndGg7XG5cdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXNjaWlHcmFkaWVudDtcbiIsIi8qIEZhY3RvcnkgcGF0dGVybiBmb3IgY3JlYXRpbmcgZWZmZWN0c1xuaHR0cDovL2phdmFzY3JpcHQuaW5mby90dXRvcmlhbC9mYWN0b3J5LWNvbnN0cnVjdG9yLXBhdHRlcm5cbiovXG5cbnZhciBhc2NpaSA9IHJlcXVpcmUoJy4vQXNjaWlHcmFkaWVudC5qcycpO1xudmFyIHQ7XG5cbmZ1bmN0aW9uIEVmZmVjdENoYWluKHR5cGUsIHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0ICAvLyBUaHJvdyBhbiBlcnJvciBpZiBubyBjb25zdHJ1Y3RvciBmb3IgdGhlIGdpdmVuIGF1dG9tb2JpbGVcbiAgICBcbiAgICAvL3JldHVybiBldmFsKFwibmV3IFwiICsgdHlwZStcIihcIityZW5kZXJlcitcIilcIik7XG5cbiAgICB2YXIgbmV3RWZmID0gZXZhbChcIm5ldyBcIit0eXBlK1wiKHJlbmRlcmVyLCB0ZXh0dXJlKVwiKTtcbiAgICByZXR1cm4gbmV3RWZmO1xufVxuXG5cblxudmFyIFJnYkRvdHMgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdGNvbnNvbGUubG9nKFwicmdiIGNhbGxlZFwiKTtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5kb3RTY3JlZW5FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuRG90U2NyZWVuU2hhZGVyICk7XG5cdHRoaXMuZG90U2NyZWVuRWZmZWN0LnVuaWZvcm1zWyAnc2NhbGUnIF0udmFsdWUgPSAwLjg7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5kb3RTY3JlZW5FZmZlY3QgKTtcblx0dGhpcy5yZ2JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuUkdCU2hpZnRTaGFkZXIgKTtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSAwLjAwMTU7XG5cdHRoaXMucmdiRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLnJnYkVmZmVjdCk7XG59XG5cblJnYkRvdHMucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHQvL3RoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdHRoaXMuZG90U2NyZWVuRWZmZWN0LnVuaWZvcm1zWyAnc2NhbGUnIF0udmFsdWUgPSB4IDtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSB5IDtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcblxufVxuXG52YXIgS2FsZWlkb3Njb3BlID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkthbGVpZG9FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuS2FsZWlkb1NoYWRlcik7XG5cdC8vdGhpcy5LYWxlaWRvRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkthbGVpZG9FZmZlY3QpO1xuXHR0aGlzLkNvbG9yRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkh1ZVNhdHVyYXRpb25TaGFkZXIpO1xuXHR0aGlzLkNvbG9yRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkNvbG9yRWZmZWN0KTtcbn1cblxuS2FsZWlkb3Njb3BlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHZhciBzaWRlcyA9IE1hdGguY2VpbCh4KjEwKTtcblx0dGhpcy5LYWxlaWRvRWZmZWN0LnVuaWZvcm1zWyAnc2lkZXMnIF0udmFsdWUgPSB4Kjc7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdC51bmlmb3Jtc1sgJ29mZnNldCcgXS52YWx1ZSA9IHkqODtcblx0dGhpcy5Db2xvckVmZmVjdC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IE1hdGguY29zKGZyYW1lKjAuMDEpO1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgS2FsZWlkb0NvbG9yID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkthbGVpZG9FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuS2FsZWlkb1NoYWRlcik7XG5cdC8vdGhpcy5LYWxlaWRvRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkthbGVpZG9FZmZlY3QpO1xuXHR0aGlzLkNvbG9yRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkNvbG9yRWZmZWN0U2hhZGVyKTtcblx0Ly90aGlzLkNvbG9yRWZmZWN0LnVuaWZvcm1zWyAnc2F0dXJhdGlvbicgXS52YWx1ZSA9IDEuMDtcblx0dGhpcy5Db2xvckVmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5Db2xvckVmZmVjdCk7XG59XG5cbkthbGVpZG9Db2xvci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSwgZnJhbWUpe1xuXHR2YXIgc2lkZXMgPSBNYXRoLmNlaWwoeCoxMCk7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdC51bmlmb3Jtc1sgJ3NpZGVzJyBdLnZhbHVlID0geCo3O1xuXHR0aGlzLkthbGVpZG9FZmZlY3QudW5pZm9ybXNbICdvZmZzZXQnIF0udmFsdWUgPSB5KjY7XG5cdHRoaXMuQ29sb3JFZmZlY3QudW5pZm9ybXNbICdodWUnIF0udmFsdWUgPSBNYXRoLmNvcyhmcmFtZSowLjAwNCk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbnZhciBGaWxtID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkZpbG1FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuRmlsbVNoYWRlcik7XG5cdC8vdGhpcy5GaWxtRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5yZ2JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuUkdCU2hpZnRTaGFkZXIgKTtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSAwLjAwMTU7XG5cdHRoaXMucmdiRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkZpbG1FZmZlY3QpO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMucmdiRWZmZWN0KTtcbn1cblxuRmlsbS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cdC8vIG5vaXNlIGVmZmVjdCBpbnRlbnNpdHkgdmFsdWUgKDAgPSBubyBlZmZlY3QsIDEgPSBmdWxsIGVmZmVjdClcblx0dGhpcy5GaWxtRWZmZWN0LnVuaWZvcm1zWydzSW50ZW5zaXR5J10udmFsdWUgPSB5O1xuXHR0aGlzLkZpbG1FZmZlY3QudW5pZm9ybXNbJ25JbnRlbnNpdHknXS52YWx1ZSA9IHk7XG5cdHRoaXMuRmlsbUVmZmVjdC51bmlmb3Jtc1snc0NvdW50J10udmFsdWUgPSB5KjEwMDtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSB4KjAuODtcblx0XHQvLyBzY2FubGluZXMgZWZmZWN0IGludGVuc2l0eSB2YWx1ZSAoMCA9IG5vIGVmZmVjdCwgMSA9IGZ1bGwgZWZmZWN0KVxuXHRcdFxuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgRGlmZmVyZW5jZSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblxuXHR0aGlzLkRpZmZlcmVuY2UgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuRGlmZmVyZW5jZU1pcnJvclNoYWRlcik7XG5cdFxuXHQvL3RoaXMuRGlmZmVyZW5jZS5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdFx0dGhpcy5Db250cmFzdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5CcmlnaHRuZXNzQ29udHJhc3RTaGFkZXIpO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0gMC4wO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydicmlnaHRuZXNzJ10udmFsdWUgPSAwLjI7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5Db250cmFzdCApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuRGlmZmVyZW5jZSk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5FeHBlcmltZW50LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcblx0XG59XG5cbkRpZmZlcmVuY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ3NpZGVzJyBdLnZhbHVlID0geCoxMDtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0geCoyLjAgLSAxLjA7XG5cdHRoaXMuQ29udHJhc3QudW5pZm9ybXNbJ2NvbnRyYXN0J10udmFsdWUgPSB5O1xuXHQvL3RoaXMuQ29udHJhc3QudW5pZm9ybXNbJ2JyaWdodG5lc3MnXS52YWx1ZSA9ICB5KjIuMCAtIDEuMDtcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdtaXhSYXRpbycgXS52YWx1ZSA9IHk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbnZhciBBc2NpaSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dmFyIGNoYXJhY3RlcnMgPSBuZXcgYXNjaWkoKTtcblx0Ly8gY2hhcmFjdGVycy5jYW52YXMud2lkdGggPSBjaGFyYWN0ZXJzLmNhbnZhcy5oZWlnaHQgPSAxMjg7XG5cdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjaGFyYWN0ZXJzLmNhbnZhcyk7XG5cdC8vdCA9IGluaXRUZXh0dXJlKGNoYXJhY3RlcnMuY2FudmFzKTtcbnQ9IG5ldyBUSFJFRS5UZXh0dXJlKCBjaGFyYWN0ZXJzLmNhbnZhcyk7XG5cdC8vY29uc29sZS5sb2codCk7XG5cdHQubmVlZHNVcGRhdGU9dHJ1ZTtcblx0dmFyIHdvb2RUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggJ3RleHR1cmVzL2NyYXRlLmdpZicgKTtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb250cmFzdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5CcmlnaHRuZXNzQ29udHJhc3RTaGFkZXIpO1xuXHR0aGlzLmNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0gMC43O1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuY29udHJhc3QgKTtcblx0dGhpcy5Bc2NpaSA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5Bc2NpaVNoYWRlcik7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbJ3REaWZmdXNlMiddLnZhbHVlID0gdDtcblx0dGhpcy5Bc2NpaS5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbJ251bUNoYXJzJ10udmFsdWUgPSBjaGFyYWN0ZXJzLm51bUNoYXJzO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQXNjaWkpO1xufVxuXG5Bc2NpaS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cdHZhciBjb2xzID0gTWF0aC5mbG9vcih4ICogMTUwKTtcbi8vXHR0ZXgubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWyAncm93cycgXS52YWx1ZSA9IGNvbHMgKiB3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aDtcblx0dGhpcy5Bc2NpaS51bmlmb3Jtc1sgJ2NvbHMnIF0udmFsdWUgPSBjb2xzO1xuXHR0aGlzLmNvbnRyYXN0LnVuaWZvcm1zIFsnY29udHJhc3QnXS52YWx1ZSA9IHk7XG5cdFxuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgQ2hlY2tlcmJvYXJkID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkNoZWNrZXJib2FyZCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5DaGVja2VyYm9hcmRTaGFkZXIpO1xuXHR0aGlzLkNoZWNrZXJib2FyZC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5DaGVja2VyYm9hcmQpO1xufVxuXG5DaGVja2VyYm9hcmQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHR0aGlzLkNoZWNrZXJib2FyZC51bmlmb3Jtc1sgJ3dpZHRoJyBdLnZhbHVlID0gMi4wIC0geCoyLjA7XG5cdHRoaXMuQ2hlY2tlcmJvYXJkLnVuaWZvcm1zWyAnaGVpZ2h0JyBdLnZhbHVlID0gMi4wIC0geSoyLjA7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgR2xhc3NXYXJwID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkdsYXNzV2FycCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5HbGFzc1dhcnBTaGFkZXIpO1xuXHQvL3RoaXMuR2xhc3NXYXJwLnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkdsYXNzV2FycCk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0Ly90aGlzLkV4cGVyaW1lbnQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbJ3NhdHVyYXRpb24nXS52YWx1ZSA9IC0uNTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcblx0Y29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0Y29udHJhc3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHRjb250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuNztcblx0Y29udHJhc3QudW5pZm9ybXNbJ2JyaWdodG5lc3MnXS52YWx1ZSA9IDAuMjU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggY29udHJhc3QgKTtcbn1cblxuR2xhc3NXYXJwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHRoaXMuR2xhc3NXYXJwLnVuaWZvcm1zWyAnbW91c2VYJyBdLnZhbHVlID0geDtcblx0dGhpcy5HbGFzc1dhcnAudW5pZm9ybXNbICdtb3VzZVknIF0udmFsdWUgPSB5O1xuXHR0aGlzLkdsYXNzV2FycC51bmlmb3Jtc1sgJ21hZycgXS52YWx1ZSA9IDQwKk1hdGguc2luKGZyYW1lKjAuMDAwNSk7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxudmFyIEV4cGVyaW1lbnQgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5FeHBlcmltZW50LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcbn1cblxuRXhwZXJpbWVudC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSwgZnJhbWUpe1xuXHR0aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbICdodWUnIF0udmFsdWUgPSB4KjIuMCAtIDEuMDtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnc2F0dXJhdGlvbicgXS52YWx1ZSA9IHkqMS4yIC0gMC4yO1xuXHQvL3RoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ21vdXNlWScgXS52YWx1ZSA9IHk7XG5cdFxuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gaW5pdFRleHR1cmUoY2FudmFzKXtcblx0dmFyIHRleCA9IG5ldyBUSFJFRS5UZXh0dXJlKCBjYW52YXMgKTtcblx0Ly9uZWVkZWQgYmVjYXVzZSBjYW50IGVuc3VyZSB0aGF0IHZpZGVvIGhhcyBwb3dlciBvZiB0d28gZGltZW5zaW9uc1xuXHQvL3RleC53cmFwUyA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG4vL1x0dGV4LndyYXBUID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0dGV4Lm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0dGV4Lm1hZ0ZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0cmV0dXJuIHRleDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZmZlY3RDaGFpbjtcblx0IiwiXG52YXIgR2VuZXJhdGVHaWYgPSBmdW5jdGlvbihlbGVtZW50LCBudW1GcmFtZXMsIGVmZmVjdENoYWluKXtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3JjID0gXCJ0ZXh0dXJlcy9wbGF5ZXJfcmVjb3JkLnBuZ1wiO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG5cdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0dGhpcy5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0dGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG5cdHRoaXMubnVtRnJhbWVzID0gbnVtRnJhbWVzO1xuXHR0aGlzLmZyYW1lSW5kZXggPSAwO1xuXHR0aGlzLmdpZiA9IG5ldyBHSUYoe1xuICBcdFx0d29ya2VyczogMixcbiAgXHRcdHF1YWxpdHk6IDEwMFxuXHR9KTtcblx0dGhpcy5naWYub24oJ2ZpbmlzaGVkJywgZnVuY3Rpb24oYmxvYikge1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb3JkaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXHQgIHdpbmRvdy5vcGVuKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuXHR9KTtcblxufVxuXG5HZW5lcmF0ZUdpZi5wcm90b3R5cGUuYWRkRnJhbWUgPSBmdW5jdGlvbihlbGVtZW50KXtcblx0dGhpcy5mcmFtZUluZGV4Kys7XG5cdGlmKHRoaXMuZnJhbWVJbmRleCA+PSB0aGlzLm51bUZyYW1lcyl7XG5cdFx0dGhpcy5maW5pc2goKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoIGVsZW1lbnQsIDAsIDAgKTtcblx0dGhpcy5naWYuYWRkRnJhbWUodGhpcy5jYW52YXMsIHtjb3B5OiB0cnVlLCBkZWxheToyMDB9KTtcblx0dGhpcy5mcmFtZUluZGV4Kys7XG5cdHJldHVybiB0cnVlO1xuXHR9XG59O1xuXG5HZW5lcmF0ZUdpZi5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24oKXtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3JjID0gXCJ0ZXh0dXJlcy9hamF4LWxvYWRlci5naWZcIjtcblx0Ly9yZW5kZXJpbmdHaWYgPSBmYWxzZTtcblx0dGhpcy5naWYucmVuZGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyYXRlR2lmO1xuIiwidmFyIGdldFVzZXJNZWRpYSA9IHJlcXVpcmUoJ2dldHVzZXJtZWRpYScpO1xudmFyIEVmZmVjdENoYWluID0gcmVxdWlyZSgnLi9qcy9FZmZlY3RDaGFpbi5qcycpO1xudmFyIEdlbmVyYXRlR2lmID0gcmVxdWlyZSgnLi9qcy9HZW5lcmF0ZUdpZi5qcycpO1xuXG52YXIgZ2lmRnJhbWVzID0gMDtcbnZhciBlZmZlY3RzID0gW1wiS2FsZWlkb0NvbG9yXCIsIFwiQXNjaWlcIiwgIFwiS2FsZWlkb3Njb3BlXCIsIFwiR2xhc3NXYXJwXCIsICBcIkRpZmZlcmVuY2VcIiwgXCJSZ2JEb3RzXCIsIFwiQ2hlY2tlcmJvYXJkXCIsXCJGaWxtXCJdO1xudmFyIGVmZmVjdEluZGV4ID0gMDtcbnZhciByZW5kZXJpbmdHaWYgPSBmYWxzZTtcbnZhciBjdXJyZW50R2lmO1xudmFyIGZyYW1lQ291bnQgPSAwO1xudmFyIHJlbmRlcmVyLCBlZmZlY3RDaGFpbiwgc2NlbmUsIGNhbWVyYSwgY3ViZSwgbWVzaCwgdGV4dHVyZTEsIHRleHR1cmUyLCBjb21wb3NlciwgZG90U2NyZWVuRWZmZWN0LCByZ2JFZmZlY3QsIG1vdXNlWCwgbW91c2VZLCBzaGFkZXIsIHJlbW90ZVZpZCwgbG9jYWxWaWQsIGJsZW5kRWZmZWN0O1xubW91c2VYID0gbW91c2VZID0gMTtcbnZhciBnZXRJbWFnZURhdGEgPSBmYWxzZTtcbnZhciBsb2NhbFZpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aWRlb09iaicpO1xuLy92YXIgcmVtb3RlVmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlbW90ZVZpZGVvJyk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBvbk1vdXNlTW92ZSk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpe1xuXHRjb25zb2xlLmxvZyhcImNsaWNrXCIpO1xuXHR2YXIgZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGFuZGluZ1wiKTtcbnZhciBkX25lc3RlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XG52YXIgdGhyb3dhd2F5Tm9kZSA9IGQucmVtb3ZlQ2hpbGQoZF9uZXN0ZWQpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3RydWN0aW9uc1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG5cdGFza0Zvck1lZGlhKCk7XG59KTtcbmRvY3VtZW50Lm9ua2V5ZG93biA9IGNoZWNrS2V5O1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZSwgZmFsc2UgKTtcblxuXG5cbmZ1bmN0aW9uIGFza0Zvck1lZGlhKCl7XG4vL3MgPSBuZXcgTG9jYWxTdHJlYW0obG9jYWxWaWQpO1xuZ2V0VXNlck1lZGlhKHt2aWRlbzogdHJ1ZSwgYXVkaW86IGZhbHNlfSwgZnVuY3Rpb24gKGVyciwgc3RyZWFtKSB7XG4gICAgLy8gaWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHVzZXIgbWVkaWFcbiAgICAvLyBvciB0aGUgdXNlciBzYXlzIFwibm9cIiB0aGUgZXJyb3IgZ2V0cyBwYXNzZWRcbiAgICAvLyBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgaWYgKGVycikge1xuICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgJyk7XG4gICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9IGVsc2Uge1xuICAgIFx0aWYgKHdpbmRvdy5VUkwpIFxuXHR7ICAgbG9jYWxWaWQuc3JjID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTsgICB9IFxuICAgICAgIGNvbnNvbGUubG9nKCdnb3QgYSBzdHJlYW0nLCBzdHJlYW0pOyAgXG4gICAgICAgdGV4dHVyZTEgPSBpbml0VmlkZW9UZXh0dXJlKGxvY2FsVmlkKTtcbiAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnN0cnVjdGlvbnNcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgZWZmZWN0SW5kZXg9MTtcbiAgICAgICBlZmZlY3RDaGFpbiA9IEVmZmVjdENoYWluKGVmZmVjdHNbZWZmZWN0SW5kZXhdLCByZW5kZXJlciwgdGV4dHVyZTEpO1xuICAgIC8vICBpbml0V2ViR0woKTtcbiAgXG4gICAgfVxufSk7XG59XG5cbmluaXRXZWJHTCgpO1xuXG5mdW5jdGlvbiBpbml0V2ViR0woKXtcblx0cmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyApO1xuXHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJy0yMCc7XG5cdHRleHR1cmUxID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJ0ZXh0dXJlcy9saW5lcy5wbmdcIiApO1xuXG5cdGluaXRFZmZlY3RzKCk7XG5cdFxuXHRyZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gaW5pdFZpZGVvVGV4dHVyZSh2aWQpe1xuXHR2YXIgdGV4ID0gbmV3IFRIUkVFLlRleHR1cmUoIHZpZCApO1xuXHQvL25lZWRlZCBiZWNhdXNlIGNhbnQgZW5zdXJlIHRoYXQgdmlkZW8gaGFzIHBvd2VyIG9mIHR3byBkaW1lbnNpb25zXG5cdHRleC53cmFwUyA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC53cmFwVCA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHRleC5tYWdGaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHJldHVybiB0ZXg7XG59XG5cbmZ1bmN0aW9uIGluaXRFZmZlY3RzKCl7XG5cdGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG59XG5cblxuXHRcblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7XG5cdGNvbnNvbGUubG9nKFwibW91c2UgbW92ZVwiKTtcblx0bW91c2VYID0gZS5wYWdlWDtcblx0bW91c2VZID0gZS5wYWdlWTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHJlbmRlciApO1xuXHRmcmFtZUNvdW50Kys7XG5cdHRleHR1cmUxLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdGlmKHJlbmRlcmluZ0dpZil7XG5cdFx0aWYoZnJhbWVDb3VudCUxMD09MCl7XG5cdFx0XHRyZW5kZXJpbmdHaWYgPSBjdXJyZW50R2lmLmFkZEZyYW1lKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcblxuXHRcdFx0XHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cblx0XHRcdH1cblxuXG5cblxuXG5mdW5jdGlvbiBjaGVja0tleShlKXtcblx0IGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0IFxuXG5cdGlmKGUua2V5Q29kZSA9PSAgODMpe1xuXHRcdGVmZmVjdENoYWluLnJlbmRlcihtb3VzZVgvd2luZG93LmlubmVyV2lkdGgsIG1vdXNlWS93aW5kb3cuaW5uZXJIZWlnaHQsIGZyYW1lQ291bnQpO1xuXHRcdHZhciBpbWdEYXRhID0gcmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKTtcblx0XHR3aW5kb3cub3BlbihpbWdEYXRhKTtcblx0fSBlbHNlIGlmKGUua2V5Q29kZSA9PSAgNzEpe1xuXHRcdHJlbmRlcmluZ0dpZiA9IHRydWU7XG5cdFx0Y29uc29sZS5sb2cocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cdFx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cblx0XHRjdXJyZW50R2lmID0gbmV3IEdlbmVyYXRlR2lmKHJlbmRlcmVyLmRvbUVsZW1lbnQsIDUwLCBlZmZlY3RDaGFpbik7XG5cbiAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM3Jykge1xuICAgIFx0ZWZmZWN0SW5kZXgtLTtcbiAgICBcdCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3RydWN0aW9uc1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgXHRpZihlZmZlY3RJbmRleCA8IDApIGVmZmVjdEluZGV4ID0gZWZmZWN0cy5sZW5ndGgtMTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZS5rZXlDb2RlID09ICczOScpIHtcbiAgICBcdGVmZmVjdEluZGV4Kys7XG4gICAgXHQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnN0cnVjdGlvbnNcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIFx0aWYoZWZmZWN0SW5kZXggPj0gZWZmZWN0cy5sZW5ndGgpIGVmZmVjdEluZGV4ID0gMTtcbiAgICB9XG4gICAgZWZmZWN0Q2hhaW4gPSBFZmZlY3RDaGFpbihlZmZlY3RzW2VmZmVjdEluZGV4XSwgcmVuZGVyZXIsIHRleHR1cmUxKTtcbn1cblxuIiwiLy8gZ2V0VXNlck1lZGlhIGhlbHBlciBieSBASGVucmlrSm9yZXRlZ1xudmFyIGZ1bmMgPSAod2luZG93Lm5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uc3RyYWludHMsIGNiKSB7XG4gICAgdmFyIG9wdGlvbnMsIGVycm9yO1xuICAgIHZhciBoYXZlT3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDI7XG4gICAgdmFyIGRlZmF1bHRPcHRzID0ge3ZpZGVvOiB0cnVlLCBhdWRpbzogdHJ1ZX07XG5cbiAgICB2YXIgZGVuaWVkID0gJ1Blcm1pc3Npb25EZW5pZWRFcnJvcic7XG4gICAgdmFyIGFsdERlbmllZCA9ICdQRVJNSVNTSU9OX0RFTklFRCc7XG4gICAgdmFyIG5vdFNhdGlzZmllZCA9ICdDb25zdHJhaW50Tm90U2F0aXNmaWVkRXJyb3InO1xuXG4gICAgLy8gbWFrZSBjb25zdHJhaW50cyBvcHRpb25hbFxuICAgIGlmICghaGF2ZU9wdHMpIHtcbiAgICAgICAgY2IgPSBjb25zdHJhaW50cztcbiAgICAgICAgY29uc3RyYWludHMgPSBkZWZhdWx0T3B0cztcbiAgICB9XG5cbiAgICAvLyB0cmVhdCBsYWNrIG9mIGJyb3dzZXIgc3VwcG9ydCBsaWtlIGFuIGVycm9yXG4gICAgaWYgKCFmdW5jKSB7XG4gICAgICAgIC8vIHRocm93IHByb3BlciBlcnJvciBwZXIgc3BlY1xuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignTWVkaWFTdHJlYW1FcnJvcicpO1xuICAgICAgICBlcnJvci5uYW1lID0gJ05vdFN1cHBvcnRlZEVycm9yJztcblxuICAgICAgICAvLyBrZWVwIGFsbCBjYWxsYmFja3MgYXN5bmNcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNiKGVycm9yKTtcbiAgICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgLy8gbm9ybWFsaXplIGVycm9yIGhhbmRsaW5nIHdoZW4gbm8gbWVkaWEgdHlwZXMgYXJlIHJlcXVlc3RlZFxuICAgIGlmICghY29uc3RyYWludHMuYXVkaW8gJiYgIWNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdNZWRpYVN0cmVhbUVycm9yJyk7XG4gICAgICAgIGVycm9yLm5hbWUgPSAnTm9NZWRpYVJlcXVlc3RlZEVycm9yJztcblxuICAgICAgICAvLyBrZWVwIGFsbCBjYWxsYmFja3MgYXN5bmNcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNiKGVycm9yKTtcbiAgICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgaWYgKGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UudXNlRmlyZWZveEZha2VEZXZpY2UgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGNvbnN0cmFpbnRzLmZha2UgPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmMuY2FsbCh3aW5kb3cubmF2aWdhdG9yLCBjb25zdHJhaW50cywgZnVuY3Rpb24gKHN0cmVhbSkge1xuICAgICAgICBjYihudWxsLCBzdHJlYW0pO1xuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIGVycm9yO1xuICAgICAgICAvLyBjb2VyY2UgaW50byBhbiBlcnJvciBvYmplY3Qgc2luY2UgRkYgZ2l2ZXMgdXMgYSBzdHJpbmdcbiAgICAgICAgLy8gdGhlcmUgYXJlIG9ubHkgdHdvIHZhbGlkIG5hbWVzIGFjY29yZGluZyB0byB0aGUgc3BlY1xuICAgICAgICAvLyB3ZSBjb2VyY2UgYWxsIG5vbi1kZW5pZWQgdG8gXCJjb25zdHJhaW50IG5vdCBzYXRpc2ZpZWRcIi5cbiAgICAgICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignTWVkaWFTdHJlYW1FcnJvcicpO1xuICAgICAgICAgICAgaWYgKGVyciA9PT0gZGVuaWVkIHx8IGVyciA9PT0gYWx0RGVuaWVkKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IubmFtZSA9IGRlbmllZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3IubmFtZSA9IG5vdFNhdGlzZmllZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGdldCBhbiBlcnJvciBvYmplY3QgbWFrZSBzdXJlICcubmFtZScgcHJvcGVydHkgaXMgc2V0XG4gICAgICAgICAgICAvLyBhY2NvcmRpbmcgdG8gc3BlYzogaHR0cDovL2Rldi53My5vcmcvMjAxMS93ZWJydGMvZWRpdG9yL2dldHVzZXJtZWRpYS5odG1sI25hdmlnYXRvcnVzZXJtZWRpYWVycm9yLWFuZC1uYXZpZ2F0b3J1c2VybWVkaWFlcnJvcmNhbGxiYWNrXG4gICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIGlmICghZXJyb3IubmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgbGlrZWx5IGNocm9tZSB3aGljaFxuICAgICAgICAgICAgICAgIC8vIHNldHMgYSBwcm9wZXJ0eSBjYWxsZWQgXCJFUlJPUl9ERU5JRURcIiBvbiB0aGUgZXJyb3Igb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gaWYgc28gd2UgbWFrZSBzdXJlIHRvIHNldCBhIG5hbWVcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JbZGVuaWVkXSkge1xuICAgICAgICAgICAgICAgICAgICBlcnIubmFtZSA9IGRlbmllZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnIubmFtZSA9IG5vdFNhdGlzZmllZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYihlcnJvcik7XG4gICAgfSk7XG59O1xuIl19
