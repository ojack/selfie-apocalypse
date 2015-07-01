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
	document.body.appendChild(canvas);

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
	this.KaleidoEffect.uniforms[ 'offset' ].value = y*10;
	this.ColorEffect.uniforms[ 'hue' ].value = Math.cos(frame*0.01);
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
	var cols = Math.floor(x * 100);
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
var getUserMedia = require('getusermedia');
var EffectChain = require('./js/EffectChain.js');
var gifFrames = 0;
var effects = ["Ascii", "Checkerboard", "Kaleidoscope", "GlassWarp",  "Difference", "RgbDots", "Film"];
var effectIndex = 0;
var renderingGif = false;
var currentGif;
var frameCount = 0;
var renderer, effectChain, scene, camera, cube, mesh, texture1, texture2, composer, dotScreenEffect, rgbEffect, mouseX, mouseY, shader, remoteVid, localVid, blendEffect;
mouseX = mouseY = 1;
var getImageData = false;
var localVid = document.getElementById('videoObj');
//var remoteVid = document.getElementById('remoteVideo');
document.addEventListener("mousemove", onMouseMove);
document.onkeydown = checkKey;
window.addEventListener( 'resize', onWindowResize, false );

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
      initWebGL();
      //	texture1 = initVideoTexture(localVid);
      //	initEffects();
      /*	effectIndex++;
    	if(effectIndex >= effects.length) effectIndex = 0;*/
    }
});

//initWebGL();

function initWebGL(){
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	texture1 = initVideoTexture(localVid);
	//texture1  = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );
			//	texture1 .anisotropy = renderer.getMaxAnisotropy();
	initEffects();
	document.getElementById("front-page").style.visibility = "hidden";
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
		if(frameCount%10==0){
			currentGif.addFrame(renderer.domElement);
		}
	}
}

