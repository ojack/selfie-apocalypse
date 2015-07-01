(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var charString = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
    .split("").reverse().join("");
var height = 128;
var block = "█";

var AsciiGradient = function(){
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = height + 'px monospace';
	metrics = context.measureText('i');

	canvas = document.createElement('canvas');
	canvas.height = height * 7/8;
	canvas.width = metrics.width * charString.length;
	// canvas.height =512;
	// canvas.width =512;

	context = canvas.getContext('2d');
	context.fillStyle = 'black';
	context.fillRect(0,0,canvas.width,canvas.height);
	context.font = height + 'px monospace';
	context.fillStyle = 'white';


	context.fillText(charString, 0, canvas.height - 20);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0FzY2lpR3JhZGllbnQuanMiLCIvVXNlcnMvb2phY2svY29kZS9WSURFT19NSVhFUi9HTElUQ0hfQ0FNL2pzL0VmZmVjdENoYWluLmpzIiwiL1VzZXJzL29qYWNrL2NvZGUvVklERU9fTUlYRVIvR0xJVENIX0NBTS9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2dldHVzZXJtZWRpYS9pbmRleC1icm93c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQSxJQUFJLFVBQVUsR0FBRywwRUFBMEU7S0FDdEYsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDakIsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDOztBQUVoQixJQUFJLGFBQWEsR0FBRyxVQUFVLENBQUM7Q0FDOUIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5QyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUN4QyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUVuQyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUMxQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FB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QyxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0NBQ3RFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7Q0FDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0NBQzlELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztDQUN2QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztDQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7Q0FDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7Q0FDNUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLENBQUM7O0FBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEMsQ0FBQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7Q0FFL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7Q0FDcEYsSUFBSSxDQUFDLEtB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QUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQ3hELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztFQUNqQjtBQUNGLENBQUM7O0FBRUQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO0NBQ3pDLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxHQUFHLDBCQUEwQixDQUFDO0NBQ3RFLFlBQVksR0FBRyxLQUFLLENBQUM7Q0FDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNuQixDQUFDOzs7OztBQ3JLRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxudmFyIGNoYXJTdHJpbmcgPSBcIiRAQiU4JldNIypvYWhrYmRwcXdtWk8wUUxDSlVZWHpjdnVueHJqZnQvXFxcXHwoKTF7fVtdPy1fK348PmkhbEk7OixcXFwiXmAnLiBcIlxuICAgIC5zcGxpdChcIlwiKS5yZXZlcnNlKCkuam9pbihcIlwiKTtcbnZhciBoZWlnaHQgPSAxMjg7XG52YXIgYmxvY2sgPSBcIuKWiFwiO1xuXG52YXIgQXNjaWlHcmFkaWVudCA9IGZ1bmN0aW9uKCl7XG5cdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0dmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0Y29udGV4dC5mb250ID0gaGVpZ2h0ICsgJ3B4IG1vbm9zcGFjZSc7XG5cdG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KCdpJyk7XG5cblx0Y2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiA3Lzg7XG5cdGNhbnZhcy53aWR0aCA9IG1ldHJpY3Mud2lkdGggKiBjaGFyU3RyaW5nLmxlbmd0aDtcblx0Ly8gY2FudmFzLmhlaWdodCA9NTEyO1xuXHQvLyBjYW52YXMud2lkdGggPTUxMjtcblxuXHRjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdGNvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcblx0Y29udGV4dC5maWxsUmVjdCgwLDAsY2FudmFzLndpZHRoLGNhbnZhcy5oZWlnaHQpO1xuXHRjb250ZXh0LmZvbnQgPSBoZWlnaHQgKyAncHggbW9ub3NwYWNlJztcblx0Y29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG5cblx0Y29udGV4dC5maWxsVGV4dChjaGFyU3RyaW5nLCAwLCBjYW52YXMuaGVpZ2h0IC0gMjApO1xuXG5cdHRoaXMuY2FudmFzID0gY2FudmFzO1xuXHR0aGlzLm51bUNoYXJzID0gY2hhclN0cmluZy5sZW5ndGg7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFzY2lpR3JhZGllbnQ7XG4iLCIvKiBGYWN0b3J5IHBhdHRlcm4gZm9yIGNyZWF0aW5nIGVmZmVjdHNcbmh0dHA6Ly9qYXZhc2NyaXB0LmluZm8vdHV0b3JpYWwvZmFjdG9yeS1jb25zdHJ1Y3Rvci1wYXR0ZXJuXG4qL1xuXG52YXIgYXNjaWkgPSByZXF1aXJlKCcuL0FzY2lpR3JhZGllbnQuanMnKTtcbnZhciB0O1xuXG5mdW5jdGlvbiBFZmZlY3RDaGFpbih0eXBlLCByZW5kZXJlciwgdGV4dHVyZSl7XG5cdCAgLy8gVGhyb3cgYW4gZXJyb3IgaWYgbm8gY29uc3RydWN0b3IgZm9yIHRoZSBnaXZlbiBhdXRvbW9iaWxlXG4gICAgXG4gICAgLy9yZXR1cm4gZXZhbChcIm5ldyBcIiArIHR5cGUrXCIoXCIrcmVuZGVyZXIrXCIpXCIpO1xuXG4gICAgdmFyIG5ld0VmZiA9IGV2YWwoXCJuZXcgXCIrdHlwZStcIihyZW5kZXJlciwgdGV4dHVyZSlcIik7XG4gICAgcmV0dXJuIG5ld0VmZjtcbn1cblxuXG5cbnZhciBSZ2JEb3RzID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHRjb25zb2xlLmxvZyhcInJnYiBjYWxsZWRcIik7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuZG90U2NyZWVuRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkRvdFNjcmVlblNoYWRlciApO1xuXHR0aGlzLmRvdFNjcmVlbkVmZmVjdC51bmlmb3Jtc1sgJ3NjYWxlJyBdLnZhbHVlID0gMC44O1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuZG90U2NyZWVuRWZmZWN0ICk7XG5cdHRoaXMucmdiRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLlJHQlNoaWZ0U2hhZGVyICk7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0gMC4wMDE1O1xuXHR0aGlzLnJnYkVmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5yZ2JFZmZlY3QpO1xufVxuXG5SZ2JEb3RzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0Ly90aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHR0aGlzLmRvdFNjcmVlbkVmZmVjdC51bmlmb3Jtc1sgJ3NjYWxlJyBdLnZhbHVlID0geCA7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0geSA7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG5cbn1cblxudmFyIEthbGVpZG9zY29wZSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5LYWxlaWRvRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkthbGVpZG9TaGFkZXIpO1xuXHQvL3RoaXMuS2FsZWlkb0VmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5LYWxlaWRvRWZmZWN0KTtcblx0dGhpcy5Db2xvckVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5Db2xvckVmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5Db2xvckVmZmVjdCk7XG59XG5cbkthbGVpZG9zY29wZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSwgZnJhbWUpe1xuXHR2YXIgc2lkZXMgPSBNYXRoLmNlaWwoeCoxMCk7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdC51bmlmb3Jtc1sgJ3NpZGVzJyBdLnZhbHVlID0geCo3O1xuXHR0aGlzLkthbGVpZG9FZmZlY3QudW5pZm9ybXNbICdvZmZzZXQnIF0udmFsdWUgPSB5KjEwO1xuXHR0aGlzLkNvbG9yRWZmZWN0LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0gTWF0aC5jb3MoZnJhbWUqMC4wMSk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbnZhciBGaWxtID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkZpbG1FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuRmlsbVNoYWRlcik7XG5cdC8vdGhpcy5GaWxtRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5yZ2JFZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuUkdCU2hpZnRTaGFkZXIgKTtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSAwLjAwMTU7XG5cdHRoaXMucmdiRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkZpbG1FZmZlY3QpO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMucmdiRWZmZWN0KTtcbn1cblxuRmlsbS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cdC8vIG5vaXNlIGVmZmVjdCBpbnRlbnNpdHkgdmFsdWUgKDAgPSBubyBlZmZlY3QsIDEgPSBmdWxsIGVmZmVjdClcblx0dGhpcy5GaWxtRWZmZWN0LnVuaWZvcm1zWydzSW50ZW5zaXR5J10udmFsdWUgPSB5O1xuXHR0aGlzLkZpbG1FZmZlY3QudW5pZm9ybXNbJ25JbnRlbnNpdHknXS52YWx1ZSA9IHk7XG5cdHRoaXMuRmlsbUVmZmVjdC51bmlmb3Jtc1snc0NvdW50J10udmFsdWUgPSB5KjEwMDtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSB4KjAuODtcblx0XHQvLyBzY2FubGluZXMgZWZmZWN0IGludGVuc2l0eSB2YWx1ZSAoMCA9IG5vIGVmZmVjdCwgMSA9IGZ1bGwgZWZmZWN0KVxuXHRcdFxuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgRGlmZmVyZW5jZSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblxuXHR0aGlzLkRpZmZlcmVuY2UgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuRGlmZmVyZW5jZU1pcnJvclNoYWRlcik7XG5cdFxuXHQvL3RoaXMuRGlmZmVyZW5jZS5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdFx0dGhpcy5Db250cmFzdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5CcmlnaHRuZXNzQ29udHJhc3RTaGFkZXIpO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0gMC4wO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydicmlnaHRuZXNzJ10udmFsdWUgPSAwLjI7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5Db250cmFzdCApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuRGlmZmVyZW5jZSk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5FeHBlcmltZW50LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcblx0XG59XG5cbkRpZmZlcmVuY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ3NpZGVzJyBdLnZhbHVlID0geCoxMDtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0geCoyLjAgLSAxLjA7XG5cdHRoaXMuQ29udHJhc3QudW5pZm9ybXNbJ2NvbnRyYXN0J10udmFsdWUgPSB5O1xuXHQvL3RoaXMuQ29udHJhc3QudW5pZm9ybXNbJ2JyaWdodG5lc3MnXS52YWx1ZSA9ICB5KjIuMCAtIDEuMDtcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdtaXhSYXRpbycgXS52YWx1ZSA9IHk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbnZhciBBc2NpaSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dmFyIGNoYXJhY3RlcnMgPSBuZXcgYXNjaWkoKTtcblx0Ly8gY2hhcmFjdGVycy5jYW52YXMud2lkdGggPSBjaGFyYWN0ZXJzLmNhbnZhcy5oZWlnaHQgPSAxMjg7XG5cdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjaGFyYWN0ZXJzLmNhbnZhcyk7XG5cdC8vdCA9IGluaXRUZXh0dXJlKGNoYXJhY3RlcnMuY2FudmFzKTtcbnQ9IG5ldyBUSFJFRS5UZXh0dXJlKCBjaGFyYWN0ZXJzLmNhbnZhcyk7XG5cdC8vY29uc29sZS5sb2codCk7XG5cdHQubmVlZHNVcGRhdGU9dHJ1ZTtcblx0dmFyIHdvb2RUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggJ3RleHR1cmVzL2NyYXRlLmdpZicgKTtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb250cmFzdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5CcmlnaHRuZXNzQ29udHJhc3RTaGFkZXIpO1xuXHR0aGlzLmNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0gMC43O1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuY29udHJhc3QgKTtcblx0dGhpcy5Bc2NpaSA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5Bc2NpaVNoYWRlcik7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbJ3REaWZmdXNlMiddLnZhbHVlID0gdDtcblx0dGhpcy5Bc2NpaS5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbJ251bUNoYXJzJ10udmFsdWUgPSBjaGFyYWN0ZXJzLm51bUNoYXJzO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQXNjaWkpO1xufVxuXG5Bc2NpaS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cdHZhciBjb2xzID0gTWF0aC5mbG9vcih4ICogMTAwKTtcbi8vXHR0ZXgubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWyAncm93cycgXS52YWx1ZSA9IGNvbHMgKiB3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aDtcblx0dGhpcy5Bc2NpaS51bmlmb3Jtc1sgJ2NvbHMnIF0udmFsdWUgPSBjb2xzO1xuXHR0aGlzLmNvbnRyYXN0LnVuaWZvcm1zIFsnY29udHJhc3QnXS52YWx1ZSA9IHk7XG5cdFxuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgQ2hlY2tlcmJvYXJkID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkNoZWNrZXJib2FyZCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5DaGVja2VyYm9hcmRTaGFkZXIpO1xuXHR0aGlzLkNoZWNrZXJib2FyZC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5DaGVja2VyYm9hcmQpO1xufVxuXG5DaGVja2VyYm9hcmQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHR0aGlzLkNoZWNrZXJib2FyZC51bmlmb3Jtc1sgJ3dpZHRoJyBdLnZhbHVlID0gMi4wIC0geCoyLjA7XG5cdHRoaXMuQ2hlY2tlcmJvYXJkLnVuaWZvcm1zWyAnaGVpZ2h0JyBdLnZhbHVlID0gMi4wIC0geSoyLjA7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgR2xhc3NXYXJwID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkdsYXNzV2FycCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5HbGFzc1dhcnBTaGFkZXIpO1xuXHQvL3RoaXMuR2xhc3NXYXJwLnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkdsYXNzV2FycCk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0Ly90aGlzLkV4cGVyaW1lbnQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbJ3NhdHVyYXRpb24nXS52YWx1ZSA9IC0uNTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcblx0Y29udHJhc3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuQnJpZ2h0bmVzc0NvbnRyYXN0U2hhZGVyKTtcblx0Y29udHJhc3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHRjb250cmFzdC51bmlmb3Jtc1snY29udHJhc3QnXS52YWx1ZSA9IDAuNztcblx0Y29udHJhc3QudW5pZm9ybXNbJ2JyaWdodG5lc3MnXS52YWx1ZSA9IDAuMjU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggY29udHJhc3QgKTtcbn1cblxuR2xhc3NXYXJwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHRoaXMuR2xhc3NXYXJwLnVuaWZvcm1zWyAnbW91c2VYJyBdLnZhbHVlID0geDtcblx0dGhpcy5HbGFzc1dhcnAudW5pZm9ybXNbICdtb3VzZVknIF0udmFsdWUgPSB5O1xuXHR0aGlzLkdsYXNzV2FycC51bmlmb3Jtc1sgJ21hZycgXS52YWx1ZSA9IDQwKk1hdGguc2luKGZyYW1lKjAuMDAwNSk7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxudmFyIEV4cGVyaW1lbnQgPSBmdW5jdGlvbihyZW5kZXJlciwgdGV4dHVyZSl7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5FeHBlcmltZW50LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcbn1cblxuRXhwZXJpbWVudC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSwgZnJhbWUpe1xuXHR0aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbICdodWUnIF0udmFsdWUgPSB4KjIuMCAtIDEuMDtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnc2F0dXJhdGlvbicgXS52YWx1ZSA9IHkqMS4yIC0gMC4yO1xuXHQvL3RoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ21vdXNlWScgXS52YWx1ZSA9IHk7XG5cdFxuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ21peFJhdGlvJyBdLnZhbHVlID0geTtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gaW5pdFRleHR1cmUoY2FudmFzKXtcblx0dmFyIHRleCA9IG5ldyBUSFJFRS5UZXh0dXJlKCBjYW52YXMgKTtcblx0Ly9uZWVkZWQgYmVjYXVzZSBjYW50IGVuc3VyZSB0aGF0IHZpZGVvIGhhcyBwb3dlciBvZiB0d28gZGltZW5zaW9uc1xuXHQvL3RleC53cmFwUyA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG4vL1x0dGV4LndyYXBUID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0dGV4Lm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0dGV4Lm1hZ0ZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0cmV0dXJuIHRleDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZmZlY3RDaGFpbjtcblx0IiwidmFyIGdldFVzZXJNZWRpYSA9IHJlcXVpcmUoJ2dldHVzZXJtZWRpYScpO1xudmFyIEVmZmVjdENoYWluID0gcmVxdWlyZSgnLi9qcy9FZmZlY3RDaGFpbi5qcycpO1xudmFyIGdpZkZyYW1lcyA9IDA7XG52YXIgZWZmZWN0cyA9IFtcIkFzY2lpXCIsIFwiQ2hlY2tlcmJvYXJkXCIsIFwiS2FsZWlkb3Njb3BlXCIsIFwiR2xhc3NXYXJwXCIsICBcIkRpZmZlcmVuY2VcIiwgXCJSZ2JEb3RzXCIsIFwiRmlsbVwiXTtcbnZhciBlZmZlY3RJbmRleCA9IDA7XG52YXIgcmVuZGVyaW5nR2lmID0gZmFsc2U7XG52YXIgY3VycmVudEdpZjtcbnZhciBmcmFtZUNvdW50ID0gMDtcbnZhciByZW5kZXJlciwgZWZmZWN0Q2hhaW4sIHNjZW5lLCBjYW1lcmEsIGN1YmUsIG1lc2gsIHRleHR1cmUxLCB0ZXh0dXJlMiwgY29tcG9zZXIsIGRvdFNjcmVlbkVmZmVjdCwgcmdiRWZmZWN0LCBtb3VzZVgsIG1vdXNlWSwgc2hhZGVyLCByZW1vdGVWaWQsIGxvY2FsVmlkLCBibGVuZEVmZmVjdDtcbm1vdXNlWCA9IG1vdXNlWSA9IDE7XG52YXIgZ2V0SW1hZ2VEYXRhID0gZmFsc2U7XG52YXIgbG9jYWxWaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlkZW9PYmonKTtcbi8vdmFyIHJlbW90ZVZpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW1vdGVWaWRlbycpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBvbk1vdXNlTW92ZSk7XG5kb2N1bWVudC5vbmtleWRvd24gPSBjaGVja0tleTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgb25XaW5kb3dSZXNpemUsIGZhbHNlICk7XG5cbi8vcyA9IG5ldyBMb2NhbFN0cmVhbShsb2NhbFZpZCk7XG5nZXRVc2VyTWVkaWEoe3ZpZGVvOiB0cnVlLCBhdWRpbzogZmFsc2V9LCBmdW5jdGlvbiAoZXJyLCBzdHJlYW0pIHtcbiAgICAvLyBpZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdXNlciBtZWRpYVxuICAgIC8vIG9yIHRoZSB1c2VyIHNheXMgXCJub1wiIHRoZSBlcnJvciBnZXRzIHBhc3NlZFxuICAgIC8vIGFzIHRoZSBmaXJzdCBhcmd1bWVudC5cbiAgICBpZiAoZXJyKSB7XG4gICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCAnKTtcbiAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgXHRpZiAod2luZG93LlVSTCkgXG5cdHsgICBsb2NhbFZpZC5zcmMgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pOyAgIH0gXG4gICAgICAgY29uc29sZS5sb2coJ2dvdCBhIHN0cmVhbScsIHN0cmVhbSk7ICBcbiAgICAgIGluaXRXZWJHTCgpO1xuICAgICAgLy9cdHRleHR1cmUxID0gaW5pdFZpZGVvVGV4dHVyZShsb2NhbFZpZCk7XG4gICAgICAvL1x0aW5pdEVmZmVjdHMoKTtcbiAgICAgIC8qXHRlZmZlY3RJbmRleCsrO1xuICAgIFx0aWYoZWZmZWN0SW5kZXggPj0gZWZmZWN0cy5sZW5ndGgpIGVmZmVjdEluZGV4ID0gMDsqL1xuICAgIH1cbn0pO1xuXG4vL2luaXRXZWJHTCgpO1xuXG5mdW5jdGlvbiBpbml0V2ViR0woKXtcblx0cmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyApO1xuXHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblx0dGV4dHVyZTEgPSBpbml0VmlkZW9UZXh0dXJlKGxvY2FsVmlkKTtcblx0Ly90ZXh0dXJlMSAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCAndGV4dHVyZXMvY3JhdGUuZ2lmJyApO1xuXHRcdFx0Ly9cdHRleHR1cmUxIC5hbmlzb3Ryb3B5ID0gcmVuZGVyZXIuZ2V0TWF4QW5pc290cm9weSgpO1xuXHRpbml0RWZmZWN0cygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZyb250LXBhZ2VcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG5cdHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBpbml0VmlkZW9UZXh0dXJlKHZpZCl7XG5cdHZhciB0ZXggPSBuZXcgVEhSRUUuVGV4dHVyZSggdmlkICk7XG5cdC8vbmVlZGVkIGJlY2F1c2UgY2FudCBlbnN1cmUgdGhhdCB2aWRlbyBoYXMgcG93ZXIgb2YgdHdvIGRpbWVuc2lvbnNcblx0dGV4LndyYXBTID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0dGV4LndyYXBUID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcblx0dGV4Lm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0dGV4Lm1hZ0ZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcblx0cmV0dXJuIHRleDtcbn1cblxuZnVuY3Rpb24gaW5pdEVmZmVjdHMoKXtcblx0ZWZmZWN0Q2hhaW4gPSBFZmZlY3RDaGFpbihlZmZlY3RzW2VmZmVjdEluZGV4XSwgcmVuZGVyZXIsIHRleHR1cmUxKTtcbn1cblxuXG5cdFxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKXtcblx0bW91c2VYID0gZS5wYWdlWDtcblx0bW91c2VZID0gZS5wYWdlWTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHJlbmRlciApO1xuXHRmcmFtZUNvdW50Kys7XG5cdHRleHR1cmUxLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdGlmKHJlbmRlcmluZ0dpZil7XG5cdFx0aWYoZnJhbWVDb3VudCUxMD09MCl7XG5cdFx0XHRjdXJyZW50R2lmLmFkZEZyYW1lKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcblxuXHRcdFx0XHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cblx0XHRcdH1cblxuZnVuY3Rpb24gY2hlY2tLZXkoZSl7XG5cdCBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdGlmKGUua2V5Q29kZSA9PSAgODMpe1xuXHRcdGNvbnNvbGUubG9nKFwicyBwcmVzc2VkXCIpO1xuXHRcdC8vZ2V0SW1hZ2VEYXRhID0gdHJ1ZTtcblx0XHRlZmZlY3RDaGFpbi5yZW5kZXIobW91c2VYL3dpbmRvdy5pbm5lcldpZHRoLCBtb3VzZVkvd2luZG93LmlubmVySGVpZ2h0LCBmcmFtZUNvdW50KTtcblx0XHR2YXIgaW1nRGF0YSA9IHJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG5cdFx0d2luZG93Lm9wZW4oaW1nRGF0YSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhpbWdEYXRhKTtcblx0XHRcblx0XG5cdH0gZWxzZSBpZihlLmtleUNvZGUgPT0gIDcxKXtcblx0XHRyZW5kZXJpbmdHaWYgPSB0cnVlO1xuXHRcdGN1cnJlbnRHaWYgPSBuZXcgZ2VuZXJhdGVHaWYocmVuZGVyZXIuZG9tRWxlbWVudCwgNTApO1xuXG4gIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09ICczNycpIHtcbiAgICBcdGVmZmVjdEluZGV4LS07XG4gICAgXHRpZihlZmZlY3RJbmRleCA8IDApIGVmZmVjdEluZGV4ID0gZWZmZWN0cy5sZW5ndGgtMTtcbiAgICAgICAvLyBsZWZ0IGFycm93XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKSB7XG4gICAgXHRlZmZlY3RJbmRleCsrO1xuICAgIFx0aWYoZWZmZWN0SW5kZXggPj0gZWZmZWN0cy5sZW5ndGgpIGVmZmVjdEluZGV4ID0gMDtcbiAgICAgICAvLyByaWdodCBhcnJvd1xuICAgIH1cbiAgICBlZmZlY3RDaGFpbiA9IEVmZmVjdENoYWluKGVmZmVjdHNbZWZmZWN0SW5kZXhdLCByZW5kZXJlciwgdGV4dHVyZTEpO1xufVxuXG52YXIgZ2VuZXJhdGVHaWYgPSBmdW5jdGlvbihlbGVtZW50LCBudW1GcmFtZXMpe1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zcmMgPSBcInRleHR1cmVzL3BsYXllcl9yZWNvcmQucG5nXCI7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb3JkaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcblx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0dGhpcy5jYW52YXMud2lkdGggPSByZW5kZXJlci5kb21FbGVtZW50LndpZHRoO1xuXHR0aGlzLmNhbnZhcy5oZWlnaHQgPSByZW5kZXJlci5kb21FbGVtZW50LmhlaWdodDtcblx0dGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuXHQvL3RoaXMuYWRkRnJhbWUoZWxlbWVudCk7XG5cdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cdHRoaXMubnVtRnJhbWVzID0gbnVtRnJhbWVzO1xuXHR0aGlzLmZyYW1lSW5kZXggPSAwO1xuXHR0aGlzLmdpZiA9IG5ldyBHSUYoe1xuICB3b3JrZXJzOiAyLFxuICBxdWFsaXR5OiAxMDBcbn0pO1xuXHRcblxuXG50aGlzLmdpZi5vbignZmluaXNoZWQnLCBmdW5jdGlvbihibG9iKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb3JkaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICB3aW5kb3cub3BlbihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcbn0pO1xuXG5cbn1cblxuZ2VuZXJhdGVHaWYucHJvdG90eXBlLmFkZEZyYW1lID0gZnVuY3Rpb24oZWxlbWVudCl7XG5cdHRoaXMuZnJhbWVJbmRleCsrO1xuXHRpZih0aGlzLmZyYW1lSW5kZXggPj0gdGhpcy5udW1GcmFtZXMpe1xuXHRcdHRoaXMuZmluaXNoKCk7XG5cdH0gZWxzZSB7XG5cdHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoIGVsZW1lbnQsIDAsIDAgKTtcblxuXHRcdFxuXG5cdHRoaXMuZ2lmLmFkZEZyYW1lKHRoaXMuY2FudmFzLCB7Y29weTogdHJ1ZSwgZGVsYXk6MjAwfSk7XG5cdHRoaXMuZnJhbWVJbmRleCsrO1xuXHR9XG59XG5cbmdlbmVyYXRlR2lmLnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbigpe1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY29yZGluZ1wiKS5zcmMgPSBcInRleHR1cmVzL2FqYXgtbG9hZGVyLmdpZlwiO1xuXHRyZW5kZXJpbmdHaWYgPSBmYWxzZTtcblx0dGhpcy5naWYucmVuZGVyKCk7XG59XG5cbiIsIi8vIGdldFVzZXJNZWRpYSBoZWxwZXIgYnkgQEhlbnJpa0pvcmV0ZWdcbnZhciBmdW5jID0gKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWEpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnN0cmFpbnRzLCBjYikge1xuICAgIHZhciBvcHRpb25zLCBlcnJvcjtcbiAgICB2YXIgaGF2ZU9wdHMgPSBhcmd1bWVudHMubGVuZ3RoID09PSAyO1xuICAgIHZhciBkZWZhdWx0T3B0cyA9IHt2aWRlbzogdHJ1ZSwgYXVkaW86IHRydWV9O1xuXG4gICAgdmFyIGRlbmllZCA9ICdQZXJtaXNzaW9uRGVuaWVkRXJyb3InO1xuICAgIHZhciBhbHREZW5pZWQgPSAnUEVSTUlTU0lPTl9ERU5JRUQnO1xuICAgIHZhciBub3RTYXRpc2ZpZWQgPSAnQ29uc3RyYWludE5vdFNhdGlzZmllZEVycm9yJztcblxuICAgIC8vIG1ha2UgY29uc3RyYWludHMgb3B0aW9uYWxcbiAgICBpZiAoIWhhdmVPcHRzKSB7XG4gICAgICAgIGNiID0gY29uc3RyYWludHM7XG4gICAgICAgIGNvbnN0cmFpbnRzID0gZGVmYXVsdE9wdHM7XG4gICAgfVxuXG4gICAgLy8gdHJlYXQgbGFjayBvZiBicm93c2VyIHN1cHBvcnQgbGlrZSBhbiBlcnJvclxuICAgIGlmICghZnVuYykge1xuICAgICAgICAvLyB0aHJvdyBwcm9wZXIgZXJyb3IgcGVyIHNwZWNcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ01lZGlhU3RyZWFtRXJyb3InKTtcbiAgICAgICAgZXJyb3IubmFtZSA9ICdOb3RTdXBwb3J0ZWRFcnJvcic7XG5cbiAgICAgICAgLy8ga2VlcCBhbGwgY2FsbGJhY2tzIGFzeW5jXG4gICAgICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYihlcnJvcik7XG4gICAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIC8vIG5vcm1hbGl6ZSBlcnJvciBoYW5kbGluZyB3aGVuIG5vIG1lZGlhIHR5cGVzIGFyZSByZXF1ZXN0ZWRcbiAgICBpZiAoIWNvbnN0cmFpbnRzLmF1ZGlvICYmICFjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignTWVkaWFTdHJlYW1FcnJvcicpO1xuICAgICAgICBlcnJvci5uYW1lID0gJ05vTWVkaWFSZXF1ZXN0ZWRFcnJvcic7XG5cbiAgICAgICAgLy8ga2VlcCBhbGwgY2FsbGJhY2tzIGFzeW5jXG4gICAgICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYihlcnJvcik7XG4gICAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIGlmIChsb2NhbFN0b3JhZ2UgJiYgbG9jYWxTdG9yYWdlLnVzZUZpcmVmb3hGYWtlRGV2aWNlID09PSBcInRydWVcIikge1xuICAgICAgICBjb25zdHJhaW50cy5mYWtlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jLmNhbGwod2luZG93Lm5hdmlnYXRvciwgY29uc3RyYWludHMsIGZ1bmN0aW9uIChzdHJlYW0pIHtcbiAgICAgICAgY2IobnVsbCwgc3RyZWFtKTtcbiAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHZhciBlcnJvcjtcbiAgICAgICAgLy8gY29lcmNlIGludG8gYW4gZXJyb3Igb2JqZWN0IHNpbmNlIEZGIGdpdmVzIHVzIGEgc3RyaW5nXG4gICAgICAgIC8vIHRoZXJlIGFyZSBvbmx5IHR3byB2YWxpZCBuYW1lcyBhY2NvcmRpbmcgdG8gdGhlIHNwZWNcbiAgICAgICAgLy8gd2UgY29lcmNlIGFsbCBub24tZGVuaWVkIHRvIFwiY29uc3RyYWludCBub3Qgc2F0aXNmaWVkXCIuXG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ01lZGlhU3RyZWFtRXJyb3InKTtcbiAgICAgICAgICAgIGlmIChlcnIgPT09IGRlbmllZCB8fCBlcnIgPT09IGFsdERlbmllZCkge1xuICAgICAgICAgICAgICAgIGVycm9yLm5hbWUgPSBkZW5pZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVycm9yLm5hbWUgPSBub3RTYXRpc2ZpZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBnZXQgYW4gZXJyb3Igb2JqZWN0IG1ha2Ugc3VyZSAnLm5hbWUnIHByb3BlcnR5IGlzIHNldFxuICAgICAgICAgICAgLy8gYWNjb3JkaW5nIHRvIHNwZWM6IGh0dHA6Ly9kZXYudzMub3JnLzIwMTEvd2VicnRjL2VkaXRvci9nZXR1c2VybWVkaWEuaHRtbCNuYXZpZ2F0b3J1c2VybWVkaWFlcnJvci1hbmQtbmF2aWdhdG9ydXNlcm1lZGlhZXJyb3JjYWxsYmFja1xuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICBpZiAoIWVycm9yLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGxpa2VseSBjaHJvbWUgd2hpY2hcbiAgICAgICAgICAgICAgICAvLyBzZXRzIGEgcHJvcGVydHkgY2FsbGVkIFwiRVJST1JfREVOSUVEXCIgb24gdGhlIGVycm9yIG9iamVjdFxuICAgICAgICAgICAgICAgIC8vIGlmIHNvIHdlIG1ha2Ugc3VyZSB0byBzZXQgYSBuYW1lXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yW2RlbmllZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm5hbWUgPSBkZW5pZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm5hbWUgPSBub3RTYXRpc2ZpZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2IoZXJyb3IpO1xuICAgIH0pO1xufTtcbiJdfQ==