function onWindowResize() {

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

function checkKey(e){
	 e = e || window.event;
	if(e.keyCode ==  83){
		console.log("s pressed");
		//getImageData = true;
		effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
		var imgData = renderer.domElement.toDataURL();
		window.open(imgData);
		//console.log(imgData);
		
	
	} else if(e.keyCode ==  71){
		renderingGif = true;
		currentGif = new generateGif(renderer.domElement, 50);

  } else if (e.keyCode == '37') {
    	effectIndex--;
    	if(effectIndex < 0) effectIndex = effects.length-1;
       // left arrow
    }
    else if (e.keyCode == '39') {
    	effectIndex++;
    	if(effectIndex >= effects.length) effectIndex = 0;
       // right arrow
    }
    effectChain = EffectChain(effects[effectIndex], renderer, texture1);
}

var generateGif = function(element, numFrames){
	document.getElementById("recording").src = "textures/player_record.png";
	document.getElementById("recording").style.visibility = "visible";
	effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
	this.canvas = document.createElement( 'canvas' );
	this.canvas.width = renderer.domElement.width;
	this.canvas.height = renderer.domElement.height;
	this.context = this.canvas.getContext( '2d' );
	//this.addFrame(element);
	//document.body.appendChild(this.canvas);
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

generateGif.prototype.addFrame = function(element){
	this.frameIndex++;
	if(this.frameIndex >= this.numFrames){
		this.finish();
	} else {
	this.context.drawImage( element, 0, 0 );

		

	this.gif.addFrame(this.canvas, {copy: true, delay:200});
	this.frameIndex++;
	}
}

generateGif.prototype.finish = function(){
	document.getElementById("recording").src = "textures/ajax-loader.gif";
	renderingGif = false;
	this.gif.render();
}



},{"./js/EffectChain.js":2,"getusermedia":4}],4:[function(require,module,exports){
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0FzY2lpR3JhZGllbnQuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0VmZmVjdENoYWluLmpzIiwiL1VzZXJzL29qYWNrL2NvZGUvVklERU9fTUlYRVIvR0xJVENIX0NBTS9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2dldHVzZXJtZWRpYS9pbmRleC1icm93c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQSxJQUFJLFVBQVUsR0FBRywwRUFBMEU7S0FDdEYsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRSxnREFBZ0Q7QUFDbkUsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDOztBQUVoQixJQUFJLGFBQWEsR0FBRyxVQUFVLENBQUM7Q0FDOUIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5QyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUN4QyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUVuQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUMxQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9CLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxP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O0FBQ0E7O0NBRUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDeEQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0VBQ2pCO0FBQ0YsQ0FBQzs7QUFFRCxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7Q0FDekMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLEdBQUcsMEJBQTBCLENBQUM7Q0FDdEUsWUFBWSxHQUFHLEtBQUssQ0FBQztDQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ25CLENBQUM7Ozs7O0FDcktEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG52YXIgY2hhclN0cmluZyA9IFwiJEBCJTgmV00jKm9haGtiZHBxd21aTzBRTENKVVlYemN2dW54cmpmdC9cXFxcfCgpMXt9W10/LV8rfjw+aSFsSTs6LFxcXCJeYCcuIFwiXG4gICAgLnNwbGl0KFwiXCIpLnJldmVyc2UoKS5qb2luKFwiXCIpO1xudmFyIGhlaWdodCA9IDUxMjsgIC8vIGJpZ2dlciBoZXJlID0gc2hhcnBlciBlZGdlcyBvbiB0aGUgY2hhcmFjdGVyc1xudmFyIGJsb2NrID0gXCLilohcIjtcblxudmFyIEFzY2lpR3JhZGllbnQgPSBmdW5jdGlvbigpe1xuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdGNvbnRleHQuZm9udCA9IGhlaWdodCArICdweCBtb25vc3BhY2UnO1xuXHRtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCgnaScpO1xuXG5cdGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogOS8xMDtcblx0Y2FudmFzLndpZHRoID0gbWV0cmljcy53aWR0aCAqIGNoYXJTdHJpbmcubGVuZ3RoO1xuXHQvLyBjYW52YXMuaGVpZ2h0ID01MTI7XG5cdC8vIGNhbnZhcy53aWR0aCA9NTEyO1xuXG5cdGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0Y29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snO1xuXHRjb250ZXh0LmZpbGxSZWN0KDAsMCxjYW52YXMud2lkdGgsY2FudmFzLmhlaWdodCk7XG5cdGNvbnRleHQuZm9udCA9IGhlaWdodCArICdweCBtb25vc3BhY2UnO1xuXHRjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG5cblxuICAgIC8vIHlPZmZzZXQgaXMgc2NhbGVkIHNvIHRoYXQgaXQgaXMgMjQgcGl4ZWxzIGF0IGEgaGVpZ2h0IG9mIDEyOC5cbiAgICB2YXIgeU9mZnNldCA9IDI0ICogaGVpZ2h0IC8gMTI4O1xuXHRjb250ZXh0LmZpbGxUZXh0KGNoYXJTdHJpbmcsIDAsIGNhbnZhcy5oZWlnaHQgLSB5T2Zmc2V0KTtcblxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcblx0dGhpcy5udW1DaGFycyA9IGNoYXJTdHJpbmcubGVuZ3RoO1xuXHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBc2NpaUdyYWRpZW50O1xuIiwiLyogRmFjdG9yeSBwYXR0ZXJuIGZvciBjcmVhdGluZyBlZmZlY3RzXG5odHRwOi8vamF2YXNjcmlwdC5pbmZvL3R1dG9yaWFsL2ZhY3RvcnktY29uc3RydWN0b3ItcGF0dGVyblxuKi9cblxudmFyIGFzY2lpID0gcmVxdWlyZSgnLi9Bc2NpaUdyYWRpZW50LmpzJyk7XG52YXIgdDtcblxuZnVuY3Rpb24gRWZmZWN0Q2hhaW4odHlwZSwgcmVuZGVyZXIsIHRleHR1cmUpe1xuXHQgIC8vIFRocm93IGFuIGVycm9yIGlmIG5vIGNvbnN0cnVjdG9yIGZvciB0aGUgZ2l2ZW4gYXV0b21vYmlsZVxuICAgIFxuICAgIC8vcmV0dXJuIGV2YWwoXCJuZXcgXCIgKyB0eXBlK1wiKFwiK3JlbmRlcmVyK1wiKVwiKTtcblxuICAgIHZhciBuZXdFZmYgPSBldmFsKFwibmV3IFwiK3R5cGUrXCIocmVuZGVyZXIsIHRleHR1cmUpXCIpO1xuICAgIHJldHVybiBuZXdFZmY7XG59XG5cblxuXG52YXIgUmdiRG90cyA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0Y29uc29sZS5sb2coXCJyZ2IgY2FsbGVkXCIpO1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLmRvdFNjcmVlbkVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5Eb3RTY3JlZW5TaGFkZXIgKTtcblx0dGhpcy5kb3RTY3JlZW5FZmZlY3QudW5pZm9ybXNbICdzY2FsZScgXS52YWx1ZSA9IDAuODtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLmRvdFNjcmVlbkVmZmVjdCApO1xuXHR0aGlzLnJnYkVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5SR0JTaGlmdFNoYWRlciApO1xuXHR0aGlzLnJnYkVmZmVjdC51bmlmb3Jtc1sgJ2Ftb3VudCcgXS52YWx1ZSA9IDAuMDAxNTtcblx0dGhpcy5yZ2JFZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMucmdiRWZmZWN0KTtcbn1cblxuUmdiRG90cy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cdC8vdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0dGhpcy5kb3RTY3JlZW5FZmZlY3QudW5pZm9ybXNbICdzY2FsZScgXS52YWx1ZSA9IHggO1xuXHR0aGlzLnJnYkVmZmVjdC51bmlmb3Jtc1sgJ2Ftb3VudCcgXS52YWx1ZSA9IHkgO1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xuXG59XG5cbnZhciBLYWxlaWRvc2NvcGUgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5LYWxlaWRvU2hhZGVyKTtcblx0Ly90aGlzLkthbGVpZG9FZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuS2FsZWlkb0VmZmVjdCk7XG5cdHRoaXMuQ29sb3JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuQ29sb3JFZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ29sb3JFZmZlY3QpO1xufVxuXG5LYWxlaWRvc2NvcGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKXtcblx0dmFyIHNpZGVzID0gTWF0aC5jZWlsKHgqMTApO1xuXHR0aGlzLkthbGVpZG9FZmZlY3QudW5pZm9ybXNbICdzaWRlcycgXS52YWx1ZSA9IHgqNztcblx0dGhpcy5LYWxlaWRvRWZmZWN0LnVuaWZvcm1zWyAnb2Zmc2V0JyBdLnZhbHVlID0geSoxMDtcblx0dGhpcy5Db2xvckVmZmVjdC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IE1hdGguY29zKGZyYW1lKjAuMDEpO1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgRmlsbSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5GaWxtRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkZpbG1TaGFkZXIpO1xuXHQvL3RoaXMuRmlsbUVmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMucmdiRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLlJHQlNoaWZ0U2hhZGVyICk7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0gMC4wMDE1O1xuXHR0aGlzLnJnYkVmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5GaWxtRWZmZWN0KTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLnJnYkVmZmVjdCk7XG59XG5cbkZpbG0ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHQvLyBub2lzZSBlZmZlY3QgaW50ZW5zaXR5IHZhbHVlICgwID0gbm8gZWZmZWN0LCAxID0gZnVsbCBlZmZlY3QpXG5cdHRoaXMuRmlsbUVmZmVjdC51bmlmb3Jtc1snc0ludGVuc2l0eSddLnZhbHVlID0geTtcblx0dGhpcy5GaWxtRWZmZWN0LnVuaWZvcm1zWyduSW50ZW5zaXR5J10udmFsdWUgPSB5O1xuXHR0aGlzLkZpbG1FZmZlY3QudW5pZm9ybXNbJ3NDb3VudCddLnZhbHVlID0geSoxMDA7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0geCowLjg7XG5cdFx0Ly8gc2NhbmxpbmVzIGVmZmVjdCBpbnRlbnNpdHkgdmFsdWUgKDAgPSBubyBlZmZlY3QsIDEgPSBmdWxsIGVmZmVjdClcblx0XHRcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIERpZmZlcmVuY2UgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cblx0dGhpcy5EaWZmZXJlbmNlID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkRpZmZlcmVuY2VNaXJyb3JTaGFkZXIpO1xuXHRcblx0Ly90aGlzLkRpZmZlcmVuY2UucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHRcdHRoaXMuQ29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0dGhpcy5Db250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuMDtcblx0dGhpcy5Db250cmFzdC51bmlmb3Jtc1snYnJpZ2h0bmVzcyddLnZhbHVlID0gMC4yO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ29udHJhc3QgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkRpZmZlcmVuY2UpO1xuXHR0aGlzLkV4cGVyaW1lbnQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuRXhwZXJpbWVudC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5FeHBlcmltZW50ICk7XG5cdFxufVxuXG5EaWZmZXJlbmNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdzaWRlcycgXS52YWx1ZSA9IHgqMTA7XG5cdHRoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IHgqMi4wIC0gMS4wO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0geTtcblx0Ly90aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydicmlnaHRuZXNzJ10udmFsdWUgPSAgeSoyLjAgLSAxLjA7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgQXNjaWkgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHZhciBjaGFyYWN0ZXJzID0gbmV3IGFzY2lpKCk7XG5cdC8vIGNoYXJhY3RlcnMuY2FudmFzLndpZHRoID0gY2hhcmFjdGVycy5jYW52YXMuaGVpZ2h0ID0gMTI4O1xuXHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2hhcmFjdGVycy5jYW52YXMpO1xuXHQvL3QgPSBpbml0VGV4dHVyZShjaGFyYWN0ZXJzLmNhbnZhcyk7XG50PSBuZXcgVEhSRUUuVGV4dHVyZSggY2hhcmFjdGVycy5jYW52YXMpO1xuXHQvL2NvbnNvbGUubG9nKHQpO1xuXHR0Lm5lZWRzVXBkYXRlPXRydWU7XG5cdHZhciB3b29kVGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoICd0ZXh0dXJlcy9jcmF0ZS5naWYnICk7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0dGhpcy5jb250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuNztcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLmNvbnRyYXN0ICk7XG5cdHRoaXMuQXNjaWkgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQXNjaWlTaGFkZXIpO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWyd0RGlmZnVzZTInXS52YWx1ZSA9IHQ7XG5cdHRoaXMuQXNjaWkucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWydudW1DaGFycyddLnZhbHVlID0gY2hhcmFjdGVycy5udW1DaGFycztcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkFzY2lpKTtcbn1cblxuQXNjaWkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHR2YXIgY29scyA9IE1hdGguZmxvb3IoeCAqIDEwMCk7XG4vL1x0dGV4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0dGhpcy5Bc2NpaS51bmlmb3Jtc1sgJ3Jvd3MnIF0udmFsdWUgPSBjb2xzICogd2luZG93LmlubmVySGVpZ2h0IC8gd2luZG93LmlubmVyV2lkdGg7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbICdjb2xzJyBdLnZhbHVlID0gY29scztcblx0dGhpcy5jb250cmFzdC51bmlmb3JtcyBbJ2NvbnRyYXN0J10udmFsdWUgPSB5O1xuXHRcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIENoZWNrZXJib2FyZCA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5DaGVja2VyYm9hcmQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQ2hlY2tlcmJvYXJkU2hhZGVyKTtcblx0dGhpcy5DaGVja2VyYm9hcmQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ2hlY2tlcmJvYXJkKTtcbn1cblxuQ2hlY2tlcmJvYXJkLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0dGhpcy5DaGVja2VyYm9hcmQudW5pZm9ybXNbICd3aWR0aCcgXS52YWx1ZSA9IDIuMCAtIHgqMi4wO1xuXHR0aGlzLkNoZWNrZXJib2FyZC51bmlmb3Jtc1sgJ2hlaWdodCcgXS52YWx1ZSA9IDIuMCAtIHkqMi4wO1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxudmFyIEdsYXNzV2FycCA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5HbGFzc1dhcnAgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuR2xhc3NXYXJwU2hhZGVyKTtcblx0Ly90aGlzLkdsYXNzV2FycC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5HbGFzc1dhcnApO1xuXHR0aGlzLkV4cGVyaW1lbnQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdC8vdGhpcy5FeHBlcmltZW50LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWydzYXR1cmF0aW9uJ10udmFsdWUgPSAtLjU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5FeHBlcmltZW50ICk7XG5cdGNvbnRyYXN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkJyaWdodG5lc3NDb250cmFzdFNoYWRlcik7XG5cdGNvbnRyYXN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0Y29udHJhc3QudW5pZm9ybXNbJ2NvbnRyYXN0J10udmFsdWUgPSAwLjc7XG5cdGNvbnRyYXN0LnVuaWZvcm1zWydicmlnaHRuZXNzJ10udmFsdWUgPSAwLjI1O1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIGNvbnRyYXN0ICk7XG59XG5cbkdsYXNzV2FycC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSwgZnJhbWUpe1xuXHR0aGlzLkdsYXNzV2FycC51bmlmb3Jtc1sgJ21vdXNlWCcgXS52YWx1ZSA9IHg7XG5cdHRoaXMuR2xhc3NXYXJwLnVuaWZvcm1zWyAnbW91c2VZJyBdLnZhbHVlID0geTtcblx0dGhpcy5HbGFzc1dhcnAudW5pZm9ybXNbICdtYWcnIF0udmFsdWUgPSA0MCpNYXRoLnNpbihmcmFtZSowLjAwMDUpO1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cbnZhciBFeHBlcmltZW50ID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkV4cGVyaW1lbnQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuRXhwZXJpbWVudC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5FeHBlcmltZW50ICk7XG59XG5cbkV4cGVyaW1lbnQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKXtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0geCoyLjAgLSAxLjA7XG5cdHRoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ3NhdHVyYXRpb24nIF0udmFsdWUgPSB5KjEuMiAtIDAuMjtcblx0Ly90aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbICdtb3VzZVknIF0udmFsdWUgPSB5O1xuXHRcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdtaXhSYXRpbycgXS52YWx1ZSA9IHk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGluaXRUZXh0dXJlKGNhbnZhcyl7XG5cdHZhciB0ZXggPSBuZXcgVEhSRUUuVGV4dHVyZSggY2FudmFzICk7XG5cdC8vbmVlZGVkIGJlY2F1c2UgY2FudCBlbnN1cmUgdGhhdCB2aWRlbyBoYXMgcG93ZXIgb2YgdHdvIGRpbWVuc2lvbnNcblx0Ly90ZXgud3JhcFMgPSBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nO1xuLy9cdHRleC53cmFwVCA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHRleC5tYWdGaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHJldHVybiB0ZXg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWZmZWN0Q2hhaW47XG5cdCIsInZhciBnZXRVc2VyTWVkaWEgPSByZXF1aXJlKCdnZXR1c2VybWVkaWEnKTtcbnZhciBFZmZlY3RDaGFpbiA9IHJlcXVpcmUoJy4vanMvRWZmZWN0Q2hhaW4uanMnKTtcbnZhciBnaWZGcmFtZXMgPSAwO1xudmFyIGVmZmVjdHMgPSBbXCJBc2NpaVwiLCBcIkNoZWNrZXJib2FyZFwiLCBcIkthbGVpZG9zY29wZVwiLCBcIkdsYXNzV2FycFwiLCAgXCJEaWZmZXJlbmNlXCIsIFwiUmdiRG90c1wiLCBcIkZpbG1cIl07XG52YXIgZWZmZWN0SW5kZXggPSAwO1xudmFyIHJlbmRlcmluZ0dpZiA9IGZhbHNlO1xudmFyIGN1cnJlbnRHaWY7XG52YXIgZnJhbWVDb3VudCA9IDA7XG52YXIgcmVuZGVyZXIsIGVmZmVjdENoYWluLCBzY2VuZSwgY2FtZXJhLCBjdWJlLCBtZXNoLCB0ZXh0dXJlMSwgdGV4dHVyZTIsIGNvbXBvc2VyLCBkb3RTY3JlZW5FZmZlY3QsIHJnYkVmZmVjdCwgbW91c2VYLCBtb3VzZVksIHNoYWRlciwgcmVtb3RlVmlkLCBsb2NhbFZpZCwgYmxlbmRFZmZlY3Q7XG5tb3VzZVggPSBtb3VzZVkgPSAxO1xudmFyIGdldEltYWdlRGF0YSA9IGZhbHNlO1xudmFyIGxvY2FsVmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZGVvT2JqJyk7XG4vL3ZhciByZW1vdGVWaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVtb3RlVmlkZW8nKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgb25Nb3VzZU1vdmUpO1xuZG9jdW1lbnQub25rZXlkb3duID0gY2hlY2tLZXk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIG9uV2luZG93UmVzaXplLCBmYWxzZSApO1xuXG4vL3MgPSBuZXcgTG9jYWxTdHJlYW0obG9jYWxWaWQpO1xuZ2V0VXNlck1lZGlhKHt2aWRlbzogdHJ1ZSwgYXVkaW86IGZhbHNlfSwgZnVuY3Rpb24gKGVyciwgc3RyZWFtKSB7XG4gICAgLy8gaWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHVzZXIgbWVkaWFcbiAgICAvLyBvciB0aGUgdXNlciBzYXlzIFwibm9cIiB0aGUgZXJyb3IgZ2V0cyBwYXNzZWRcbiAgICAvLyBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgaWYgKGVycikge1xuICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgJyk7XG4gICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9IGVsc2Uge1xuICAgIFx0aWYgKHdpbmRvdy5VUkwpIFxuXHR7ICAgbG9jYWxWaWQuc3JjID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTsgICB9IFxuICAgICAgIGNvbnNvbGUubG9nKCdnb3QgYSBzdHJlYW0nLCBzdHJlYW0pOyAgXG4gICAgICBpbml0V2ViR0woKTtcbiAgICAgIC8vXHR0ZXh0dXJlMSA9IGluaXRWaWRlb1RleHR1cmUobG9jYWxWaWQpO1xuICAgICAgLy9cdGluaXRFZmZlY3RzKCk7XG4gICAgICAvKlx0ZWZmZWN0SW5kZXgrKztcbiAgICBcdGlmKGVmZmVjdEluZGV4ID49IGVmZmVjdHMubGVuZ3RoKSBlZmZlY3RJbmRleCA9IDA7Ki9cbiAgICB9XG59KTtcblxuLy9pbml0V2ViR0woKTtcblxuZnVuY3Rpb24gaW5pdFdlYkdMKCl7XG5cdHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcblx0cmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyggd2luZG93LmRldmljZVBpeGVsUmF0aW8gKTtcblx0cmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCByZW5kZXJlci5kb21FbGVtZW50ICk7XG5cdHRleHR1cmUxID0gaW5pdFZpZGVvVGV4dHVyZShsb2NhbFZpZCk7XG5cdC8vdGV4dHVyZTEgID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggJ3RleHR1cmVzL2NyYXRlLmdpZicgKTtcblx0XHRcdC8vXHR0ZXh0dXJlMSAuYW5pc290cm9weSA9IHJlbmRlcmVyLmdldE1heEFuaXNvdHJvcHkoKTtcblx0aW5pdEVmZmVjdHMoKTtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcm9udC1wYWdlXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXHRyZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gaW5pdFZpZGVvVGV4dHVyZSh2aWQpe1xuXHR2YXIgdGV4ID0gbmV3IFRIUkVFLlRleHR1cmUoIHZpZCApO1xuXHQvL25lZWRlZCBiZWNhdXNlIGNhbnQgZW5zdXJlIHRoYXQgdmlkZW8gaGFzIHBvd2VyIG9mIHR3byBkaW1lbnNpb25zXG5cdHRleC53cmFwUyA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC53cmFwVCA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG5cdHRleC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHRleC5tYWdGaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG5cdHJldHVybiB0ZXg7XG59XG5cbmZ1bmN0aW9uIGluaXRFZmZlY3RzKCl7XG5cdGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG59XG5cblxuXHRcblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7XG5cdG1vdXNlWCA9IGUucGFnZVg7XG5cdG1vdXNlWSA9IGUucGFnZVk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCByZW5kZXIgKTtcblx0ZnJhbWVDb3VudCsrO1xuXHR0ZXh0dXJlMS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdGVmZmVjdENoYWluLnJlbmRlcihtb3VzZVgvd2luZG93LmlubmVyV2lkdGgsIG1vdXNlWS93aW5kb3cuaW5uZXJIZWlnaHQsIGZyYW1lQ291bnQpO1xuXHRpZihyZW5kZXJpbmdHaWYpe1xuXHRcdGlmKGZyYW1lQ291bnQlMTA9PTApe1xuXHRcdFx0Y3VycmVudEdpZi5hZGRGcmFtZShyZW5kZXJlci5kb21FbGVtZW50KTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gb25XaW5kb3dSZXNpemUoKSB7XG5cblx0XHRcdFx0cmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXG5cdFx0XHR9XG5cbmZ1bmN0aW9uIGNoZWNrS2V5KGUpe1xuXHQgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRpZihlLmtleUNvZGUgPT0gIDgzKXtcblx0XHRjb25zb2xlLmxvZyhcInMgcHJlc3NlZFwiKTtcblx0XHQvL2dldEltYWdlRGF0YSA9IHRydWU7XG5cdFx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdFx0dmFyIGltZ0RhdGEgPSByZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgpO1xuXHRcdHdpbmRvdy5vcGVuKGltZ0RhdGEpO1xuXHRcdC8vY29uc29sZS5sb2coaW1nRGF0YSk7XG5cdFx0XG5cdFxuXHR9IGVsc2UgaWYoZS5rZXlDb2RlID09ICA3MSl7XG5cdFx0cmVuZGVyaW5nR2lmID0gdHJ1ZTtcblx0XHRjdXJyZW50R2lmID0gbmV3IGdlbmVyYXRlR2lmKHJlbmRlcmVyLmRvbUVsZW1lbnQsIDUwKTtcblxuICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzcnKSB7XG4gICAgXHRlZmZlY3RJbmRleC0tO1xuICAgIFx0aWYoZWZmZWN0SW5kZXggPCAwKSBlZmZlY3RJbmRleCA9IGVmZmVjdHMubGVuZ3RoLTE7XG4gICAgICAgLy8gbGVmdCBhcnJvd1xuICAgIH1cbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM5Jykge1xuICAgIFx0ZWZmZWN0SW5kZXgrKztcbiAgICBcdGlmKGVmZmVjdEluZGV4ID49IGVmZmVjdHMubGVuZ3RoKSBlZmZlY3RJbmRleCA9IDA7XG4gICAgICAgLy8gcmlnaHQgYXJyb3dcbiAgICB9XG4gICAgZWZmZWN0Q2hhaW4gPSBFZmZlY3RDaGFpbihlZmZlY3RzW2VmZmVjdEluZGV4XSwgcmVuZGVyZXIsIHRleHR1cmUxKTtcbn1cblxudmFyIGdlbmVyYXRlR2lmID0gZnVuY3Rpb24oZWxlbWVudCwgbnVtRnJhbWVzKXtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3JjID0gXCJ0ZXh0dXJlcy9wbGF5ZXJfcmVjb3JkLnBuZ1wiO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG5cdGVmZmVjdENoYWluLnJlbmRlcihtb3VzZVgvd2luZG93LmlubmVyV2lkdGgsIG1vdXNlWS93aW5kb3cuaW5uZXJIZWlnaHQsIGZyYW1lQ291bnQpO1xuXHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdHRoaXMuY2FudmFzLndpZHRoID0gcmVuZGVyZXIuZG9tRWxlbWVudC53aWR0aDtcblx0dGhpcy5jYW52YXMuaGVpZ2h0ID0gcmVuZGVyZXIuZG9tRWxlbWVudC5oZWlnaHQ7XG5cdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblx0Ly90aGlzLmFkZEZyYW1lKGVsZW1lbnQpO1xuXHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuXHR0aGlzLm51bUZyYW1lcyA9IG51bUZyYW1lcztcblx0dGhpcy5mcmFtZUluZGV4ID0gMDtcblx0dGhpcy5naWYgPSBuZXcgR0lGKHtcbiAgd29ya2VyczogMixcbiAgcXVhbGl0eTogMTAwXG59KTtcblx0XG5cblxudGhpcy5naWYub24oJ2ZpbmlzaGVkJywgZnVuY3Rpb24oYmxvYikge1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgd2luZG93Lm9wZW4oVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG59KTtcblxuXG59XG5cbmdlbmVyYXRlR2lmLnByb3RvdHlwZS5hZGRGcmFtZSA9IGZ1bmN0aW9uKGVsZW1lbnQpe1xuXHR0aGlzLmZyYW1lSW5kZXgrKztcblx0aWYodGhpcy5mcmFtZUluZGV4ID49IHRoaXMubnVtRnJhbWVzKXtcblx0XHR0aGlzLmZpbmlzaCgpO1xuXHR9IGVsc2Uge1xuXHR0aGlzLmNvbnRleHQuZHJhd0ltYWdlKCBlbGVtZW50LCAwLCAwICk7XG5cblx0XHRcblxuXHR0aGlzLmdpZi5hZGRGcmFtZSh0aGlzLmNhbnZhcywge2NvcHk6IHRydWUsIGRlbGF5OjIwMH0pO1xuXHR0aGlzLmZyYW1lSW5kZXgrKztcblx0fVxufVxuXG5nZW5lcmF0ZUdpZi5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24oKXtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3JjID0gXCJ0ZXh0dXJlcy9hamF4LWxvYWRlci5naWZcIjtcblx0cmVuZGVyaW5nR2lmID0gZmFsc2U7XG5cdHRoaXMuZ2lmLnJlbmRlcigpO1xufVxuXG4iLCIvLyBnZXRVc2VyTWVkaWEgaGVscGVyIGJ5IEBIZW5yaWtKb3JldGVnXG52YXIgZnVuYyA9ICh3aW5kb3cubmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25zdHJhaW50cywgY2IpIHtcbiAgICB2YXIgb3B0aW9ucywgZXJyb3I7XG4gICAgdmFyIGhhdmVPcHRzID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMjtcbiAgICB2YXIgZGVmYXVsdE9wdHMgPSB7dmlkZW86IHRydWUsIGF1ZGlvOiB0cnVlfTtcblxuICAgIHZhciBkZW5pZWQgPSAnUGVybWlzc2lvbkRlbmllZEVycm9yJztcbiAgICB2YXIgYWx0RGVuaWVkID0gJ1BFUk1JU1NJT05fREVOSUVEJztcbiAgICB2YXIgbm90U2F0aXNmaWVkID0gJ0NvbnN0cmFpbnROb3RTYXRpc2ZpZWRFcnJvcic7XG5cbiAgICAvLyBtYWtlIGNvbnN0cmFpbnRzIG9wdGlvbmFsXG4gICAgaWYgKCFoYXZlT3B0cykge1xuICAgICAgICBjYiA9IGNvbnN0cmFpbnRzO1xuICAgICAgICBjb25zdHJhaW50cyA9IGRlZmF1bHRPcHRzO1xuICAgIH1cblxuICAgIC8vIHRyZWF0IGxhY2sgb2YgYnJvd3NlciBzdXBwb3J0IGxpa2UgYW4gZXJyb3JcbiAgICBpZiAoIWZ1bmMpIHtcbiAgICAgICAgLy8gdGhyb3cgcHJvcGVyIGVycm9yIHBlciBzcGVjXG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdNZWRpYVN0cmVhbUVycm9yJyk7XG4gICAgICAgIGVycm9yLm5hbWUgPSAnTm90U3VwcG9ydGVkRXJyb3InO1xuXG4gICAgICAgIC8vIGtlZXAgYWxsIGNhbGxiYWNrcyBhc3luY1xuICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2IoZXJyb3IpO1xuICAgICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICAvLyBub3JtYWxpemUgZXJyb3IgaGFuZGxpbmcgd2hlbiBubyBtZWRpYSB0eXBlcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKCFjb25zdHJhaW50cy5hdWRpbyAmJiAhY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ01lZGlhU3RyZWFtRXJyb3InKTtcbiAgICAgICAgZXJyb3IubmFtZSA9ICdOb01lZGlhUmVxdWVzdGVkRXJyb3InO1xuXG4gICAgICAgIC8vIGtlZXAgYWxsIGNhbGxiYWNrcyBhc3luY1xuICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2IoZXJyb3IpO1xuICAgICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS51c2VGaXJlZm94RmFrZURldmljZSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgY29uc3RyYWludHMuZmFrZSA9IHRydWU7XG4gICAgfVxuXG4gICAgZnVuYy5jYWxsKHdpbmRvdy5uYXZpZ2F0b3IsIGNvbnN0cmFpbnRzLCBmdW5jdGlvbiAoc3RyZWFtKSB7XG4gICAgICAgIGNiKG51bGwsIHN0cmVhbSk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICB2YXIgZXJyb3I7XG4gICAgICAgIC8vIGNvZXJjZSBpbnRvIGFuIGVycm9yIG9iamVjdCBzaW5jZSBGRiBnaXZlcyB1cyBhIHN0cmluZ1xuICAgICAgICAvLyB0aGVyZSBhcmUgb25seSB0d28gdmFsaWQgbmFtZXMgYWNjb3JkaW5nIHRvIHRoZSBzcGVjXG4gICAgICAgIC8vIHdlIGNvZXJjZSBhbGwgbm9uLWRlbmllZCB0byBcImNvbnN0cmFpbnQgbm90IHNhdGlzZmllZFwiLlxuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdNZWRpYVN0cmVhbUVycm9yJyk7XG4gICAgICAgICAgICBpZiAoZXJyID09PSBkZW5pZWQgfHwgZXJyID09PSBhbHREZW5pZWQpIHtcbiAgICAgICAgICAgICAgICBlcnJvci5uYW1lID0gZGVuaWVkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvci5uYW1lID0gbm90U2F0aXNmaWVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgd2UgZ2V0IGFuIGVycm9yIG9iamVjdCBtYWtlIHN1cmUgJy5uYW1lJyBwcm9wZXJ0eSBpcyBzZXRcbiAgICAgICAgICAgIC8vIGFjY29yZGluZyB0byBzcGVjOiBodHRwOi8vZGV2LnczLm9yZy8yMDExL3dlYnJ0Yy9lZGl0b3IvZ2V0dXNlcm1lZGlhLmh0bWwjbmF2aWdhdG9ydXNlcm1lZGlhZXJyb3ItYW5kLW5hdmlnYXRvcnVzZXJtZWRpYWVycm9yY2FsbGJhY2tcbiAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgaWYgKCFlcnJvci5uYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBsaWtlbHkgY2hyb21lIHdoaWNoXG4gICAgICAgICAgICAgICAgLy8gc2V0cyBhIHByb3BlcnR5IGNhbGxlZCBcIkVSUk9SX0RFTklFRFwiIG9uIHRoZSBlcnJvciBvYmplY3RcbiAgICAgICAgICAgICAgICAvLyBpZiBzbyB3ZSBtYWtlIHN1cmUgdG8gc2V0IGEgbmFtZVxuICAgICAgICAgICAgICAgIGlmIChlcnJvcltkZW5pZWRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGVyci5uYW1lID0gZGVuaWVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVyci5uYW1lID0gbm90U2F0aXNmaWVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNiKGVycm9yKTtcbiAgICB9KTtcbn07XG4iXX0=
