(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  //   	if (window.URL)
	// {   localVid.src = window.URL.createObjectURL(stream);
  // }
      localVid.srcObject = stream
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
// getUserMedia helper by @HenrikJoreteg used for navigator.getUserMedia shim
var adapter = require('webrtc-adapter');

module.exports = function (constraints, cb) {
    var error;
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
    if (typeof navigator === 'undefined' || !navigator.getUserMedia) {
        // throw proper error per spec
        error = new Error('MediaStreamError');
        error.name = 'NotSupportedError';

        // keep all callbacks async
        return setTimeout(function () {
            cb(error);
        }, 0);
    }

    // normalize error handling when no media types are requested
    if (!constraints.audio && !constraints.video) {
        error = new Error('MediaStreamError');
        error.name = 'NoMediaRequestedError';

        // keep all callbacks async
        return setTimeout(function () {
            cb(error);
        }, 0);
    }

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
        cb(null, stream);
    }).catch(function (err) {
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

},{"webrtc-adapter":7}],6:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parts[1],
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
}

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
}

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  caps.headerExtensions.forEach(function(extension) {
    sdp += SDPUtils.writeExtmap(extension);
  });
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(5), 10);
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  var cname;
  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

SDPUtils.writeSessionBoilerplate = function() {
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

// Expose public methods.
module.exports = SDPUtils;

},{}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;
  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'opera': // fallthrough as it uses chrome shims
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection) {
        logging('Chrome shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = chromeShim;

      chromeShim.shimGetUserMedia();
      chromeShim.shimMediaStream();
      chromeShim.shimSourceObject();
      chromeShim.shimPeerConnection();
      chromeShim.shimOnTrack();
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection) {
        logging('Firefox shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = firefoxShim;

      firefoxShim.shimGetUserMedia();
      firefoxShim.shimSourceObject();
      firefoxShim.shimPeerConnection();
      firefoxShim.shimOnTrack();
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection) {
        logging('MS edge shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = edgeShim;

      edgeShim.shimGetUserMedia();
      edgeShim.shimPeerConnection();
      break;
    case 'safari':
      if (!safariShim) {
        logging('Safari shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = safariShim;

      safariShim.shimGetUserMedia();
      break;
    default:
      logging('Unsupported browser!');
  }
})();

},{"./chrome/chrome_shim":8,"./edge/edge_shim":10,"./firefox/firefox_shim":12,"./safari/safari_shim":14,"./utils":15}],8:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;
var browserDetails = require('../utils.js').browserDetails;

var chromeShim = {
  shimMediaStream: function() {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          var self = this;
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var event = new Event('track');
              event.track = te.track;
              event.receiver = {track: te.track};
              event.streams = [e.stream];
              self.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    // The RTCPeerConnection object.
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      // Translate iceTransportPolicy to iceTransports,
      // see https://code.google.com/p/webrtc/issues/detail?id=4869
      logging('PeerConnection');
      if (pcConfig && pcConfig.iceTransportPolicy) {
        pcConfig.iceTransports = pcConfig.iceTransportPolicy;
      }

      var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
      var origGetStats = pc.getStats.bind(pc);
      pc.getStats = function(selector, successCallback, errorCallback) {
        var self = this;
        var args = arguments;

        // If selector is a function then we are in the old style stats so just
        // pass back the original getStats format to avoid breaking old users.
        if (arguments.length > 0 && typeof selector === 'function') {
          return origGetStats(selector, successCallback);
        }

        var fixChromeStats_ = function(response) {
          var standardReport = {};
          var reports = response.result();
          reports.forEach(function(report) {
            var standardStats = {
              id: report.id,
              timestamp: report.timestamp,
              type: report.type
            };
            report.names().forEach(function(name) {
              standardStats[name] = report.stat(name);
            });
            standardReport[standardStats.id] = standardStats;
          });

          return standardReport;
        };

        // shim getStats with maplike support
        var makeMapStats = function(stats, legacyStats) {
          var map = new Map(Object.keys(stats).map(function(key) {
            return[key, stats[key]];
          }));
          legacyStats = legacyStats || stats;
          Object.keys(legacyStats).forEach(function(key) {
            map[key] = legacyStats[key];
          });
          return map;
        };

        if (arguments.length >= 2) {
          var successCallbackWrapper_ = function(response) {
            args[1](makeMapStats(fixChromeStats_(response)));
          };

          return origGetStats.apply(this, [successCallbackWrapper_,
              arguments[0]]);
        }

        // promise-support
        return new Promise(function(resolve, reject) {
          if (args.length === 1 && typeof selector === 'object') {
            origGetStats.apply(self, [
              function(response) {
                resolve(makeMapStats(fixChromeStats_(response)));
              }, reject]);
          } else {
            // Preserve legacy chrome stats only on legacy access of stats obj
            origGetStats.apply(self, [
              function(response) {
                resolve(makeMapStats(fixChromeStats_(response),
                    response.result()));
              }, reject]);
          }
        }).then(successCallback, errorCallback);
      };

      return pc;
    };
    window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

    // wrap static methods. Currently just generateCertificate.
    if (webkitRTCPeerConnection.generateCertificate) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return webkitRTCPeerConnection.generateCertificate;
        }
      });
    }

    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = webkitRTCPeerConnection.prototype[method];
      webkitRTCPeerConnection.prototype[method] = function() {
        var self = this;
        if (arguments.length < 1 || (arguments.length === 1 &&
            typeof arguments[0] === 'object')) {
          var opts = arguments.length === 1 ? arguments[0] : undefined;
          return new Promise(function(resolve, reject) {
            nativeMethod.apply(self, [resolve, reject, opts]);
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = webkitRTCPeerConnection.prototype[method];
            webkitRTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var self = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(self, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = webkitRTCPeerConnection.prototype[method];
          webkitRTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        RTCPeerConnection.prototype.addIceCandidate;
    RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }
};


// Expose public methods.
module.exports = {
  shimMediaStream: chromeShim.shimMediaStream,
  shimOnTrack: chromeShim.shimOnTrack,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils.js":15,"./getusermedia":9}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;

// Expose public methods.
module.exports = function() {
  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && constraints.audio) {
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile, where it defaults to "user".
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode)) {
        delete constraints.video.facingMode;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          // Look for "back" in label, or use last cam (typically back cam).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var back = devices.find(function(d) {
              return d.label.toLowerCase().indexOf('back') !== -1;
            }) || (devices.length && devices[devices.length - 1]);
            if (back) {
              constraints.video.deviceId = face.exact ? {exact: back.deviceId} :
                                                        {ideal: back.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        ConstraintNotSatisfiedError: 'OverconstrainedError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        onError(shimError_(e));
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":15}],10:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var browserDetails = require('../utils').browserDetails;

var edgeShim = {
  shimPeerConnection: function() {
    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed.
      var origMSTEnabled = Object.getOwnPropertyDescriptor(
          MediaStreamTrack.prototype, 'enabled');
      Object.defineProperty(MediaStreamTrack.prototype, 'enabled', {
        set: function(value) {
          origMSTEnabled.set.call(this, value);
          var ev = new Event('enabled');
          ev.enabled = value;
          this.dispatchEvent(ev);
        }
      });
    }

    window.RTCPeerConnection = function(config) {
      var self = this;

      var _eventTarget = document.createDocumentFragment();
      ['addEventListener', 'removeEventListener', 'dispatchEvent']
          .forEach(function(method) {
            self[method] = _eventTarget[method].bind(_eventTarget);
          });

      this.onicecandidate = null;
      this.onaddstream = null;
      this.ontrack = null;
      this.onremovestream = null;
      this.onsignalingstatechange = null;
      this.oniceconnectionstatechange = null;
      this.onnegotiationneeded = null;
      this.ondatachannel = null;

      this.localStreams = [];
      this.remoteStreams = [];
      this.getLocalStreams = function() {
        return self.localStreams;
      };
      this.getRemoteStreams = function() {
        return self.remoteStreams;
      };

      this.localDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.remoteDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.signalingState = 'stable';
      this.iceConnectionState = 'new';
      this.iceGatheringState = 'new';

      this.iceOptions = {
        gatherPolicy: 'all',
        iceServers: []
      };
      if (config && config.iceTransportPolicy) {
        switch (config.iceTransportPolicy) {
          case 'all':
          case 'relay':
            this.iceOptions.gatherPolicy = config.iceTransportPolicy;
            break;
          case 'none':
            // FIXME: remove once implementation and spec have added this.
            throw new TypeError('iceTransportPolicy "none" not supported');
          default:
            // don't set iceTransportPolicy.
            break;
        }
      }
      this.usingBundle = config && config.bundlePolicy === 'max-bundle';

      if (config && config.iceServers) {
        // Edge does not like
        // 1) stun:
        // 2) turn: that does not have all of turn:host:port?transport=udp
        // 3) turn: with ipv6 addresses
        var iceServers = JSON.parse(JSON.stringify(config.iceServers));
        this.iceOptions.iceServers = iceServers.filter(function(server) {
          if (server && server.urls) {
            var urls = server.urls;
            if (typeof urls === 'string') {
              urls = [urls];
            }
            urls = urls.filter(function(url) {
              return (url.indexOf('turn:') === 0 &&
                  url.indexOf('transport=udp') !== -1 &&
                  url.indexOf('turn:[') === -1) ||
                  (url.indexOf('stun:') === 0 &&
                    browserDetails.version >= 14393);
            })[0];
            return !!urls;
          }
          return false;
        });
      }
      this._config = config;

      // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
      // everything that is needed to describe a SDP m-line.
      this.transceivers = [];

      // since the iceGatherer is currently created in createOffer but we
      // must not emit candidates until after setLocalDescription we buffer
      // them in this array.
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
      var self = this;
      var sections = SDPUtils.splitSections(self.localDescription.sdp);
      // FIXME: need to apply ice candidates in a way which is async but
      // in-order
      this._localIceCandidatesBuffer.forEach(function(event) {
        var end = !event.candidate || Object.keys(event.candidate).length === 0;
        if (end) {
          for (var j = 1; j < sections.length; j++) {
            if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
              sections[j] += 'a=end-of-candidates\r\n';
            }
          }
        } else if (event.candidate.candidate.indexOf('typ endOfCandidates')
            === -1) {
          sections[event.candidate.sdpMLineIndex + 1] +=
              'a=' + event.candidate.candidate + '\r\n';
        }
        self.localDescription.sdp = sections.join('');
        self.dispatchEvent(event);
        if (self.onicecandidate !== null) {
          self.onicecandidate(event);
        }
        if (!event.candidate && self.iceGatheringState !== 'complete') {
          var complete = self.transceivers.every(function(transceiver) {
            return transceiver.iceGatherer &&
                transceiver.iceGatherer.state === 'completed';
          });
          if (complete) {
            self.iceGatheringState = 'complete';
          }
        }
      });
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype.getConfiguration = function() {
      return this._config;
    };

    window.RTCPeerConnection.prototype.addStream = function(stream) {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      this.localStreams.push(clonedStream);
      this._maybeFireNegotiationNeeded();
    };

    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var idx = this.localStreams.indexOf(stream);
      if (idx > -1) {
        this.localStreams.splice(idx, 1);
        this._maybeFireNegotiationNeeded();
      }
    };

    window.RTCPeerConnection.prototype.getSenders = function() {
      return this.transceivers.filter(function(transceiver) {
        return !!transceiver.rtpSender;
      })
      .map(function(transceiver) {
        return transceiver.rtpSender;
      });
    };

    window.RTCPeerConnection.prototype.getReceivers = function() {
      return this.transceivers.filter(function(transceiver) {
        return !!transceiver.rtpReceiver;
      })
      .map(function(transceiver) {
        return transceiver.rtpReceiver;
      });
    };

    // Determines the intersection of local and remote capabilities.
    window.RTCPeerConnection.prototype._getCommonCapabilities =
        function(localCapabilities, remoteCapabilities) {
          var commonCapabilities = {
            codecs: [],
            headerExtensions: [],
            fecMechanisms: []
          };
          localCapabilities.codecs.forEach(function(lCodec) {
            for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
              var rCodec = remoteCapabilities.codecs[i];
              if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                  lCodec.clockRate === rCodec.clockRate) {
                // number of channels is the highest common number of channels
                rCodec.numChannels = Math.min(lCodec.numChannels,
                    rCodec.numChannels);
                // push rCodec so we reply with offerer payload type
                commonCapabilities.codecs.push(rCodec);

                // determine common feedback mechanisms
                rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
                  for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                    if (lCodec.rtcpFeedback[j].type === fb.type &&
                        lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                      return true;
                    }
                  }
                  return false;
                });
                // FIXME: also need to determine .parameters
                //  see https://github.com/openpeer/ortc/issues/569
                break;
              }
            }
          });

          localCapabilities.headerExtensions
              .forEach(function(lHeaderExtension) {
                for (var i = 0; i < remoteCapabilities.headerExtensions.length;
                     i++) {
                  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                  if (lHeaderExtension.uri === rHeaderExtension.uri) {
                    commonCapabilities.headerExtensions.push(rHeaderExtension);
                    break;
                  }
                }
              });

          // FIXME: fecMechanisms
          return commonCapabilities;
        };

    // Create ICE gatherer, ICE transport and DTLS transport.
    window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
        function(mid, sdpMLineIndex) {
          var self = this;
          var iceGatherer = new RTCIceGatherer(self.iceOptions);
          var iceTransport = new RTCIceTransport(iceGatherer);
          iceGatherer.onlocalcandidate = function(evt) {
            var event = new Event('icecandidate');
            event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

            var cand = evt.candidate;
            var end = !cand || Object.keys(cand).length === 0;
            // Edge emits an empty object for RTCIceCandidateComplete‥
            if (end) {
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              if (iceGatherer.state === undefined) {
                iceGatherer.state = 'completed';
              }

              // Emit a candidate with type endOfCandidates to make the samples
              // work. Edge requires addIceCandidate with this empty candidate
              // to start checking. The real solution is to signal
              // end-of-candidates to the other side when getting the null
              // candidate but some apps (like the samples) don't do that.
              event.candidate.candidate =
                  'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
            } else {
              // RTCIceCandidate doesn't have a component, needs to be added
              cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
              event.candidate.candidate = SDPUtils.writeCandidate(cand);
            }

            // update local description.
            var sections = SDPUtils.splitSections(self.localDescription.sdp);
            if (event.candidate.candidate.indexOf('typ endOfCandidates')
                === -1) {
              sections[event.candidate.sdpMLineIndex + 1] +=
                  'a=' + event.candidate.candidate + '\r\n';
            } else {
              sections[event.candidate.sdpMLineIndex + 1] +=
                  'a=end-of-candidates\r\n';
            }
            self.localDescription.sdp = sections.join('');

            var complete = self.transceivers.every(function(transceiver) {
              return transceiver.iceGatherer &&
                  transceiver.iceGatherer.state === 'completed';
            });

            // Emit candidate if localDescription is set.
            // Also emits null candidate when all gatherers are complete.
            switch (self.iceGatheringState) {
              case 'new':
                self._localIceCandidatesBuffer.push(event);
                if (end && complete) {
                  self._localIceCandidatesBuffer.push(
                      new Event('icecandidate'));
                }
                break;
              case 'gathering':
                self._emitBufferedCandidates();
                self.dispatchEvent(event);
                if (self.onicecandidate !== null) {
                  self.onicecandidate(event);
                }
                if (complete) {
                  self.dispatchEvent(new Event('icecandidate'));
                  if (self.onicecandidate !== null) {
                    self.onicecandidate(new Event('icecandidate'));
                  }
                  self.iceGatheringState = 'complete';
                }
                break;
              case 'complete':
                // should not happen... currently!
                break;
              default: // no-op.
                break;
            }
          };
          iceTransport.onicestatechange = function() {
            self._updateConnectionState();
          };

          var dtlsTransport = new RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function() {
            self._updateConnectionState();
          };
          dtlsTransport.onerror = function() {
            // onerror does not set state to failed by itself.
            dtlsTransport.state = 'failed';
            self._updateConnectionState();
          };

          return {
            iceGatherer: iceGatherer,
            iceTransport: iceTransport,
            dtlsTransport: dtlsTransport
          };
        };

    // Start the RTP Sender and Receiver for a transceiver.
    window.RTCPeerConnection.prototype._transceive = function(transceiver,
        send, recv) {
      var params = this._getCommonCapabilities(transceiver.localCapabilities,
          transceiver.remoteCapabilities);
      if (send && transceiver.rtpSender) {
        params.encodings = transceiver.sendEncodingParameters;
        params.rtcp = {
          cname: SDPUtils.localCName
        };
        if (transceiver.recvEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
        }
        transceiver.rtpSender.send(params);
      }
      if (recv && transceiver.rtpReceiver) {
        // remove RTX field in Edge 14942
        if (transceiver.kind === 'video'
            && transceiver.recvEncodingParameters) {
          transceiver.recvEncodingParameters.forEach(function(p) {
            delete p.rtx;
          });
        }
        params.encodings = transceiver.recvEncodingParameters;
        params.rtcp = {
          cname: transceiver.cname
        };
        if (transceiver.sendEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
        }
        transceiver.rtpReceiver.receive(params);
      }
    };

    window.RTCPeerConnection.prototype.setLocalDescription =
        function(description) {
          var self = this;
          var sections;
          var sessionpart;
          if (description.type === 'offer') {
            // FIXME: What was the purpose of this empty if statement?
            // if (!this._pendingOffer) {
            // } else {
            if (this._pendingOffer) {
              // VERY limited support for SDP munging. Limited to:
              // * changing the order of codecs
              sections = SDPUtils.splitSections(description.sdp);
              sessionpart = sections.shift();
              sections.forEach(function(mediaSection, sdpMLineIndex) {
                var caps = SDPUtils.parseRtpParameters(mediaSection);
                self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
              });
              this.transceivers = this._pendingOffer;
              delete this._pendingOffer;
            }
          } else if (description.type === 'answer') {
            sections = SDPUtils.splitSections(self.remoteDescription.sdp);
            sessionpart = sections.shift();
            var isIceLite = SDPUtils.matchPrefix(sessionpart,
                'a=ice-lite').length > 0;
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var transceiver = self.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;

              var rejected = mediaSection.split('\n', 1)[0]
                  .split(' ', 2)[1] === '0';

              if (!rejected && !transceiver.isDatachannel) {
                var remoteIceParameters = SDPUtils.getIceParameters(
                    mediaSection, sessionpart);
                if (isIceLite) {
                  var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                  .map(function(cand) {
                    return SDPUtils.parseCandidate(cand);
                  })
                  .filter(function(cand) {
                    return cand.component === '1';
                  });
                  // ice-lite only includes host candidates in the SDP so we can
                  // use setRemoteCandidates (which implies an
                  // RTCIceCandidateComplete)
                  if (cands.length) {
                    iceTransport.setRemoteCandidates(cands);
                  }
                }
                var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                    mediaSection, sessionpart);
                if (isIceLite) {
                  remoteDtlsParameters.role = 'server';
                }

                if (!self.usingBundle || sdpMLineIndex === 0) {
                  iceTransport.start(iceGatherer, remoteIceParameters,
                      isIceLite ? 'controlling' : 'controlled');
                  dtlsTransport.start(remoteDtlsParameters);
                }

                // Calculate intersection of capabilities.
                var params = self._getCommonCapabilities(localCapabilities,
                    remoteCapabilities);

                // Start the RTCRtpSender. The RTCRtpReceiver for this
                // transceiver has already been started in setRemoteDescription.
                self._transceive(transceiver,
                    params.codecs.length > 0,
                    false);
              }
            });
          }

          this.localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-local-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }

          // If a success callback was provided, emit ICE candidates after it
          // has been executed. Otherwise, emit callback after the Promise is
          // resolved.
          var hasCallback = arguments.length > 1 &&
            typeof arguments[1] === 'function';
          if (hasCallback) {
            var cb = arguments[1];
            window.setTimeout(function() {
              cb();
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              self._emitBufferedCandidates();
            }, 0);
          }
          var p = Promise.resolve();
          p.then(function() {
            if (!hasCallback) {
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              // Usually candidates will be emitted earlier.
              window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
            }
          });
          return p;
        };

    window.RTCPeerConnection.prototype.setRemoteDescription =
        function(description) {
          var self = this;
          var stream = new MediaStream();
          var receiverList = [];
          var sections = SDPUtils.splitSections(description.sdp);
          var sessionpart = sections.shift();
          var isIceLite = SDPUtils.matchPrefix(sessionpart,
              'a=ice-lite').length > 0;
          this.usingBundle = SDPUtils.matchPrefix(sessionpart,
              'a=group:BUNDLE ').length > 0;
          sections.forEach(function(mediaSection, sdpMLineIndex) {
            var lines = SDPUtils.splitLines(mediaSection);
            var mline = lines[0].substr(2).split(' ');
            var kind = mline[0];
            var rejected = mline[1] === '0';
            var direction = SDPUtils.getDirection(mediaSection, sessionpart);

            var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
            if (mid.length) {
              mid = mid[0].substr(6);
            } else {
              mid = SDPUtils.generateIdentifier();
            }

            // Reject datachannels which are not implemented yet.
            if (kind === 'application' && mline[2] === 'DTLS/SCTP') {
              self.transceivers[sdpMLineIndex] = {
                mid: mid,
                isDatachannel: true
              };
              return;
            }

            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpSender;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;

            var track;
            // FIXME: ensure the mediaSection has rtcp-mux set.
            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters.role = 'client';
            }
            recvEncodingParameters =
                SDPUtils.parseRtpEncodingParameters(mediaSection);

            var cname;
            // Gets the first SSRC. Note that with RTX there might be multiple
            // SSRCs.
            var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                .map(function(line) {
                  return SDPUtils.parseSsrcMedia(line);
                })
                .filter(function(obj) {
                  return obj.attribute === 'cname';
                })[0];
            if (remoteSsrc) {
              cname = remoteSsrc.value;
            }

            var isComplete = SDPUtils.matchPrefix(mediaSection,
                'a=end-of-candidates', sessionpart).length > 0;
            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                .map(function(cand) {
                  return SDPUtils.parseCandidate(cand);
                })
                .filter(function(cand) {
                  return cand.component === '1';
                });
            if (description.type === 'offer' && !rejected) {
              var transports = self.usingBundle && sdpMLineIndex > 0 ? {
                iceGatherer: self.transceivers[0].iceGatherer,
                iceTransport: self.transceivers[0].iceTransport,
                dtlsTransport: self.transceivers[0].dtlsTransport
              } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

              if (isComplete) {
                transports.iceTransport.setRemoteCandidates(cands);
              }

              localCapabilities = RTCRtpReceiver.getCapabilities(kind);

              // filter RTX until additional stuff needed for RTX is implemented
              // in adapter.js
              localCapabilities.codecs = localCapabilities.codecs.filter(
                  function(codec) {
                    return codec.name !== 'rtx';
                  });

              sendEncodingParameters = [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];

              rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

              track = rtpReceiver.track;
              receiverList.push([track, rtpReceiver]);
              // FIXME: not correct when there are multiple streams but that is
              // not currently supported in this shim.
              stream.addTrack(track);

              // FIXME: look at direction.
              if (self.localStreams.length > 0 &&
                  self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                var localTrack;
                if (kind === 'audio') {
                  localTrack = self.localStreams[0].getAudioTracks()[0];
                } else if (kind === 'video') {
                  localTrack = self.localStreams[0].getVideoTracks()[0];
                }
                if (localTrack) {
                  rtpSender = new RTCRtpSender(localTrack,
                      transports.dtlsTransport);
                }
              }

              self.transceivers[sdpMLineIndex] = {
                iceGatherer: transports.iceGatherer,
                iceTransport: transports.iceTransport,
                dtlsTransport: transports.dtlsTransport,
                localCapabilities: localCapabilities,
                remoteCapabilities: remoteCapabilities,
                rtpSender: rtpSender,
                rtpReceiver: rtpReceiver,
                kind: kind,
                mid: mid,
                cname: cname,
                sendEncodingParameters: sendEncodingParameters,
                recvEncodingParameters: recvEncodingParameters
              };
              // Start the RTCRtpReceiver now. The RTPSender is started in
              // setLocalDescription.
              self._transceive(self.transceivers[sdpMLineIndex],
                  false,
                  direction === 'sendrecv' || direction === 'sendonly');
            } else if (description.type === 'answer' && !rejected) {
              transceiver = self.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpSender = transceiver.rtpSender;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;

              self.transceivers[sdpMLineIndex].recvEncodingParameters =
                  recvEncodingParameters;
              self.transceivers[sdpMLineIndex].remoteCapabilities =
                  remoteCapabilities;
              self.transceivers[sdpMLineIndex].cname = cname;

              if ((isIceLite || isComplete) && cands.length) {
                iceTransport.setRemoteCandidates(cands);
              }
              if (!self.usingBundle || sdpMLineIndex === 0) {
                iceTransport.start(iceGatherer, remoteIceParameters,
                    'controlling');
                dtlsTransport.start(remoteDtlsParameters);
              }

              self._transceive(transceiver,
                  direction === 'sendrecv' || direction === 'recvonly',
                  direction === 'sendrecv' || direction === 'sendonly');

              if (rtpReceiver &&
                  (direction === 'sendrecv' || direction === 'sendonly')) {
                track = rtpReceiver.track;
                receiverList.push([track, rtpReceiver]);
                stream.addTrack(track);
              } else {
                // FIXME: actually the receiver should be created later.
                delete transceiver.rtpReceiver;
              }
            }
          });

          this.remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-remote-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }
          if (stream.getTracks().length) {
            self.remoteStreams.push(stream);
            window.setTimeout(function() {
              var event = new Event('addstream');
              event.stream = stream;
              self.dispatchEvent(event);
              if (self.onaddstream !== null) {
                window.setTimeout(function() {
                  self.onaddstream(event);
                }, 0);
              }

              receiverList.forEach(function(item) {
                var track = item[0];
                var receiver = item[1];
                var trackEvent = new Event('track');
                trackEvent.track = track;
                trackEvent.receiver = receiver;
                trackEvent.streams = [stream];
                self.dispatchEvent(event);
                if (self.ontrack !== null) {
                  window.setTimeout(function() {
                    self.ontrack(trackEvent);
                  }, 0);
                }
              });
            }, 0);
          }
          if (arguments.length > 1 && typeof arguments[1] === 'function') {
            window.setTimeout(arguments[1], 0);
          }
          return Promise.resolve();
        };

    window.RTCPeerConnection.prototype.close = function() {
      this.transceivers.forEach(function(transceiver) {
        /* not yet
        if (transceiver.iceGatherer) {
          transceiver.iceGatherer.close();
        }
        */
        if (transceiver.iceTransport) {
          transceiver.iceTransport.stop();
        }
        if (transceiver.dtlsTransport) {
          transceiver.dtlsTransport.stop();
        }
        if (transceiver.rtpSender) {
          transceiver.rtpSender.stop();
        }
        if (transceiver.rtpReceiver) {
          transceiver.rtpReceiver.stop();
        }
      });
      // FIXME: clean up tracks, local streams, remote streams, etc
      this._updateSignalingState('closed');
    };

    // Update the signaling state.
    window.RTCPeerConnection.prototype._updateSignalingState =
        function(newState) {
          this.signalingState = newState;
          var event = new Event('signalingstatechange');
          this.dispatchEvent(event);
          if (this.onsignalingstatechange !== null) {
            this.onsignalingstatechange(event);
          }
        };

    // Determine whether to fire the negotiationneeded event.
    window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
        function() {
          // Fire away (for now).
          var event = new Event('negotiationneeded');
          this.dispatchEvent(event);
          if (this.onnegotiationneeded !== null) {
            this.onnegotiationneeded(event);
          }
        };

    // Update the connection state.
    window.RTCPeerConnection.prototype._updateConnectionState = function() {
      var self = this;
      var newState;
      var states = {
        'new': 0,
        closed: 0,
        connecting: 0,
        checking: 0,
        connected: 0,
        completed: 0,
        failed: 0
      };
      this.transceivers.forEach(function(transceiver) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      });
      // ICETransport.completed and connected are the same for this purpose.
      states.connected += states.completed;

      newState = 'new';
      if (states.failed > 0) {
        newState = 'failed';
      } else if (states.connecting > 0 || states.checking > 0) {
        newState = 'connecting';
      } else if (states.disconnected > 0) {
        newState = 'disconnected';
      } else if (states.new > 0) {
        newState = 'new';
      } else if (states.connected > 0 || states.completed > 0) {
        newState = 'connected';
      }

      if (newState !== self.iceConnectionState) {
        self.iceConnectionState = newState;
        var event = new Event('iceconnectionstatechange');
        this.dispatchEvent(event);
        if (this.oniceconnectionstatechange !== null) {
          this.oniceconnectionstatechange(event);
        }
      }
    };

    window.RTCPeerConnection.prototype.createOffer = function() {
      var self = this;
      if (this._pendingOffer) {
        throw new Error('createOffer called while there is a pending offer.');
      }
      var offerOptions;
      if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        offerOptions = arguments[0];
      } else if (arguments.length === 3) {
        offerOptions = arguments[2];
      }

      var tracks = [];
      var numAudioTracks = 0;
      var numVideoTracks = 0;
      // Default to sendrecv.
      if (this.localStreams.length) {
        numAudioTracks = this.localStreams[0].getAudioTracks().length;
        numVideoTracks = this.localStreams[0].getVideoTracks().length;
      }
      // Determine number of audio and video tracks we need to send/recv.
      if (offerOptions) {
        // Reject Chrome legacy constraints.
        if (offerOptions.mandatory || offerOptions.optional) {
          throw new TypeError(
              'Legacy mandatory/optional constraints not supported.');
        }
        if (offerOptions.offerToReceiveAudio !== undefined) {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
        if (offerOptions.offerToReceiveVideo !== undefined) {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
      if (this.localStreams.length) {
        // Push local streams.
        this.localStreams[0].getTracks().forEach(function(track) {
          tracks.push({
            kind: track.kind,
            track: track,
            wantReceive: track.kind === 'audio' ?
                numAudioTracks > 0 : numVideoTracks > 0
          });
          if (track.kind === 'audio') {
            numAudioTracks--;
          } else if (track.kind === 'video') {
            numVideoTracks--;
          }
        });
      }
      // Create M-lines for recvonly streams.
      while (numAudioTracks > 0 || numVideoTracks > 0) {
        if (numAudioTracks > 0) {
          tracks.push({
            kind: 'audio',
            wantReceive: true
          });
          numAudioTracks--;
        }
        if (numVideoTracks > 0) {
          tracks.push({
            kind: 'video',
            wantReceive: true
          });
          numVideoTracks--;
        }
      }

      var sdp = SDPUtils.writeSessionBoilerplate();
      var transceivers = [];
      tracks.forEach(function(mline, sdpMLineIndex) {
        // For each track, create an ice gatherer, ice transport,
        // dtls transport, potentially rtpsender and rtpreceiver.
        var track = mline.track;
        var kind = mline.kind;
        var mid = SDPUtils.generateIdentifier();

        var transports = self.usingBundle && sdpMLineIndex > 0 ? {
          iceGatherer: transceivers[0].iceGatherer,
          iceTransport: transceivers[0].iceTransport,
          dtlsTransport: transceivers[0].dtlsTransport
        } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

        var localCapabilities = RTCRtpSender.getCapabilities(kind);
        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
        localCapabilities.codecs.forEach(function(codec) {
          // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
          // by adding level-asymmetry-allowed=1
          if (codec.name === 'H264' &&
              codec.parameters['level-asymmetry-allowed'] === undefined) {
            codec.parameters['level-asymmetry-allowed'] = '1';
          }
        });

        var rtpSender;
        var rtpReceiver;

        // generate an ssrc now, to be used later in rtpSender.send
        var sendEncodingParameters = [{
          ssrc: (2 * sdpMLineIndex + 1) * 1001
        }];
        if (track) {
          rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
        }

        if (mline.wantReceive) {
          rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
        }

        transceivers[sdpMLineIndex] = {
          iceGatherer: transports.iceGatherer,
          iceTransport: transports.iceTransport,
          dtlsTransport: transports.dtlsTransport,
          localCapabilities: localCapabilities,
          remoteCapabilities: null,
          rtpSender: rtpSender,
          rtpReceiver: rtpReceiver,
          kind: kind,
          mid: mid,
          sendEncodingParameters: sendEncodingParameters,
          recvEncodingParameters: null
        };
      });
      if (this.usingBundle) {
        sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
          return t.mid;
        }).join(' ') + '\r\n';
      }
      tracks.forEach(function(mline, sdpMLineIndex) {
        var transceiver = transceivers[sdpMLineIndex];
        sdp += SDPUtils.writeMediaSection(transceiver,
            transceiver.localCapabilities, 'offer', self.localStreams[0]);
      });

      this._pendingOffer = transceivers;
      var desc = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.createAnswer = function() {
      var self = this;

      var sdp = SDPUtils.writeSessionBoilerplate();
      if (this.usingBundle) {
        sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
          return t.mid;
        }).join(' ') + '\r\n';
      }
      this.transceivers.forEach(function(transceiver) {
        if (transceiver.isDatachannel) {
          sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
              'c=IN IP4 0.0.0.0\r\n' +
              'a=mid:' + transceiver.mid + '\r\n';
          return;
        }
        // Calculate intersection of capabilities.
        var commonCapabilities = self._getCommonCapabilities(
            transceiver.localCapabilities,
            transceiver.remoteCapabilities);

        sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
            'answer', self.localStreams[0]);
      });

      var desc = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
      if (!candidate) {
        this.transceivers.forEach(function(transceiver) {
          transceiver.iceTransport.addRemoteCandidate({});
        });
      } else {
        var mLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < this.transceivers.length; i++) {
            if (this.transceivers[i].mid === candidate.sdpMid) {
              mLineIndex = i;
              break;
            }
          }
        }
        var transceiver = this.transceivers[mLineIndex];
        if (transceiver) {
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return;
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component !== '1') {
            return;
          }
          // A dirty hack to make samples work.
          if (cand.type === 'endOfCandidates') {
            cand = {};
          }
          transceiver.iceTransport.addRemoteCandidate(cand);

          // update the remoteDescription.
          var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
          sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
              : 'a=end-of-candidates') + '\r\n';
          this.remoteDescription.sdp = sections.join('');
        }
      }
      if (arguments.length > 1 && typeof arguments[1] === 'function') {
        window.setTimeout(arguments[1], 0);
      }
      return Promise.resolve();
    };

    window.RTCPeerConnection.prototype.getStats = function() {
      var promises = [];
      this.transceivers.forEach(function(transceiver) {
        ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
            'dtlsTransport'].forEach(function(method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
      });
      var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
          arguments[1];
      return new Promise(function(resolve) {
        // shim getStats with maplike support
        var results = new Map();
        Promise.all(promises).then(function(res) {
          res.forEach(function(result) {
            Object.keys(result).forEach(function(id) {
              results.set(id, result[id]);
              results[id] = result[id];
            });
          });
          if (cb) {
            window.setTimeout(cb, 0, results);
          }
          resolve(results);
        });
      });
    };
  }
};

// Expose public methods.
module.exports = {
  shimPeerConnection: edgeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":15,"./getusermedia":11,"sdp":6}],11:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],12:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var browserDetails = require('../utils').browserDetails;

var firefoxShim = {
  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = mozRTCSessionDescription;
      window.RTCIceCandidate = mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        RTCPeerConnection.prototype.addIceCandidate;
    RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    if (browserDetails.version < 48) {
      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        var map = new Map();
        Object.keys(stats).forEach(function(key) {
          map.set(key, stats[key]);
          map[key] = stats[key];
        });
        return map;
      };

      var nativeGetStats = RTCPeerConnection.prototype.getStats;
      RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
        return nativeGetStats.apply(this, [selector || null])
          .then(function(stats) {
            return makeMapStats(stats);
          })
          .then(onSucc, onErr);
      };
    }
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":15,"./getusermedia":13}],13:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
    return {
      name: {
        SecurityError: 'NotAllowedError',
        PermissionDeniedError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    console.warn('navigator.getUserMedia has been replaced by ' +
                 'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":15}],14:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests
  // shimOnTrack: function() { },

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimGetUserMedia: function() {
    navigator.getUserMedia = navigator.webkitGetUserMedia;
  }
};

// Expose public methods.
module.exports = {
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimOnTrack: safariShim.shimOnTrack,
  // shimPeerConnection: safariShim.shimPeerConnection
};

},{}],15:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;

// Utility methods.
var utils = {
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function() {
    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = this.extractVersion(navigator.userAgent,
          /Firefox\/([0-9]+)\./, 1);

    // all webkit-based browsers
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = this.extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/([0-9]+)\./, 2);

      // Safari or unknown webkit-based
      // for the time being Safari has support for MediaStreams but not webRTC
      } else {
        // Safari UA substrings of interest for reference:
        // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
        // - safari UI version:        Version/9.0.3 (unique to Safari)
        // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
        //
        // if the webkit version and safari UI webkit versions are equals,
        // ... this is a stable version.
        //
        // only the internal webkit version is important today to know if
        // media streams are supported
        //
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = this.extractVersion(navigator.userAgent,
            /AppleWebKit\/([0-9]+)\./, 1);

        // unknown webkit-based browser
        } else {
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }

    // Edge.
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = 'edge';
      result.version = this.extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);

    // Default fallthrough: not supported.
    } else {
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  browserDetails: utils.detectBrowser(),
  extractVersion: utils.extractVersion
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL29qYWNrL1BST0pFQ1RTL2V4YW1wbGVzL3NlbGZpZS1hcG9jYWx5cHNlL2pzL0FzY2lpR3JhZGllbnQuanMiLCIvVXNlcnMvb2phY2svUFJPSkVDVFMvZXhhbXBsZXMvc2VsZmllLWFwb2NhbHlwc2UvanMvRWZmZWN0Q2hhaW4uanMiLCIvVXNlcnMvb2phY2svUFJPSkVDVFMvZXhhbXBsZXMvc2VsZmllLWFwb2NhbHlwc2UvanMvR2VuZXJhdGVHaWYuanMiLCIvVXNlcnMvb2phY2svUFJPSkVDVFMvZXhhbXBsZXMvc2VsZmllLWFwb2NhbHlwc2UvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9nZXR1c2VybWVkaWEvZ2V0dXNlcm1lZGlhLmpzIiwibm9kZV9tb2R1bGVzL3NkcC9zZHAuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2FkYXB0ZXJfY29yZS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvY2hyb21lL2Nocm9tZV9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9jaHJvbWUvZ2V0dXNlcm1lZGlhLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9lZGdlL2VkZ2Vfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZWRnZS9nZXR1c2VybWVkaWEuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZmlyZWZveF9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9maXJlZm94L2dldHVzZXJtZWRpYS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvc2FmYXJpL3NhZmFyaV9zaGltLmpzIiwibm9kZV9tb2R1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QUFDLFVBQVUsRUFBRSxDQUFDOztBQUUxQyxDQUFDOztBQUVELFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztDQUU1QyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDdkQsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzlDOztDQUVDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEIsQ0FBQzs7QUFFRCxJQUFJLEtBQUssR0FBRyxTQUFTLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN4QyxDQUFDLElBQUksVUFBVSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDOUI7QUFDQTs7QUFFQSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7Q0FFeEMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7Q0FDbkIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQztDQUN2RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUUsQ0FBQztDQUNyRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztDQUN0RSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO0NBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcbiogRHJhd3MgYW4gQXNjaWkgc3RyaW5nIG9udG8gYSBjYW52YXMgZWxlbWVudFxuKi9cblxuXG52YXIgY2hhclN0cmluZyA9IFwiJEBCJTgmV00jKm9haGtiZHBxd21aTzBRTENKVVlYemN2dW54cmpmdC9cXFxcfCgpMXt9W10/LV8rfjw+aSFsSTs6LFxcXCJeYCcuIFwiXG4gICAgLnNwbGl0KFwiXCIpLnJldmVyc2UoKS5qb2luKFwiXCIpO1xudmFyIGhlaWdodCA9IDUxMjsgIC8vIGJpZ2dlciBoZXJlID0gc2hhcnBlciBlZGdlcyBvbiB0aGUgY2hhcmFjdGVyc1xudmFyIGJsb2NrID0gXCLilohcIjtcblxudmFyIEFzY2lpR3JhZGllbnQgPSBmdW5jdGlvbigpe1xuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdGNvbnRleHQuZm9udCA9IGhlaWdodCArICdweCBtb25vc3BhY2UnO1xuXHRtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCgnaScpO1xuXG5cdGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogOS8xMDtcblx0Y2FudmFzLndpZHRoID0gbWV0cmljcy53aWR0aCAqIGNoYXJTdHJpbmcubGVuZ3RoO1xuXHQvLyBjYW52YXMuaGVpZ2h0ID01MTI7XG5cdC8vIGNhbnZhcy53aWR0aCA9NTEyO1xuXG5cdGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0Y29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snO1xuXHRjb250ZXh0LmZpbGxSZWN0KDAsMCxjYW52YXMud2lkdGgsY2FudmFzLmhlaWdodCk7XG5cdGNvbnRleHQuZm9udCA9IGhlaWdodCArICdweCBtb25vc3BhY2UnO1xuXHRjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG5cblxuICAgIC8vIHlPZmZzZXQgaXMgc2NhbGVkIHNvIHRoYXQgaXQgaXMgMjQgcGl4ZWxzIGF0IGEgaGVpZ2h0IG9mIDEyOC5cbiAgICB2YXIgeU9mZnNldCA9IDI0ICogaGVpZ2h0IC8gMTI4O1xuXHRjb250ZXh0LmZpbGxUZXh0KGNoYXJTdHJpbmcsIDAsIGNhbnZhcy5oZWlnaHQgLSB5T2Zmc2V0KTtcblxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcblx0dGhpcy5udW1DaGFycyA9IGNoYXJTdHJpbmcubGVuZ3RoO1xuXHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFzY2lpR3JhZGllbnQ7XG4iLCIvKiBGYWN0b3J5IHBhdHRlcm4gZm9yIGNyZWF0aW5nIGVmZmVjdHNcbmh0dHA6Ly9qYXZhc2NyaXB0LmluZm8vdHV0b3JpYWwvZmFjdG9yeS1jb25zdHJ1Y3Rvci1wYXR0ZXJuXG4qL1xuXG52YXIgYXNjaWkgPSByZXF1aXJlKCcuL0FzY2lpR3JhZGllbnQuanMnKTtcbnZhciB0O1xuXG5mdW5jdGlvbiBFZmZlY3RDaGFpbih0eXBlLCByZW5kZXJlciwgdGV4dHVyZSl7XG5cdCAgLy8gVGhyb3cgYW4gZXJyb3IgaWYgbm8gY29uc3RydWN0b3IgZm9yIHRoZSBnaXZlbiBhdXRvbW9iaWxlXG4gICAgXG4gICAgLy9yZXR1cm4gZXZhbChcIm5ldyBcIiArIHR5cGUrXCIoXCIrcmVuZGVyZXIrXCIpXCIpO1xuXG4gICAgdmFyIG5ld0VmZiA9IGV2YWwoXCJuZXcgXCIrdHlwZStcIihyZW5kZXJlciwgdGV4dHVyZSlcIik7XG4gICAgcmV0dXJuIG5ld0VmZjtcbn1cblxuXG5cbnZhciBSZ2JEb3RzID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHRjb25zb2xlLmxvZyhcInJnYiBjYWxsZWRcIik7XG5cdHRoaXMuY29tcG9zZXIgPSBuZXcgVEhSRUUuRWZmZWN0Q29tcG9zZXIoIHJlbmRlcmVyICk7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggbmV3IFRIUkVFLlRleHR1cmVQYXNzKCB0ZXh0dXJlLCAxLjAgKSk7XG5cdHRoaXMuZG90U2NyZWVuRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkRvdFNjcmVlblNoYWRlciApO1xuXHR0aGlzLmRvdFNjcmVlbkVmZmVjdC51bmlmb3Jtc1sgJ3NjYWxlJyBdLnZhbHVlID0gMC44O1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuZG90U2NyZWVuRWZmZWN0ICk7XG5cdHRoaXMucmdiRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLlJHQlNoaWZ0U2hhZGVyICk7XG5cdHRoaXMucmdiRWZmZWN0LnVuaWZvcm1zWyAnYW1vdW50JyBdLnZhbHVlID0gMC4wMDE1O1xuXHR0aGlzLnJnYkVmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5yZ2JFZmZlY3QpO1xufVxuXG5SZ2JEb3RzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblx0Ly90aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHR0aGlzLmRvdFNjcmVlbkVmZmVjdC51bmlmb3Jtc1sgJ3NjYWxlJyBdLnZhbHVlID0geCozIDtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSB5IDtcblx0dGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcblxufVxuXG52YXIgS2FsZWlkb3Njb3BlID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkthbGVpZG9FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuS2FsZWlkb1NoYWRlcik7XG5cdC8vdGhpcy5LYWxlaWRvRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkthbGVpZG9FZmZlY3QpO1xuXHR0aGlzLkNvbG9yRWZmZWN0ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkh1ZVNhdHVyYXRpb25TaGFkZXIpO1xuXHR0aGlzLkNvbG9yRWZmZWN0LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkNvbG9yRWZmZWN0KTtcbn1cblxuS2FsZWlkb3Njb3BlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHZhciBzaWRlcyA9IE1hdGguY2VpbCh4KjEwKTtcblx0dGhpcy5LYWxlaWRvRWZmZWN0LnVuaWZvcm1zWyAnc2lkZXMnIF0udmFsdWUgPSB4Kjc7XG5cdHRoaXMuS2FsZWlkb0VmZmVjdC51bmlmb3Jtc1sgJ29mZnNldCcgXS52YWx1ZSA9IHkqODtcblx0dGhpcy5Db2xvckVmZmVjdC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IE1hdGguY29zKGZyYW1lKjAuMDEpO1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgS2FsZWlkb0NvbG9yID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkthbGVpZG9FZmZlY3QgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuS2FsZWlkb1dhcnBTaGFkZXIpO1xuXHQvL3RoaXMuS2FsZWlkb0VmZmVjdC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5LYWxlaWRvRWZmZWN0KTtcblx0dGhpcy5Db2xvckVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5Db2xvckVmZmVjdFNoYWRlcik7XG5cdC8vdGhpcy5Db2xvckVmZmVjdC51bmlmb3Jtc1sgJ3NhdHVyYXRpb24nIF0udmFsdWUgPSAxLjA7XG5cdHRoaXMuQ29sb3JFZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQ29sb3JFZmZlY3QpO1xufVxuXG5LYWxlaWRvQ29sb3IucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKXtcblx0dmFyIHNpZGVzID0gTWF0aC5jZWlsKHgqMTApO1xuXHR0aGlzLkthbGVpZG9FZmZlY3QudW5pZm9ybXNbICdzaWRlcycgXS52YWx1ZSA9IHgqNztcblx0dGhpcy5LYWxlaWRvRWZmZWN0LnVuaWZvcm1zWyAnb2Zmc2V0JyBdLnZhbHVlID0geSo2O1xuXHR0aGlzLkNvbG9yRWZmZWN0LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0gTWF0aC5jb3MoZnJhbWUqMC4wMDQpO1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgRmlsbSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblxuXHR0aGlzLnJnYkVmZmVjdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5Db2xvckV4cGVyaW1lbnRTaGFkZXIgKTtcblx0dGhpcy5yZ2JFZmZlY3QudW5pZm9ybXNbICdhbW91bnQnIF0udmFsdWUgPSAwLjAwMTU7XG5cdC8vdGhpcy5yZ2JFZmZlY3QucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLkV4cGVyaW1lbnQgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuSHVlU2F0dXJhdGlvblNoYWRlcik7XG5cdHRoaXMuRXhwZXJpbWVudC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdFxuXG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5yZ2JFZmZlY3QpO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuRXhwZXJpbWVudCApO1xufVxuXG5GaWxtLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5KXtcblxuXHR0aGlzLnJnYkVmZmVjdC51bmlmb3Jtc1sgJ2Ftb3VudCcgXS52YWx1ZSA9IDAuNS14O1xuXHR0aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbICdodWUnIF0udmFsdWUgPSB5KjIuMCAtIDEuMDtcblx0XHQvLyBzY2FubGluZXMgZWZmZWN0IGludGVuc2l0eSB2YWx1ZSAoMCA9IG5vIGVmZmVjdCwgMSA9IGZ1bGwgZWZmZWN0KVxuXHRcdFxuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgRGlmZmVyZW5jZSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblxuXHR0aGlzLkRpZmZlcmVuY2UgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyggVEhSRUUuRGlmZmVyZW5jZU1pcnJvclNoYWRlcik7XG5cdFxuXHQvL3RoaXMuRGlmZmVyZW5jZS5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdFx0dGhpcy5Db250cmFzdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5CcmlnaHRuZXNzQ29udHJhc3RTaGFkZXIpO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0gMC4wO1xuXHR0aGlzLkNvbnRyYXN0LnVuaWZvcm1zWydicmlnaHRuZXNzJ10udmFsdWUgPSAwLjI7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5Db250cmFzdCApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuRGlmZmVyZW5jZSk7XG5cdHRoaXMuRXhwZXJpbWVudCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5IdWVTYXR1cmF0aW9uU2hhZGVyKTtcblx0dGhpcy5FeHBlcmltZW50LnJlbmRlclRvU2NyZWVuID0gdHJ1ZTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCB0aGlzLkV4cGVyaW1lbnQgKTtcblx0XG59XG5cbkRpZmZlcmVuY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHQvL3RoaXMuRGlmZmVyZW5jZS51bmlmb3Jtc1sgJ3NpZGVzJyBdLnZhbHVlID0geCoxMDtcblx0dGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnaHVlJyBdLnZhbHVlID0geCoyLjAgLSAxLjA7XG5cdHRoaXMuQ29udHJhc3QudW5pZm9ybXNbJ2NvbnRyYXN0J10udmFsdWUgPSB5O1xuXHQvL3RoaXMuQ29udHJhc3QudW5pZm9ybXNbJ2JyaWdodG5lc3MnXS52YWx1ZSA9ICB5KjIuMCAtIDEuMDtcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdtaXhSYXRpbycgXS52YWx1ZSA9IHk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG5cbnZhciBBc2NpaSA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dmFyIGNoYXJhY3RlcnMgPSBuZXcgYXNjaWkoKTtcblx0Ly8gY2hhcmFjdGVycy5jYW52YXMud2lkdGggPSBjaGFyYWN0ZXJzLmNhbnZhcy5oZWlnaHQgPSAxMjg7XG5cdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjaGFyYWN0ZXJzLmNhbnZhcyk7XG5cdC8vdCA9IGluaXRUZXh0dXJlKGNoYXJhY3RlcnMuY2FudmFzKTtcbnQ9IG5ldyBUSFJFRS5UZXh0dXJlKCBjaGFyYWN0ZXJzLmNhbnZhcyk7XG5cdC8vY29uc29sZS5sb2codCk7XG5cdHQubmVlZHNVcGRhdGU9dHJ1ZTtcblx0dmFyIHdvb2RUZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggJ3RleHR1cmVzL2NyYXRlLmdpZicgKTtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb250cmFzdCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5CcmlnaHRuZXNzQ29udHJhc3RTaGFkZXIpO1xuXHR0aGlzLmNvbnRyYXN0LnVuaWZvcm1zWydjb250cmFzdCddLnZhbHVlID0gMC43O1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuY29udHJhc3QgKTtcblx0dGhpcy5Bc2NpaSA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5Bc2NpaVNoYWRlcik7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbJ3REaWZmdXNlMiddLnZhbHVlID0gdDtcblx0dGhpcy5Bc2NpaS5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuQXNjaWkudW5pZm9ybXNbJ251bUNoYXJzJ10udmFsdWUgPSBjaGFyYWN0ZXJzLm51bUNoYXJzO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuQXNjaWkpO1xufVxuXG5Bc2NpaS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oeCwgeSl7XG5cdHZhciBjb2xzID0gTWF0aC5mbG9vcih4ICogMTUwKTtcbi8vXHR0ZXgubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHR0aGlzLkFzY2lpLnVuaWZvcm1zWyAncm93cycgXS52YWx1ZSA9IGNvbHMgKiB3aW5kb3cuaW5uZXJIZWlnaHQgLyB3aW5kb3cuaW5uZXJXaWR0aDtcblx0dGhpcy5Bc2NpaS51bmlmb3Jtc1sgJ2NvbHMnIF0udmFsdWUgPSBjb2xzO1xuXHR0aGlzLmNvbnRyYXN0LnVuaWZvcm1zIFsnY29udHJhc3QnXS52YWx1ZSA9IHk7XG5cdFxuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgQ2hlY2tlcmJvYXJkID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkNoZWNrZXJib2FyZCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5DaGVja2VyYm9hcmRTaGFkZXIpO1xuXHR0aGlzLkNoZWNrZXJib2FyZC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5DaGVja2VyYm9hcmQpO1xufVxuXG5DaGVja2VyYm9hcmQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHkpe1xuXHR0aGlzLkNoZWNrZXJib2FyZC51bmlmb3Jtc1sgJ3dpZHRoJyBdLnZhbHVlID0gMi4wIC0geCoyLjA7XG5cdHRoaXMuQ2hlY2tlcmJvYXJkLnVuaWZvcm1zWyAnaGVpZ2h0JyBdLnZhbHVlID0gMi4wIC0geSoyLjA7XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG52YXIgR2xhc3NXYXJwID0gZnVuY3Rpb24ocmVuZGVyZXIsIHRleHR1cmUpe1xuXHR0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKCByZW5kZXJlciApO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIG5ldyBUSFJFRS5UZXh0dXJlUGFzcyggdGV4dHVyZSwgMS4wICkpO1xuXHR0aGlzLkdsYXNzV2FycCA9IG5ldyBUSFJFRS5TaGFkZXJQYXNzKCBUSFJFRS5HbGFzc1dhcnBTaGFkZXIpO1xuXHR0aGlzLkdsYXNzV2FycC5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cdHRoaXMuY29tcG9zZXIuYWRkUGFzcyggdGhpcy5HbGFzc1dhcnApO1xuXG5cdC8vdGhpcy5jb21wb3Nlci5hZGRQYXNzKCBjb250cmFzdCApO1xufVxuXG5HbGFzc1dhcnAucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKXtcblx0dGhpcy5HbGFzc1dhcnAudW5pZm9ybXNbICdtb3VzZVgnIF0udmFsdWUgPSB4O1xuXHR0aGlzLkdsYXNzV2FycC51bmlmb3Jtc1sgJ21vdXNlWScgXS52YWx1ZSA9IHk7XG5cdHRoaXMuR2xhc3NXYXJwLnVuaWZvcm1zWyAnbWFnJyBdLnZhbHVlID0gNDAqTWF0aC5zaW4oZnJhbWUqMC4wMDIpO1xuXHQvL3RoaXMuQ29sb3JFZmZlY3QudW5pZm9ybXNbICdodWUnIF0udmFsdWUgPSBNYXRoLmNvcyhmcmFtZSowLjAxKTtcblx0Ly90aGlzLkRpZmZlcmVuY2UudW5pZm9ybXNbICdtaXhSYXRpbycgXS52YWx1ZSA9IHk7XG5cdHRoaXMuY29tcG9zZXIucmVuZGVyKCk7XG59XG52YXIgRXhwZXJpbWVudCA9IGZ1bmN0aW9uKHJlbmRlcmVyLCB0ZXh0dXJlKXtcblx0dGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlciggcmVuZGVyZXIgKTtcblx0dGhpcy5jb21wb3Nlci5hZGRQYXNzKCBuZXcgVEhSRUUuVGV4dHVyZVBhc3MoIHRleHR1cmUsIDEuMCApKTtcblx0dGhpcy5FeHBlcmltZW50ID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkh1ZVNhdHVyYXRpb25TaGFkZXIpO1xuXHR0aGlzLkV4cGVyaW1lbnQucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXHR0aGlzLmNvbXBvc2VyLmFkZFBhc3MoIHRoaXMuRXhwZXJpbWVudCApO1xufVxuXG5FeHBlcmltZW50LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbih4LCB5LCBmcmFtZSl7XG5cdHRoaXMuRXhwZXJpbWVudC51bmlmb3Jtc1sgJ2h1ZScgXS52YWx1ZSA9IHgqMi4wIC0gMS4wO1xuXHR0aGlzLkV4cGVyaW1lbnQudW5pZm9ybXNbICdzYXR1cmF0aW9uJyBdLnZhbHVlID0geSoxLjIgLSAwLjI7XG5cdC8vdGhpcy5FeHBlcmltZW50LnVuaWZvcm1zWyAnbW91c2VZJyBdLnZhbHVlID0geTtcblx0XG5cdC8vdGhpcy5EaWZmZXJlbmNlLnVuaWZvcm1zWyAnbWl4UmF0aW8nIF0udmFsdWUgPSB5O1xuXHR0aGlzLmNvbXBvc2VyLnJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBpbml0VGV4dHVyZShjYW52YXMpe1xuXHR2YXIgdGV4ID0gbmV3IFRIUkVFLlRleHR1cmUoIGNhbnZhcyApO1xuXHQvL25lZWRlZCBiZWNhdXNlIGNhbnQgZW5zdXJlIHRoYXQgdmlkZW8gaGFzIHBvd2VyIG9mIHR3byBkaW1lbnNpb25zXG5cdC8vdGV4LndyYXBTID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcbi8vXHR0ZXgud3JhcFQgPSBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nO1xuXHR0ZXgubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHR0ZXgubWFnRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHRyZXR1cm4gdGV4O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVmZmVjdENoYWluO1xuXHQiLCJcbnZhciBnaWZXaWR0aCA9IDYwMDtcblxudmFyIEdlbmVyYXRlR2lmID0gZnVuY3Rpb24oZWxlbWVudCwgbnVtRnJhbWVzLCBlZmZlY3RDaGFpbil7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb3JkaW5nXCIpLnNyYyA9IFwidGV4dHVyZXMvcGxheWVyX3JlY29yZC5wbmdcIjtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuXHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdHRoaXMuY2FudmFzLndpZHRoID0gZ2lmV2lkdGg7XG5cdHRoaXMuY2FudmFzLmhlaWdodCA9IGdpZldpZHRoKmVsZW1lbnQuaGVpZ2h0L2VsZW1lbnQud2lkdGg7XG5cdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblx0dGhpcy5udW1GcmFtZXMgPSBudW1GcmFtZXM7XG5cdHRoaXMuZnJhbWVJbmRleCA9IDA7XG5cdHRoaXMuZ2lmID0gbmV3IEdJRih7XG4gIFx0XHR3b3JrZXJzOiAyLFxuICBcdFx0cXVhbGl0eTogMTAwXG5cdH0pO1xuXHR0aGlzLmdpZi5vbignZmluaXNoZWQnLCBmdW5jdGlvbihibG9iKSB7XG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNvcmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG5cdCAgd2luZG93Lm9wZW4oVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG5cdH0pO1xuXG59XG5cbkdlbmVyYXRlR2lmLnByb3RvdHlwZS5hZGRGcmFtZSA9IGZ1bmN0aW9uKGVsZW1lbnQpe1xuXHR0aGlzLmZyYW1lSW5kZXgrKztcblx0aWYodGhpcy5mcmFtZUluZGV4ID49IHRoaXMubnVtRnJhbWVzKXtcblx0XHR0aGlzLmZpbmlzaCgpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSBlbHNlIHtcblx0dGhpcy5jb250ZXh0LmRyYXdJbWFnZSggZWxlbWVudCwgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG5cdHRoaXMuZ2lmLmFkZEZyYW1lKHRoaXMuY2FudmFzLCB7Y29weTogdHJ1ZSwgZGVsYXk6MTUwfSk7XG5cdHRoaXMuZnJhbWVJbmRleCsrO1xuXHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcblxuR2VuZXJhdGVHaWYucHJvdG90eXBlLmZpbmlzaCA9IGZ1bmN0aW9uKCl7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjb3JkaW5nXCIpLnNyYyA9IFwidGV4dHVyZXMvYWpheC1sb2FkZXIuZ2lmXCI7XG5cdC8vcmVuZGVyaW5nR2lmID0gZmFsc2U7XG5cdHRoaXMuZ2lmLnJlbmRlcigpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmF0ZUdpZjtcbiIsInZhciByZW5kZXJlciwgZWZmZWN0Q2hhaW4sIHRleHR1cmUxLCBtb3VzZVgsIG1vdXNlWSwgbG9jYWxWaWQ7XG52YXIgZ2V0VXNlck1lZGlhID0gcmVxdWlyZSgnZ2V0dXNlcm1lZGlhJyk7XG52YXIgRWZmZWN0Q2hhaW4gPSByZXF1aXJlKCcuL2pzL0VmZmVjdENoYWluLmpzJyk7XG52YXIgR2VuZXJhdGVHaWYgPSByZXF1aXJlKCcuL2pzL0dlbmVyYXRlR2lmLmpzJyk7XG5cbnZhciBnaWZGcmFtZXMgPSAwO1xudmFyIGVmZmVjdHMgPSBbXCJLYWxlaWRvQ29sb3JcIiwgIFwiR2xhc3NXYXJwXCIsICBcIkZpbG1cIiwgIFwiQXNjaWlcIiwgXCJEaWZmZXJlbmNlXCIsICBcIkNoZWNrZXJib2FyZFwiIF07XG52YXIgZWZmZWN0SW5kZXggPSAwO1xudmFyIHJlbmRlcmluZ0dpZiA9IGZhbHNlO1xudmFyIGN1cnJlbnRHaWY7XG52YXIgZnJhbWVDb3VudCA9IDA7XG5tb3VzZVggPSBtb3VzZVkgPSAxO1xudmFyIGdldEltYWdlRGF0YSA9IGZhbHNlO1xudmFyIGxvY2FsVmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZGVvT2JqJyk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG9uTW91c2VNb3ZlKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGhpZGVJbnRybyk7XG5kb2N1bWVudC5vbmtleWRvd24gPSBjaGVja0tleTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgb25XaW5kb3dSZXNpemUsIGZhbHNlICk7XG5cblxuXG5mdW5jdGlvbiBhc2tGb3JNZWRpYSgpe1xuLy9zID0gbmV3IExvY2FsU3RyZWFtKGxvY2FsVmlkKTtcbmdldFVzZXJNZWRpYSh7dmlkZW86IHRydWUsIGF1ZGlvOiBmYWxzZX0sIGZ1bmN0aW9uIChlcnIsIHN0cmVhbSkge1xuICAgIC8vIGlmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB1c2VyIG1lZGlhXG4gICAgLy8gb3IgdGhlIHVzZXIgc2F5cyBcIm5vXCIgdGhlIGVycm9yIGdldHMgcGFzc2VkXG4gICAgLy8gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgIGlmIChlcnIpIHtcbiAgICAgICAvL2NvbnNvbGUubG9nKCdmYWlsZWQgJyk7XG4gICAgICAgY29uc29sZS5sb2coZXJyKTtcblxuICAgICAgLyogaWYoZXJyLm5hbWUgPT0gXCJOb3RTdXBwb3J0ZWRFcnJvclwiKXtcbiAgICAgICBcdCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJsaW5reVwiKS5pbm5lckhUTUwgPSBcIm5vIGNhbWVyYSBhdmFpbGFibGUgOlsgdHJ5IHVzaW5nIENocm9tZSBvciBGaXJlZm94XCI7XG4gICAgICAgfSBlbHNlIHsqL1xuICAgICAgIFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibGlua3lcIikuaW5uZXJIVE1MID0gXCJubyBjYW1lcmEgYXZhaWxhYmxlIDpbXCI7XG4gICAgICAvLyB9XG5cbiAgICB9IGVsc2Uge1xuICAvLyAgIFx0aWYgKHdpbmRvdy5VUkwpXG5cdC8vIHsgICBsb2NhbFZpZC5zcmMgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAvLyB9XG4gICAgICBsb2NhbFZpZC5zcmNPYmplY3QgPSBzdHJlYW1cbiAgICAgICBjb25zb2xlLmxvZygnZ290IGEgc3RyZWFtJywgc3RyZWFtKTtcbiAgICAgICB0ZXh0dXJlMSA9IGluaXRWaWRlb1RleHR1cmUobG9jYWxWaWQpO1xuICAgICAgIHRvZ2dsZUluc3RydWN0aW9ucygpO1xuICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmxpbmt5XCIpLnN0eWxlLmNvbG9yID0gJyMwMDAnO1xuICAgICAgIGVmZmVjdEluZGV4PTA7XG4gICAgICAgZWZmZWN0Q2hhaW4gPSBFZmZlY3RDaGFpbihlZmZlY3RzW2VmZmVjdEluZGV4XSwgcmVuZGVyZXIsIHRleHR1cmUxKTtcbiAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgXHRcdGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9PSBcInZpc2libGVcIil7XG4gICAgICAgXHRcdFx0dG9nZ2xlSW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgXHRcdH1cbiAgICAgICB9LCA1MDAwKTtcbiAgICB9XG59KTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlSW5zdHJ1Y3Rpb25zKCl7XG5cdHZhciB0b2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9PSBcInZpc2libGVcIiA/ICBcImhpZGRlblwiOiBcInZpc2libGVcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3RydWN0aW9uc1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSB0b2dnbGU7XG5cbn1cbmluaXRXZWJHTCgpO1xuXG5mdW5jdGlvbiBpbml0V2ViR0woKXtcblx0cmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuXHRyZW5kZXJlci5zZXRQaXhlbFJhdGlvKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyApO1xuXHRyZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJy0yMCc7XG5cdHRleHR1cmUxID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSggXCJ0ZXh0dXJlcy9saW5lcy5wbmdcIiApO1xuXG5cdGluaXRFZmZlY3RzKCk7XG5cblx0cmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGluaXRWaWRlb1RleHR1cmUodmlkKXtcblx0dmFyIHRleCA9IG5ldyBUSFJFRS5UZXh0dXJlKCB2aWQgKTtcblx0Ly9uZWVkZWQgYmVjYXVzZSBjYW50IGVuc3VyZSB0aGF0IHZpZGVvIGhhcyBwb3dlciBvZiB0d28gZGltZW5zaW9uc1xuXHR0ZXgud3JhcFMgPSBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nO1xuXHR0ZXgud3JhcFQgPSBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nO1xuXHR0ZXgubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHR0ZXgubWFnRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuXHRyZXR1cm4gdGV4O1xufVxuXG5mdW5jdGlvbiBpbml0RWZmZWN0cygpe1xuXHRlZmZlY3RDaGFpbiA9IEVmZmVjdENoYWluKGVmZmVjdHNbZWZmZWN0SW5kZXhdLCByZW5kZXJlciwgdGV4dHVyZTEpO1xufVxuXG5cblxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKXtcblx0bW91c2VYID0gZS5wYWdlWDtcblx0bW91c2VZID0gZS5wYWdlWTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHJlbmRlciApO1xuXHRmcmFtZUNvdW50Kys7XG5cdHRleHR1cmUxLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblx0ZWZmZWN0Q2hhaW4ucmVuZGVyKG1vdXNlWC93aW5kb3cuaW5uZXJXaWR0aCwgbW91c2VZL3dpbmRvdy5pbm5lckhlaWdodCwgZnJhbWVDb3VudCk7XG5cdGlmKHJlbmRlcmluZ0dpZil7XG5cdFx0aWYoZnJhbWVDb3VudCU1PT0wKXtcblx0XHRcdHJlbmRlcmluZ0dpZiA9IGN1cnJlbnRHaWYuYWRkRnJhbWUocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplKCkge1xuXG5cdFx0XHRcdHJlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcblxuXHRcdFx0fVxuXG5mdW5jdGlvbiBoaWRlSW50cm8oKXtcblx0dmFyIGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIik7XG5cdHZhciBkX25lc3RlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XG5cdHZhciB0aHJvd2F3YXlOb2RlID0gZC5yZW1vdmVDaGlsZChkX25lc3RlZCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5zdHJ1Y3Rpb25zXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcblx0YXNrRm9yTWVkaWEoKTtcblx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgaGlkZUludHJvKTtcbn1cblxuXG5cbmZ1bmN0aW9uIGNoZWNrS2V5KGUpe1xuXHQgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXG5cdCAvL1Rha2Ugc2NyZWVuc2hvdFxuXHRpZihlLmtleUNvZGUgPT0gIDgzKXtcblx0XHRlZmZlY3RDaGFpbi5yZW5kZXIobW91c2VYL3dpbmRvdy5pbm5lcldpZHRoLCBtb3VzZVkvd2luZG93LmlubmVySGVpZ2h0LCBmcmFtZUNvdW50KTtcblx0XHR2YXIgaW1nRGF0YSA9IHJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG5cdFx0d2luZG93Lm9wZW4oaW1nRGF0YSk7XG5cdC8vcmVuZGVyIGdpZlxuXHR9IGVsc2UgaWYoZS5rZXlDb2RlID09ICA3MSl7XG5cdFx0cmVuZGVyaW5nR2lmID0gdHJ1ZTtcblx0XHRlZmZlY3RDaGFpbi5yZW5kZXIobW91c2VYL3dpbmRvdy5pbm5lcldpZHRoLCBtb3VzZVkvd2luZG93LmlubmVySGVpZ2h0LCBmcmFtZUNvdW50KTtcblx0XHRjdXJyZW50R2lmID0gbmV3IEdlbmVyYXRlR2lmKHJlbmRlcmVyLmRvbUVsZW1lbnQsIDUwLCBlZmZlY3RDaGFpbik7XG5cdC8vZ28gdG8gbmV4dCBlZmZlY3RcbiAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM3Jykge1xuICAgIFx0ZWZmZWN0SW5kZXgtLTtcbiAgICBcdCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3RydWN0aW9uc1wiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhbmRpbmdcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgXHRpZihlZmZlY3RJbmRleCA8IDApIGVmZmVjdEluZGV4ID0gZWZmZWN0cy5sZW5ndGgtMTtcbiAgICBcdGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG4gICAgfVxuICAgIC8vZ28gdG8gcHJldmlvdXMgZWZmZWN0XG4gICAgZWxzZSBpZiAoZS5rZXlDb2RlID09ICczOScpIHtcbiAgICBcdGVmZmVjdEluZGV4Kys7XG4gICAgXHQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnN0cnVjdGlvbnNcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5kaW5nXCIpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIFx0aWYoZWZmZWN0SW5kZXggPj0gZWZmZWN0cy5sZW5ndGgpIGVmZmVjdEluZGV4ID0gMDtcbiAgICBcdGVmZmVjdENoYWluID0gRWZmZWN0Q2hhaW4oZWZmZWN0c1tlZmZlY3RJbmRleF0sIHJlbmRlcmVyLCB0ZXh0dXJlMSk7XG4gICAgLy90b2dnbGUgaW5zdHJ1Y3Rpb25zXG4gICAgfSBlbHNlIGlmIChlLmtleUNvZGU9PSc3Mycpe1xuICAgIFx0dG9nZ2xlSW5zdHJ1Y3Rpb25zKCk7XG4gICAgfVxuXG59XG4iLCIvLyBnZXRVc2VyTWVkaWEgaGVscGVyIGJ5IEBIZW5yaWtKb3JldGVnIHVzZWQgZm9yIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgc2hpbVxudmFyIGFkYXB0ZXIgPSByZXF1aXJlKCd3ZWJydGMtYWRhcHRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25zdHJhaW50cywgY2IpIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgdmFyIGhhdmVPcHRzID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMjtcbiAgICB2YXIgZGVmYXVsdE9wdHMgPSB7dmlkZW86IHRydWUsIGF1ZGlvOiB0cnVlfTtcblxuICAgIHZhciBkZW5pZWQgPSAnUGVybWlzc2lvbkRlbmllZEVycm9yJztcbiAgICB2YXIgYWx0RGVuaWVkID0gJ1BFUk1JU1NJT05fREVOSUVEJztcbiAgICB2YXIgbm90U2F0aXNmaWVkID0gJ0NvbnN0cmFpbnROb3RTYXRpc2ZpZWRFcnJvcic7XG5cbiAgICAvLyBtYWtlIGNvbnN0cmFpbnRzIG9wdGlvbmFsXG4gICAgaWYgKCFoYXZlT3B0cykge1xuICAgICAgICBjYiA9IGNvbnN0cmFpbnRzO1xuICAgICAgICBjb25zdHJhaW50cyA9IGRlZmF1bHRPcHRzO1xuICAgIH1cblxuICAgIC8vIHRyZWF0IGxhY2sgb2YgYnJvd3NlciBzdXBwb3J0IGxpa2UgYW4gZXJyb3JcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcgfHwgIW5hdmlnYXRvci5nZXRVc2VyTWVkaWEpIHtcbiAgICAgICAgLy8gdGhyb3cgcHJvcGVyIGVycm9yIHBlciBzcGVjXG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdNZWRpYVN0cmVhbUVycm9yJyk7XG4gICAgICAgIGVycm9yLm5hbWUgPSAnTm90U3VwcG9ydGVkRXJyb3InO1xuXG4gICAgICAgIC8vIGtlZXAgYWxsIGNhbGxiYWNrcyBhc3luY1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYihlcnJvcik7XG4gICAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIC8vIG5vcm1hbGl6ZSBlcnJvciBoYW5kbGluZyB3aGVuIG5vIG1lZGlhIHR5cGVzIGFyZSByZXF1ZXN0ZWRcbiAgICBpZiAoIWNvbnN0cmFpbnRzLmF1ZGlvICYmICFjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignTWVkaWFTdHJlYW1FcnJvcicpO1xuICAgICAgICBlcnJvci5uYW1lID0gJ05vTWVkaWFSZXF1ZXN0ZWRFcnJvcic7XG5cbiAgICAgICAgLy8ga2VlcCBhbGwgY2FsbGJhY2tzIGFzeW5jXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNiKGVycm9yKTtcbiAgICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpXG4gICAgLnRoZW4oZnVuY3Rpb24gKHN0cmVhbSkge1xuICAgICAgICBjYihudWxsLCBzdHJlYW0pO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIGVycm9yO1xuICAgICAgICAvLyBjb2VyY2UgaW50byBhbiBlcnJvciBvYmplY3Qgc2luY2UgRkYgZ2l2ZXMgdXMgYSBzdHJpbmdcbiAgICAgICAgLy8gdGhlcmUgYXJlIG9ubHkgdHdvIHZhbGlkIG5hbWVzIGFjY29yZGluZyB0byB0aGUgc3BlY1xuICAgICAgICAvLyB3ZSBjb2VyY2UgYWxsIG5vbi1kZW5pZWQgdG8gXCJjb25zdHJhaW50IG5vdCBzYXRpc2ZpZWRcIi5cbiAgICAgICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignTWVkaWFTdHJlYW1FcnJvcicpO1xuICAgICAgICAgICAgaWYgKGVyciA9PT0gZGVuaWVkIHx8IGVyciA9PT0gYWx0RGVuaWVkKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IubmFtZSA9IGRlbmllZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3IubmFtZSA9IG5vdFNhdGlzZmllZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGdldCBhbiBlcnJvciBvYmplY3QgbWFrZSBzdXJlICcubmFtZScgcHJvcGVydHkgaXMgc2V0XG4gICAgICAgICAgICAvLyBhY2NvcmRpbmcgdG8gc3BlYzogaHR0cDovL2Rldi53My5vcmcvMjAxMS93ZWJydGMvZWRpdG9yL2dldHVzZXJtZWRpYS5odG1sI25hdmlnYXRvcnVzZXJtZWRpYWVycm9yLWFuZC1uYXZpZ2F0b3J1c2VybWVkaWFlcnJvcmNhbGxiYWNrXG4gICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIGlmICghZXJyb3IubmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgbGlrZWx5IGNocm9tZSB3aGljaFxuICAgICAgICAgICAgICAgIC8vIHNldHMgYSBwcm9wZXJ0eSBjYWxsZWQgXCJFUlJPUl9ERU5JRURcIiBvbiB0aGUgZXJyb3Igb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gaWYgc28gd2UgbWFrZSBzdXJlIHRvIHNldCBhIG5hbWVcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JbZGVuaWVkXSkge1xuICAgICAgICAgICAgICAgICAgICBlcnIubmFtZSA9IGRlbmllZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnIubmFtZSA9IG5vdFNhdGlzZmllZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYihlcnJvcik7XG4gICAgfSk7XG59O1xuIiwiIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBTRFAgaGVscGVycy5cbnZhciBTRFBVdGlscyA9IHt9O1xuXG4vLyBHZW5lcmF0ZSBhbiBhbHBoYW51bWVyaWMgaWRlbnRpZmllciBmb3IgY25hbWUgb3IgbWlkcy5cbi8vIFRPRE86IHVzZSBVVUlEcyBpbnN0ZWFkPyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9qZWQvOTgyODgzXG5TRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCAxMCk7XG59O1xuXG4vLyBUaGUgUlRDUCBDTkFNRSB1c2VkIGJ5IGFsbCBwZWVyY29ubmVjdGlvbnMgZnJvbSB0aGUgc2FtZSBKUy5cblNEUFV0aWxzLmxvY2FsQ05hbWUgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcblxuLy8gU3BsaXRzIFNEUCBpbnRvIGxpbmVzLCBkZWFsaW5nIHdpdGggYm90aCBDUkxGIGFuZCBMRi5cblNEUFV0aWxzLnNwbGl0TGluZXMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHJldHVybiBibG9iLnRyaW0oKS5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gbGluZS50cmltKCk7XG4gIH0pO1xufTtcbi8vIFNwbGl0cyBTRFAgaW50byBzZXNzaW9ucGFydCBhbmQgbWVkaWFzZWN0aW9ucy4gRW5zdXJlcyBDUkxGLlxuU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgdmFyIHBhcnRzID0gYmxvYi5zcGxpdCgnXFxubT0nKTtcbiAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbihwYXJ0LCBpbmRleCkge1xuICAgIHJldHVybiAoaW5kZXggPiAwID8gJ209JyArIHBhcnQgOiBwYXJ0KS50cmltKCkgKyAnXFxyXFxuJztcbiAgfSk7XG59O1xuXG4vLyBSZXR1cm5zIGxpbmVzIHRoYXQgc3RhcnQgd2l0aCBhIGNlcnRhaW4gcHJlZml4LlxuU0RQVXRpbHMubWF0Y2hQcmVmaXggPSBmdW5jdGlvbihibG9iLCBwcmVmaXgpIHtcbiAgcmV0dXJuIFNEUFV0aWxzLnNwbGl0TGluZXMoYmxvYikuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gbGluZS5pbmRleE9mKHByZWZpeCkgPT09IDA7XG4gIH0pO1xufTtcblxuLy8gUGFyc2VzIGFuIElDRSBjYW5kaWRhdGUgbGluZS4gU2FtcGxlIGlucHV0OlxuLy8gY2FuZGlkYXRlOjcwMjc4NjM1MCAyIHVkcCA0MTgxOTkwMiA4LjguOC44IDYwNzY5IHR5cCByZWxheSByYWRkciA4LjguOC44XG4vLyBycG9ydCA1NTk5NlwiXG5TRFBVdGlscy5wYXJzZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzO1xuICAvLyBQYXJzZSBib3RoIHZhcmlhbnRzLlxuICBpZiAobGluZS5pbmRleE9mKCdhPWNhbmRpZGF0ZTonKSA9PT0gMCkge1xuICAgIHBhcnRzID0gbGluZS5zdWJzdHJpbmcoMTIpLnNwbGl0KCcgJyk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHMgPSBsaW5lLnN1YnN0cmluZygxMCkuc3BsaXQoJyAnKTtcbiAgfVxuXG4gIHZhciBjYW5kaWRhdGUgPSB7XG4gICAgZm91bmRhdGlvbjogcGFydHNbMF0sXG4gICAgY29tcG9uZW50OiBwYXJ0c1sxXSxcbiAgICBwcm90b2NvbDogcGFydHNbMl0udG9Mb3dlckNhc2UoKSxcbiAgICBwcmlvcml0eTogcGFyc2VJbnQocGFydHNbM10sIDEwKSxcbiAgICBpcDogcGFydHNbNF0sXG4gICAgcG9ydDogcGFyc2VJbnQocGFydHNbNV0sIDEwKSxcbiAgICAvLyBza2lwIHBhcnRzWzZdID09ICd0eXAnXG4gICAgdHlwZTogcGFydHNbN11cbiAgfTtcblxuICBmb3IgKHZhciBpID0gODsgaSA8IHBhcnRzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgc3dpdGNoIChwYXJ0c1tpXSkge1xuICAgICAgY2FzZSAncmFkZHInOlxuICAgICAgICBjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MgPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncnBvcnQnOlxuICAgICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQgPSBwYXJzZUludChwYXJ0c1tpICsgMV0sIDEwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0Y3B0eXBlJzpcbiAgICAgICAgY2FuZGlkYXRlLnRjcFR5cGUgPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gZXh0ZW5zaW9uIGhhbmRsaW5nLCBpbiBwYXJ0aWN1bGFyIHVmcmFnXG4gICAgICAgIGNhbmRpZGF0ZVtwYXJ0c1tpXV0gPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2FuZGlkYXRlO1xufTtcblxuLy8gVHJhbnNsYXRlcyBhIGNhbmRpZGF0ZSBvYmplY3QgaW50byBTRFAgY2FuZGlkYXRlIGF0dHJpYnV0ZS5cblNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gIHZhciBzZHAgPSBbXTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmZvdW5kYXRpb24pO1xuICBzZHAucHVzaChjYW5kaWRhdGUuY29tcG9uZW50KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByb3RvY29sLnRvVXBwZXJDYXNlKCkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUucHJpb3JpdHkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUuaXApO1xuICBzZHAucHVzaChjYW5kaWRhdGUucG9ydCk7XG5cbiAgdmFyIHR5cGUgPSBjYW5kaWRhdGUudHlwZTtcbiAgc2RwLnB1c2goJ3R5cCcpO1xuICBzZHAucHVzaCh0eXBlKTtcbiAgaWYgKHR5cGUgIT09ICdob3N0JyAmJiBjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MgJiZcbiAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCkge1xuICAgIHNkcC5wdXNoKCdyYWRkcicpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyk7IC8vIHdhczogcmVsQWRkclxuICAgIHNkcC5wdXNoKCdycG9ydCcpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCk7IC8vIHdhczogcmVsUG9ydFxuICB9XG4gIGlmIChjYW5kaWRhdGUudGNwVHlwZSAmJiBjYW5kaWRhdGUucHJvdG9jb2wudG9Mb3dlckNhc2UoKSA9PT0gJ3RjcCcpIHtcbiAgICBzZHAucHVzaCgndGNwdHlwZScpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS50Y3BUeXBlKTtcbiAgfVxuICByZXR1cm4gJ2NhbmRpZGF0ZTonICsgc2RwLmpvaW4oJyAnKTtcbn07XG5cbi8vIFBhcnNlcyBhbiBpY2Utb3B0aW9ucyBsaW5lLCByZXR1cm5zIGFuIGFycmF5IG9mIG9wdGlvbiB0YWdzLlxuLy8gYT1pY2Utb3B0aW9uczpmb28gYmFyXG5TRFBVdGlscy5wYXJzZUljZU9wdGlvbnMgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHJldHVybiBsaW5lLnN1YnN0cigxNCkuc3BsaXQoJyAnKTtcbn1cblxuLy8gUGFyc2VzIGFuIHJ0cG1hcCBsaW5lLCByZXR1cm5zIFJUQ1J0cENvZGRlY1BhcmFtZXRlcnMuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRwbWFwOjExMSBvcHVzLzQ4MDAwLzJcblNEUFV0aWxzLnBhcnNlUnRwTWFwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cig5KS5zcGxpdCgnICcpO1xuICB2YXIgcGFyc2VkID0ge1xuICAgIHBheWxvYWRUeXBlOiBwYXJzZUludChwYXJ0cy5zaGlmdCgpLCAxMCkgLy8gd2FzOiBpZFxuICB9O1xuXG4gIHBhcnRzID0gcGFydHNbMF0uc3BsaXQoJy8nKTtcblxuICBwYXJzZWQubmFtZSA9IHBhcnRzWzBdO1xuICBwYXJzZWQuY2xvY2tSYXRlID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKTsgLy8gd2FzOiBjbG9ja3JhdGVcbiAgLy8gd2FzOiBjaGFubmVsc1xuICBwYXJzZWQubnVtQ2hhbm5lbHMgPSBwYXJ0cy5sZW5ndGggPT09IDMgPyBwYXJzZUludChwYXJ0c1syXSwgMTApIDogMTtcbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cbi8vIEdlbmVyYXRlIGFuIGE9cnRwbWFwIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3Jcbi8vIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRwTWFwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICByZXR1cm4gJ2E9cnRwbWFwOicgKyBwdCArICcgJyArIGNvZGVjLm5hbWUgKyAnLycgKyBjb2RlYy5jbG9ja1JhdGUgK1xuICAgICAgKGNvZGVjLm51bUNoYW5uZWxzICE9PSAxID8gJy8nICsgY29kZWMubnVtQ2hhbm5lbHMgOiAnJykgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBhPWV4dG1hcCBsaW5lIChoZWFkZXJleHRlbnNpb24gZnJvbSBSRkMgNTI4NSkuIFNhbXBsZSBpbnB1dDpcbi8vIGE9ZXh0bWFwOjIgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxuLy8gYT1leHRtYXA6Mi9zZW5kb25seSB1cm46aWV0ZjpwYXJhbXM6cnRwLWhkcmV4dDp0b2Zmc2V0XG5TRFBVdGlscy5wYXJzZUV4dG1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICBpZDogcGFyc2VJbnQocGFydHNbMF0sIDEwKSxcbiAgICBkaXJlY3Rpb246IHBhcnRzWzBdLmluZGV4T2YoJy8nKSA+IDAgPyBwYXJ0c1swXS5zcGxpdCgnLycpWzFdIDogJ3NlbmRyZWN2JyxcbiAgICB1cmk6IHBhcnRzWzFdXG4gIH07XG59O1xuXG4vLyBHZW5lcmF0ZXMgYT1leHRtYXAgbGluZSBmcm9tIFJUQ1J0cEhlYWRlckV4dGVuc2lvblBhcmFtZXRlcnMgb3Jcbi8vIFJUQ1J0cEhlYWRlckV4dGVuc2lvbi5cblNEUFV0aWxzLndyaXRlRXh0bWFwID0gZnVuY3Rpb24oaGVhZGVyRXh0ZW5zaW9uKSB7XG4gIHJldHVybiAnYT1leHRtYXA6JyArIChoZWFkZXJFeHRlbnNpb24uaWQgfHwgaGVhZGVyRXh0ZW5zaW9uLnByZWZlcnJlZElkKSArXG4gICAgICAoaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvbiAmJiBoZWFkZXJFeHRlbnNpb24uZGlyZWN0aW9uICE9PSAnc2VuZHJlY3YnXG4gICAgICAgICAgPyAnLycgKyBoZWFkZXJFeHRlbnNpb24uZGlyZWN0aW9uXG4gICAgICAgICAgOiAnJykgK1xuICAgICAgJyAnICsgaGVhZGVyRXh0ZW5zaW9uLnVyaSArICdcXHJcXG4nO1xufTtcblxuLy8gUGFyc2VzIGFuIGZ0bXAgbGluZSwgcmV0dXJucyBkaWN0aW9uYXJ5LiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWZtdHA6OTYgdmJyPW9uO2NuZz1vblxuLy8gQWxzbyBkZWFscyB3aXRoIHZicj1vbjsgY25nPW9uXG5TRFBVdGlscy5wYXJzZUZtdHAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGt2O1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCc7Jyk7XG4gIGZvciAodmFyIGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICBrdiA9IHBhcnRzW2pdLnRyaW0oKS5zcGxpdCgnPScpO1xuICAgIHBhcnNlZFtrdlswXS50cmltKCldID0ga3ZbMV07XG4gIH1cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cbi8vIEdlbmVyYXRlcyBhbiBhPWZ0bXAgbGluZSBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZUZtdHAgPSBmdW5jdGlvbihjb2RlYykge1xuICB2YXIgbGluZSA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5wYXJhbWV0ZXJzICYmIE9iamVjdC5rZXlzKGNvZGVjLnBhcmFtZXRlcnMpLmxlbmd0aCkge1xuICAgIHZhciBwYXJhbXMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICBwYXJhbXMucHVzaChwYXJhbSArICc9JyArIGNvZGVjLnBhcmFtZXRlcnNbcGFyYW1dKTtcbiAgICB9KTtcbiAgICBsaW5lICs9ICdhPWZtdHA6JyArIHB0ICsgJyAnICsgcGFyYW1zLmpvaW4oJzsnKSArICdcXHJcXG4nO1xuICB9XG4gIHJldHVybiBsaW5lO1xufTtcblxuLy8gUGFyc2VzIGFuIHJ0Y3AtZmIgbGluZSwgcmV0dXJucyBSVENQUnRjcEZlZWRiYWNrIG9iamVjdC4gU2FtcGxlIGlucHV0OlxuLy8gYT1ydGNwLWZiOjk4IG5hY2sgcnBzaVxuU0RQVXRpbHMucGFyc2VSdGNwRmIgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKGxpbmUuaW5kZXhPZignICcpICsgMSkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBwYXJ0cy5zaGlmdCgpLFxuICAgIHBhcmFtZXRlcjogcGFydHMuam9pbignICcpXG4gIH07XG59O1xuLy8gR2VuZXJhdGUgYT1ydGNwLWZiIGxpbmVzIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRjcEZiID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmVzID0gJyc7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgaWYgKGNvZGVjLnJ0Y3BGZWVkYmFjayAmJiBjb2RlYy5ydGNwRmVlZGJhY2subGVuZ3RoKSB7XG4gICAgLy8gRklYTUU6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyci1pbnQ/XG4gICAgY29kZWMucnRjcEZlZWRiYWNrLmZvckVhY2goZnVuY3Rpb24oZmIpIHtcbiAgICAgIGxpbmVzICs9ICdhPXJ0Y3AtZmI6JyArIHB0ICsgJyAnICsgZmIudHlwZSArXG4gICAgICAoZmIucGFyYW1ldGVyICYmIGZiLnBhcmFtZXRlci5sZW5ndGggPyAnICcgKyBmYi5wYXJhbWV0ZXIgOiAnJykgK1xuICAgICAgICAgICdcXHJcXG4nO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBsaW5lcztcbn07XG5cbi8vIFBhcnNlcyBhbiBSRkMgNTU3NiBzc3JjIG1lZGlhIGF0dHJpYnV0ZS4gU2FtcGxlIGlucHV0OlxuLy8gYT1zc3JjOjM3MzU5Mjg1NTkgY25hbWU6c29tZXRoaW5nXG5TRFBVdGlscy5wYXJzZVNzcmNNZWRpYSA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHNwID0gbGluZS5pbmRleE9mKCcgJyk7XG4gIHZhciBwYXJ0cyA9IHtcbiAgICBzc3JjOiBwYXJzZUludChsaW5lLnN1YnN0cig3LCBzcCAtIDcpLCAxMClcbiAgfTtcbiAgdmFyIGNvbG9uID0gbGluZS5pbmRleE9mKCc6Jywgc3ApO1xuICBpZiAoY29sb24gPiAtMSkge1xuICAgIHBhcnRzLmF0dHJpYnV0ZSA9IGxpbmUuc3Vic3RyKHNwICsgMSwgY29sb24gLSBzcCAtIDEpO1xuICAgIHBhcnRzLnZhbHVlID0gbGluZS5zdWJzdHIoY29sb24gKyAxKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEpO1xuICB9XG4gIHJldHVybiBwYXJ0cztcbn07XG5cbi8vIEV4dHJhY3RzIHRoZSBNSUQgKFJGQyA1ODg4KSBmcm9tIGEgbWVkaWEgc2VjdGlvbi5cbi8vIHJldHVybnMgdGhlIE1JRCBvciB1bmRlZmluZWQgaWYgbm8gbWlkIGxpbmUgd2FzIGZvdW5kLlxuU0RQVXRpbHMuZ2V0TWlkID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBtaWQgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1pZDonKVswXTtcbiAgaWYgKG1pZCkge1xuICAgIHJldHVybiBtaWQuc3Vic3RyKDYpO1xuICB9XG59XG5cblNEUFV0aWxzLnBhcnNlRmluZ2VycHJpbnQgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDE0KS5zcGxpdCgnICcpO1xuICByZXR1cm4ge1xuICAgIGFsZ29yaXRobTogcGFydHNbMF0udG9Mb3dlckNhc2UoKSwgLy8gYWxnb3JpdGhtIGlzIGNhc2Utc2Vuc2l0aXZlIGluIEVkZ2UuXG4gICAgdmFsdWU6IHBhcnRzWzFdXG4gIH07XG59O1xuXG4vLyBFeHRyYWN0cyBEVExTIHBhcmFtZXRlcnMgZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxuLy8gICBnZXQgdGhlIGZpbmdlcnByaW50IGxpbmUgYXMgaW5wdXQuIFNlZSBhbHNvIGdldEljZVBhcmFtZXRlcnMuXG5TRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uICsgc2Vzc2lvbnBhcnQsXG4gICAgICAnYT1maW5nZXJwcmludDonKTtcbiAgLy8gTm90ZTogYT1zZXR1cCBsaW5lIGlzIGlnbm9yZWQgc2luY2Ugd2UgdXNlIHRoZSAnYXV0bycgcm9sZS5cbiAgLy8gTm90ZTI6ICdhbGdvcml0aG0nIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZSBleGNlcHQgaW4gRWRnZS5cbiAgcmV0dXJuIHtcbiAgICByb2xlOiAnYXV0bycsXG4gICAgZmluZ2VycHJpbnRzOiBsaW5lcy5tYXAoU0RQVXRpbHMucGFyc2VGaW5nZXJwcmludClcbiAgfTtcbn07XG5cbi8vIFNlcmlhbGl6ZXMgRFRMUyBwYXJhbWV0ZXJzIHRvIFNEUC5cblNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMsIHNldHVwVHlwZSkge1xuICB2YXIgc2RwID0gJ2E9c2V0dXA6JyArIHNldHVwVHlwZSArICdcXHJcXG4nO1xuICBwYXJhbXMuZmluZ2VycHJpbnRzLmZvckVhY2goZnVuY3Rpb24oZnApIHtcbiAgICBzZHAgKz0gJ2E9ZmluZ2VycHJpbnQ6JyArIGZwLmFsZ29yaXRobSArICcgJyArIGZwLnZhbHVlICsgJ1xcclxcbic7XG4gIH0pO1xuICByZXR1cm4gc2RwO1xufTtcbi8vIFBhcnNlcyBJQ0UgaW5mb3JtYXRpb24gZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxuLy8gICBnZXQgdGhlIGljZS11ZnJhZyBhbmQgaWNlLXB3ZCBsaW5lcyBhcyBpbnB1dC5cblNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgLy8gU2VhcmNoIGluIHNlc3Npb24gcGFydCwgdG9vLlxuICBsaW5lcyA9IGxpbmVzLmNvbmNhdChTRFBVdGlscy5zcGxpdExpbmVzKHNlc3Npb25wYXJ0KSk7XG4gIHZhciBpY2VQYXJhbWV0ZXJzID0ge1xuICAgIHVzZXJuYW1lRnJhZ21lbnQ6IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWljZS11ZnJhZzonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTIpLFxuICAgIHBhc3N3b3JkOiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtcHdkOicpID09PSAwO1xuICAgIH0pWzBdLnN1YnN0cigxMClcbiAgfTtcbiAgcmV0dXJuIGljZVBhcmFtZXRlcnM7XG59O1xuXG4vLyBTZXJpYWxpemVzIElDRSBwYXJhbWV0ZXJzIHRvIFNEUC5cblNEUFV0aWxzLndyaXRlSWNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICByZXR1cm4gJ2E9aWNlLXVmcmFnOicgKyBwYXJhbXMudXNlcm5hbWVGcmFnbWVudCArICdcXHJcXG4nICtcbiAgICAgICdhPWljZS1wd2Q6JyArIHBhcmFtcy5wYXNzd29yZCArICdcXHJcXG4nO1xufTtcblxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBSVENSdHBQYXJhbWV0ZXJzLlxuU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBkZXNjcmlwdGlvbiA9IHtcbiAgICBjb2RlY3M6IFtdLFxuICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxuICAgIGZlY01lY2hhbmlzbXM6IFtdLFxuICAgIHJ0Y3A6IFtdXG4gIH07XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIG1saW5lID0gbGluZXNbMF0uc3BsaXQoJyAnKTtcbiAgZm9yICh2YXIgaSA9IDM7IGkgPCBtbGluZS5sZW5ndGg7IGkrKykgeyAvLyBmaW5kIGFsbCBjb2RlY3MgZnJvbSBtbGluZVszLi5dXG4gICAgdmFyIHB0ID0gbWxpbmVbaV07XG4gICAgdmFyIHJ0cG1hcGxpbmUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1ydHBtYXA6JyArIHB0ICsgJyAnKVswXTtcbiAgICBpZiAocnRwbWFwbGluZSkge1xuICAgICAgdmFyIGNvZGVjID0gU0RQVXRpbHMucGFyc2VSdHBNYXAocnRwbWFwbGluZSk7XG4gICAgICB2YXIgZm10cHMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgICBtZWRpYVNlY3Rpb24sICdhPWZtdHA6JyArIHB0ICsgJyAnKTtcbiAgICAgIC8vIE9ubHkgdGhlIGZpcnN0IGE9Zm10cDo8cHQ+IGlzIGNvbnNpZGVyZWQuXG4gICAgICBjb2RlYy5wYXJhbWV0ZXJzID0gZm10cHMubGVuZ3RoID8gU0RQVXRpbHMucGFyc2VGbXRwKGZtdHBzWzBdKSA6IHt9O1xuICAgICAgY29kZWMucnRjcEZlZWRiYWNrID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1ydGNwLWZiOicgKyBwdCArICcgJylcbiAgICAgICAgLm1hcChTRFBVdGlscy5wYXJzZVJ0Y3BGYik7XG4gICAgICBkZXNjcmlwdGlvbi5jb2RlY3MucHVzaChjb2RlYyk7XG4gICAgICAvLyBwYXJzZSBGRUMgbWVjaGFuaXNtcyBmcm9tIHJ0cG1hcCBsaW5lcy5cbiAgICAgIHN3aXRjaCAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ1JFRCc6XG4gICAgICAgIGNhc2UgJ1VMUEZFQyc6XG4gICAgICAgICAgZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5wdXNoKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IC8vIG9ubHkgUkVEIGFuZCBVTFBGRUMgYXJlIHJlY29nbml6ZWQgYXMgRkVDIG1lY2hhbmlzbXMuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9ZXh0bWFwOicpLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgIGRlc2NyaXB0aW9uLmhlYWRlckV4dGVuc2lvbnMucHVzaChTRFBVdGlscy5wYXJzZUV4dG1hcChsaW5lKSk7XG4gIH0pO1xuICAvLyBGSVhNRTogcGFyc2UgcnRjcC5cbiAgcmV0dXJuIGRlc2NyaXB0aW9uO1xufTtcblxuLy8gR2VuZXJhdGVzIHBhcnRzIG9mIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBkZXNjcmliaW5nIHRoZSBjYXBhYmlsaXRpZXMgL1xuLy8gcGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24gPSBmdW5jdGlvbihraW5kLCBjYXBzKSB7XG4gIHZhciBzZHAgPSAnJztcblxuICAvLyBCdWlsZCB0aGUgbWxpbmUuXG4gIHNkcCArPSAnbT0nICsga2luZCArICcgJztcbiAgc2RwICs9IGNhcHMuY29kZWNzLmxlbmd0aCA+IDAgPyAnOScgOiAnMCc7IC8vIHJlamVjdCBpZiBubyBjb2RlY3MuXG4gIHNkcCArPSAnIFVEUC9UTFMvUlRQL1NBVlBGICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5tYXAoZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICAgIH1cbiAgICByZXR1cm4gY29kZWMucGF5bG9hZFR5cGU7XG4gIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuXG4gIHNkcCArPSAnYz1JTiBJUDQgMC4wLjAuMFxcclxcbic7XG4gIHNkcCArPSAnYT1ydGNwOjkgSU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuXG4gIC8vIEFkZCBhPXJ0cG1hcCBsaW5lcyBmb3IgZWFjaCBjb2RlYy4gQWxzbyBmbXRwIGFuZCBydGNwLWZiLlxuICBjYXBzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRwTWFwKGNvZGVjKTtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVGbXRwKGNvZGVjKTtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVSdGNwRmIoY29kZWMpO1xuICB9KTtcbiAgdmFyIG1heHB0aW1lID0gMDtcbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIGlmIChjb2RlYy5tYXhwdGltZSA+IG1heHB0aW1lKSB7XG4gICAgICBtYXhwdGltZSA9IGNvZGVjLm1heHB0aW1lO1xuICAgIH1cbiAgfSk7XG4gIGlmIChtYXhwdGltZSA+IDApIHtcbiAgICBzZHAgKz0gJ2E9bWF4cHRpbWU6JyArIG1heHB0aW1lICsgJ1xcclxcbic7XG4gIH1cbiAgc2RwICs9ICdhPXJ0Y3AtbXV4XFxyXFxuJztcblxuICBjYXBzLmhlYWRlckV4dGVuc2lvbnMuZm9yRWFjaChmdW5jdGlvbihleHRlbnNpb24pIHtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVFeHRtYXAoZXh0ZW5zaW9uKTtcbiAgfSk7XG4gIC8vIEZJWE1FOiB3cml0ZSBmZWNNZWNoYW5pc21zLlxuICByZXR1cm4gc2RwO1xufTtcblxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBhbiBhcnJheSBvZlxuLy8gUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzLlxuU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGVuY29kaW5nUGFyYW1ldGVycyA9IFtdO1xuICB2YXIgZGVzY3JpcHRpb24gPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIGhhc1JlZCA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignUkVEJykgIT09IC0xO1xuICB2YXIgaGFzVWxwZmVjID0gZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5pbmRleE9mKCdVTFBGRUMnKSAhPT0gLTE7XG5cbiAgLy8gZmlsdGVyIGE9c3NyYzouLi4gY25hbWU6LCBpZ25vcmUgUGxhbkItbXNpZFxuICB2YXIgc3NyY3MgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICB9KVxuICAuZmlsdGVyKGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgcmV0dXJuIHBhcnRzLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgfSk7XG4gIHZhciBwcmltYXJ5U3NyYyA9IHNzcmNzLmxlbmd0aCA+IDAgJiYgc3NyY3NbMF0uc3NyYztcbiAgdmFyIHNlY29uZGFyeVNzcmM7XG5cbiAgdmFyIGZsb3dzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjLWdyb3VwOkZJRCcpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJyAnKTtcbiAgICBwYXJ0cy5zaGlmdCgpO1xuICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHBhcnQsIDEwKTtcbiAgICB9KTtcbiAgfSk7XG4gIGlmIChmbG93cy5sZW5ndGggPiAwICYmIGZsb3dzWzBdLmxlbmd0aCA+IDEgJiYgZmxvd3NbMF1bMF0gPT09IHByaW1hcnlTc3JjKSB7XG4gICAgc2Vjb25kYXJ5U3NyYyA9IGZsb3dzWzBdWzFdO1xuICB9XG5cbiAgZGVzY3JpcHRpb24uY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnUlRYJyAmJiBjb2RlYy5wYXJhbWV0ZXJzLmFwdCkge1xuICAgICAgdmFyIGVuY1BhcmFtID0ge1xuICAgICAgICBzc3JjOiBwcmltYXJ5U3NyYyxcbiAgICAgICAgY29kZWNQYXlsb2FkVHlwZTogcGFyc2VJbnQoY29kZWMucGFyYW1ldGVycy5hcHQsIDEwKSxcbiAgICAgICAgcnR4OiB7XG4gICAgICAgICAgc3NyYzogc2Vjb25kYXJ5U3NyY1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgaWYgKGhhc1JlZCkge1xuICAgICAgICBlbmNQYXJhbSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZW5jUGFyYW0pKTtcbiAgICAgICAgZW5jUGFyYW0uZmVjID0ge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmMsXG4gICAgICAgICAgbWVjaGFuaXNtOiBoYXNVbHBmZWMgPyAncmVkK3VscGZlYycgOiAncmVkJ1xuICAgICAgICB9O1xuICAgICAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaChlbmNQYXJhbSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGggPT09IDAgJiYgcHJpbWFyeVNzcmMpIHtcbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaCh7XG4gICAgICBzc3JjOiBwcmltYXJ5U3NyY1xuICAgIH0pO1xuICB9XG5cbiAgLy8gd2Ugc3VwcG9ydCBib3RoIGI9QVMgYW5kIGI9VElBUyBidXQgaW50ZXJwcmV0IEFTIGFzIFRJQVMuXG4gIHZhciBiYW5kd2lkdGggPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdiPScpO1xuICBpZiAoYmFuZHdpZHRoLmxlbmd0aCkge1xuICAgIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1USUFTOicpID09PSAwKSB7XG4gICAgICBiYW5kd2lkdGggPSBwYXJzZUludChiYW5kd2lkdGhbMF0uc3Vic3RyKDcpLCAxMCk7XG4gICAgfSBlbHNlIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1BUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig1KSwgMTApO1xuICAgIH1cbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHBhcmFtcy5tYXhCaXRyYXRlID0gYmFuZHdpZHRoO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBlbmNvZGluZ1BhcmFtZXRlcnM7XG59O1xuXG4vLyBwYXJzZXMgaHR0cDovL2RyYWZ0Lm9ydGMub3JnLyNydGNydGNwcGFyYW1ldGVycypcblNEUFV0aWxzLnBhcnNlUnRjcFBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIHJ0Y3BQYXJhbWV0ZXJzID0ge307XG5cbiAgdmFyIGNuYW1lO1xuICAvLyBHZXRzIHRoZSBmaXJzdCBTU1JDLiBOb3RlIHRoYXQgd2l0aCBSVFggdGhlcmUgbWlnaHQgYmUgbXVsdGlwbGVcbiAgLy8gU1NSQ3MuXG4gIHZhciByZW1vdGVTc3JjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gICAgICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmouYXR0cmlidXRlID09PSAnY25hbWUnO1xuICAgICAgfSlbMF07XG4gIGlmIChyZW1vdGVTc3JjKSB7XG4gICAgcnRjcFBhcmFtZXRlcnMuY25hbWUgPSByZW1vdGVTc3JjLnZhbHVlO1xuICAgIHJ0Y3BQYXJhbWV0ZXJzLnNzcmMgPSByZW1vdGVTc3JjLnNzcmM7XG4gIH1cblxuICAvLyBFZGdlIHVzZXMgdGhlIGNvbXBvdW5kIGF0dHJpYnV0ZSBpbnN0ZWFkIG9mIHJlZHVjZWRTaXplXG4gIC8vIGNvbXBvdW5kIGlzICFyZWR1Y2VkU2l6ZVxuICB2YXIgcnNpemUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXJ0Y3AtcnNpemUnKTtcbiAgcnRjcFBhcmFtZXRlcnMucmVkdWNlZFNpemUgPSByc2l6ZS5sZW5ndGggPiAwO1xuICBydGNwUGFyYW1ldGVycy5jb21wb3VuZCA9IHJzaXplLmxlbmd0aCA9PT0gMDtcblxuICAvLyBwYXJzZXMgdGhlIHJ0Y3AtbXV4IGF0dHLRlmJ1dGUuXG4gIC8vIE5vdGUgdGhhdCBFZGdlIGRvZXMgbm90IHN1cHBvcnQgdW5tdXhlZCBSVENQLlxuICB2YXIgbXV4ID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1ydGNwLW11eCcpO1xuICBydGNwUGFyYW1ldGVycy5tdXggPSBtdXgubGVuZ3RoID4gMDtcblxuICByZXR1cm4gcnRjcFBhcmFtZXRlcnM7XG59O1xuXG4vLyBwYXJzZXMgZWl0aGVyIGE9bXNpZDogb3IgYT1zc3JjOi4uLiBtc2lkIGxpbmVzIGFuZCByZXR1cm5zXG4vLyB0aGUgaWQgb2YgdGhlIE1lZGlhU3RyZWFtIGFuZCBNZWRpYVN0cmVhbVRyYWNrLlxuU0RQVXRpbHMucGFyc2VNc2lkID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHNwZWMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1zaWQ6Jyk7XG4gIGlmIChzcGVjLmxlbmd0aCA9PT0gMSkge1xuICAgIHBhcnRzID0gc3BlY1swXS5zdWJzdHIoNykuc3BsaXQoJyAnKTtcbiAgICByZXR1cm4ge3N0cmVhbTogcGFydHNbMF0sIHRyYWNrOiBwYXJ0c1sxXX07XG4gIH1cbiAgdmFyIHBsYW5CID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgfSlcbiAgLmZpbHRlcihmdW5jdGlvbihwYXJ0cykge1xuICAgIHJldHVybiBwYXJ0cy5hdHRyaWJ1dGUgPT09ICdtc2lkJztcbiAgfSk7XG4gIGlmIChwbGFuQi5sZW5ndGggPiAwKSB7XG4gICAgcGFydHMgPSBwbGFuQlswXS52YWx1ZS5zcGxpdCgnICcpO1xuICAgIHJldHVybiB7c3RyZWFtOiBwYXJ0c1swXSwgdHJhY2s6IHBhcnRzWzFdfTtcbiAgfVxufTtcblxuU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gRklYTUU6IHNlc3MtaWQgc2hvdWxkIGJlIGFuIE5UUCB0aW1lc3RhbXAuXG4gIHJldHVybiAndj0wXFxyXFxuJyArXG4gICAgICAnbz10aGlzaXNhZGFwdGVyb3J0YyA4MTY5NjM5OTE1NjQ2OTQzMTM3IDIgSU4gSVA0IDEyNy4wLjAuMVxcclxcbicgK1xuICAgICAgJ3M9LVxcclxcbicgK1xuICAgICAgJ3Q9MCAwXFxyXFxuJztcbn07XG5cblNEUFV0aWxzLndyaXRlTWVkaWFTZWN0aW9uID0gZnVuY3Rpb24odHJhbnNjZWl2ZXIsIGNhcHMsIHR5cGUsIHN0cmVhbSkge1xuICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVSdHBEZXNjcmlwdGlvbih0cmFuc2NlaXZlci5raW5kLCBjYXBzKTtcblxuICAvLyBNYXAgSUNFIHBhcmFtZXRlcnMgKHVmcmFnLCBwd2QpIHRvIFNEUC5cbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlSWNlUGFyYW1ldGVycyhcbiAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmdldExvY2FsUGFyYW1ldGVycygpKTtcblxuICAvLyBNYXAgRFRMUyBwYXJhbWV0ZXJzIHRvIFNEUC5cbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMoXG4gICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LmdldExvY2FsUGFyYW1ldGVycygpLFxuICAgICAgdHlwZSA9PT0gJ29mZmVyJyA/ICdhY3RwYXNzJyA6ICdhY3RpdmUnKTtcblxuICBzZHAgKz0gJ2E9bWlkOicgKyB0cmFuc2NlaXZlci5taWQgKyAnXFxyXFxuJztcblxuICBpZiAodHJhbnNjZWl2ZXIuZGlyZWN0aW9uKSB7XG4gICAgc2RwICs9ICdhPScgKyB0cmFuc2NlaXZlci5kaXJlY3Rpb24gKyAnXFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZHJlY3ZcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIHNkcCArPSAnYT1zZW5kb25seVxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9cmVjdm9ubHlcXHJcXG4nO1xuICB9IGVsc2Uge1xuICAgIHNkcCArPSAnYT1pbmFjdGl2ZVxcclxcbic7XG4gIH1cblxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgLy8gc3BlYy5cbiAgICB2YXIgbXNpZCA9ICdtc2lkOicgKyBzdHJlYW0uaWQgKyAnICcgK1xuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIudHJhY2suaWQgKyAnXFxyXFxuJztcbiAgICBzZHAgKz0gJ2E9JyArIG1zaWQ7XG5cbiAgICAvLyBmb3IgQ2hyb21lLlxuICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgICAnICcgKyBtc2lkO1xuICAgIGlmICh0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCkge1xuICAgICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4LnNzcmMgK1xuICAgICAgICAgICcgJyArIG1zaWQ7XG4gICAgICBzZHAgKz0gJ2E9c3NyYy1ncm91cDpGSUQgJyArXG4gICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICsgJyAnICtcbiAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9XG4gIH1cbiAgLy8gRklYTUU6IHRoaXMgc2hvdWxkIGJlIHdyaXR0ZW4gYnkgd3JpdGVSdHBEZXNjcmlwdGlvbi5cbiAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXG4gICAgICAgICcgY25hbWU6JyArIFNEUFV0aWxzLmxvY2FsQ05hbWUgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gc2RwO1xufTtcblxuLy8gR2V0cyB0aGUgZGlyZWN0aW9uIGZyb20gdGhlIG1lZGlhU2VjdGlvbiBvciB0aGUgc2Vzc2lvbnBhcnQuXG5TRFBVdGlscy5nZXREaXJlY3Rpb24gPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIC8vIExvb2sgZm9yIHNlbmRyZWN2LCBzZW5kb25seSwgcmVjdm9ubHksIGluYWN0aXZlLCBkZWZhdWx0IHRvIHNlbmRyZWN2LlxuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzd2l0Y2ggKGxpbmVzW2ldKSB7XG4gICAgICBjYXNlICdhPXNlbmRyZWN2JzpcbiAgICAgIGNhc2UgJ2E9c2VuZG9ubHknOlxuICAgICAgY2FzZSAnYT1yZWN2b25seSc6XG4gICAgICBjYXNlICdhPWluYWN0aXZlJzpcbiAgICAgICAgcmV0dXJuIGxpbmVzW2ldLnN1YnN0cigyKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIEZJWE1FOiBXaGF0IHNob3VsZCBoYXBwZW4gaGVyZT9cbiAgICB9XG4gIH1cbiAgaWYgKHNlc3Npb25wYXJ0KSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLmdldERpcmVjdGlvbihzZXNzaW9ucGFydCk7XG4gIH1cbiAgcmV0dXJuICdzZW5kcmVjdic7XG59O1xuXG5TRFBVdGlscy5nZXRLaW5kID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIG1saW5lID0gbGluZXNbMF0uc3BsaXQoJyAnKTtcbiAgcmV0dXJuIG1saW5lWzBdLnN1YnN0cigyKTtcbn07XG5cblNEUFV0aWxzLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgcmV0dXJuIG1lZGlhU2VjdGlvbi5zcGxpdCgnICcsIDIpWzFdID09PSAnMCc7XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IFNEUFV0aWxzO1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gU2hpbW1pbmcgc3RhcnRzIGhlcmUuXG4oZnVuY3Rpb24oKSB7XG4gIC8vIFV0aWxzLlxuICB2YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5sb2c7XG4gIHZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcbiAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlckRldGFpbHMgPSBicm93c2VyRGV0YWlscztcbiAgbW9kdWxlLmV4cG9ydHMuZXh0cmFjdFZlcnNpb24gPSByZXF1aXJlKCcuL3V0aWxzJykuZXh0cmFjdFZlcnNpb247XG4gIG1vZHVsZS5leHBvcnRzLmRpc2FibGVMb2cgPSByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZztcblxuICAvLyBVbmNvbW1lbnQgdGhlIGxpbmUgYmVsb3cgaWYgeW91IHdhbnQgbG9nZ2luZyB0byBvY2N1ciwgaW5jbHVkaW5nIGxvZ2dpbmdcbiAgLy8gZm9yIHRoZSBzd2l0Y2ggc3RhdGVtZW50IGJlbG93LiBDYW4gYWxzbyBiZSB0dXJuZWQgb24gaW4gdGhlIGJyb3dzZXIgdmlhXG4gIC8vIGFkYXB0ZXIuZGlzYWJsZUxvZyhmYWxzZSksIGJ1dCB0aGVuIGxvZ2dpbmcgZnJvbSB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvd1xuICAvLyB3aWxsIG5vdCBhcHBlYXIuXG4gIC8vIHJlcXVpcmUoJy4vdXRpbHMnKS5kaXNhYmxlTG9nKGZhbHNlKTtcblxuICAvLyBCcm93c2VyIHNoaW1zLlxuICB2YXIgY2hyb21lU2hpbSA9IHJlcXVpcmUoJy4vY2hyb21lL2Nocm9tZV9zaGltJykgfHwgbnVsbDtcbiAgdmFyIGVkZ2VTaGltID0gcmVxdWlyZSgnLi9lZGdlL2VkZ2Vfc2hpbScpIHx8IG51bGw7XG4gIHZhciBmaXJlZm94U2hpbSA9IHJlcXVpcmUoJy4vZmlyZWZveC9maXJlZm94X3NoaW0nKSB8fCBudWxsO1xuICB2YXIgc2FmYXJpU2hpbSA9IHJlcXVpcmUoJy4vc2FmYXJpL3NhZmFyaV9zaGltJykgfHwgbnVsbDtcblxuICAvLyBTaGltIGJyb3dzZXIgaWYgZm91bmQuXG4gIHN3aXRjaCAoYnJvd3NlckRldGFpbHMuYnJvd3Nlcikge1xuICAgIGNhc2UgJ29wZXJhJzogLy8gZmFsbHRocm91Z2ggYXMgaXQgdXNlcyBjaHJvbWUgc2hpbXNcbiAgICBjYXNlICdjaHJvbWUnOlxuICAgICAgaWYgKCFjaHJvbWVTaGltIHx8ICFjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdDaHJvbWUgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgY2hyb21lLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gY2hyb21lU2hpbTtcblxuICAgICAgY2hyb21lU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1NZWRpYVN0cmVhbSgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltU291cmNlT2JqZWN0KCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgY2hyb21lU2hpbS5zaGltT25UcmFjaygpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmlyZWZveCc6XG4gICAgICBpZiAoIWZpcmVmb3hTaGltIHx8ICFmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnRmlyZWZveCBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBmaXJlZm94LicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gZmlyZWZveFNoaW07XG5cbiAgICAgIGZpcmVmb3hTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1Tb3VyY2VPYmplY3QoKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbU9uVHJhY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VkZ2UnOlxuICAgICAgaWYgKCFlZGdlU2hpbSB8fCAhZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ01TIGVkZ2Ugc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZWRnZS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGVkZ2VTaGltO1xuXG4gICAgICBlZGdlU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NhZmFyaSc6XG4gICAgICBpZiAoIXNhZmFyaVNoaW0pIHtcbiAgICAgICAgbG9nZ2luZygnU2FmYXJpIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIHNhZmFyaS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IHNhZmFyaVNoaW07XG5cbiAgICAgIHNhZmFyaVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxvZ2dpbmcoJ1Vuc3VwcG9ydGVkIGJyb3dzZXIhJyk7XG4gIH1cbn0pKCk7XG4iLCJcbi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykuYnJvd3NlckRldGFpbHM7XG5cbnZhciBjaHJvbWVTaGltID0ge1xuICBzaGltTWVkaWFTdHJlYW06IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5NZWRpYVN0cmVhbSA9IHdpbmRvdy5NZWRpYVN0cmVhbSB8fCB3aW5kb3cud2Via2l0TWVkaWFTdHJlYW07XG4gIH0sXG5cbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb250cmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIGlmICh0aGlzLl9vbnRyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gb25hZGRzdHJlYW0gZG9lcyBub3QgZmlyZSB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgdG8gYW4gZXhpc3RpbmdcbiAgICAgICAgICAgIC8vIHN0cmVhbS4gQnV0IHN0cmVhbS5vbmFkZHRyYWNrIGlzIGltcGxlbWVudGVkIHNvIHdlIHVzZSB0aGF0LlxuICAgICAgICAgICAgZS5zdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbih0ZSkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdGUudHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0ZS50cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBzaGltU291cmNlT2JqZWN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudCAmJlxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUsICdzcmNPYmplY3QnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zcmNPYmplY3Q7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgLy8gVXNlIF9zcmNPYmplY3QgYXMgYSBwcml2YXRlIHByb3BlcnR5IGZvciB0aGlzIHNoaW1cbiAgICAgICAgICAgIHRoaXMuX3NyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuc3JjKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFzdHJlYW0pIHtcbiAgICAgICAgICAgICAgdGhpcy5zcmMgPSAnJztcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHJlY3JlYXRlIHRoZSBibG9iIHVybCB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgb3JcbiAgICAgICAgICAgIC8vIHJlbW92ZWQuIERvaW5nIGl0IG1hbnVhbGx5IHNpbmNlIHdlIHdhbnQgdG8gYXZvaWQgYSByZWN1cnNpb24uXG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdyZW1vdmV0cmFjaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5zcmMpIHtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHNlbGYuc3JjKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xuICAgICAgLy8gVHJhbnNsYXRlIGljZVRyYW5zcG9ydFBvbGljeSB0byBpY2VUcmFuc3BvcnRzLFxuICAgICAgLy8gc2VlIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3Avd2VicnRjL2lzc3Vlcy9kZXRhaWw/aWQ9NDg2OVxuICAgICAgbG9nZ2luZygnUGVlckNvbm5lY3Rpb24nKTtcbiAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgcGNDb25maWcuaWNlVHJhbnNwb3J0cyA9IHBjQ29uZmlnLmljZVRyYW5zcG9ydFBvbGljeTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBjID0gbmV3IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIHZhciBvcmlnR2V0U3RhdHMgPSBwYy5nZXRTdGF0cy5iaW5kKHBjKTtcbiAgICAgIHBjLmdldFN0YXRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIC8vIElmIHNlbGVjdG9yIGlzIGEgZnVuY3Rpb24gdGhlbiB3ZSBhcmUgaW4gdGhlIG9sZCBzdHlsZSBzdGF0cyBzbyBqdXN0XG4gICAgICAgIC8vIHBhc3MgYmFjayB0aGUgb3JpZ2luYWwgZ2V0U3RhdHMgZm9ybWF0IHRvIGF2b2lkIGJyZWFraW5nIG9sZCB1c2Vycy5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMoc2VsZWN0b3IsIHN1Y2Nlc3NDYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZml4Q2hyb21lU3RhdHNfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICB2YXIgc3RhbmRhcmRSZXBvcnQgPSB7fTtcbiAgICAgICAgICB2YXIgcmVwb3J0cyA9IHJlc3BvbnNlLnJlc3VsdCgpO1xuICAgICAgICAgIHJlcG9ydHMuZm9yRWFjaChmdW5jdGlvbihyZXBvcnQpIHtcbiAgICAgICAgICAgIHZhciBzdGFuZGFyZFN0YXRzID0ge1xuICAgICAgICAgICAgICBpZDogcmVwb3J0LmlkLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IHJlcG9ydC50aW1lc3RhbXAsXG4gICAgICAgICAgICAgIHR5cGU6IHJlcG9ydC50eXBlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVwb3J0Lm5hbWVzKCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgIHN0YW5kYXJkU3RhdHNbbmFtZV0gPSByZXBvcnQuc3RhdChuYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RhbmRhcmRSZXBvcnRbc3RhbmRhcmRTdGF0cy5pZF0gPSBzdGFuZGFyZFN0YXRzO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHN0YW5kYXJkUmVwb3J0O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcbiAgICAgICAgdmFyIG1ha2VNYXBTdGF0cyA9IGZ1bmN0aW9uKHN0YXRzLCBsZWdhY3lTdGF0cykge1xuICAgICAgICAgIHZhciBtYXAgPSBuZXcgTWFwKE9iamVjdC5rZXlzKHN0YXRzKS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm5ba2V5LCBzdGF0c1trZXldXTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgbGVnYWN5U3RhdHMgPSBsZWdhY3lTdGF0cyB8fCBzdGF0cztcbiAgICAgICAgICBPYmplY3Qua2V5cyhsZWdhY3lTdGF0cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIG1hcFtrZXldID0gbGVnYWN5U3RhdHNba2V5XTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICB2YXIgc3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgYXJnc1sxXShtYWtlTWFwU3RhdHMoZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKSkpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzLmFwcGx5KHRoaXMsIFtzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyxcbiAgICAgICAgICAgICAgYXJndW1lbnRzWzBdXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcm9taXNlLXN1cHBvcnRcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvcmlnR2V0U3RhdHMuYXBwbHkoc2VsZiwgW1xuICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobWFrZU1hcFN0YXRzKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpKTtcbiAgICAgICAgICAgICAgfSwgcmVqZWN0XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFByZXNlcnZlIGxlZ2FjeSBjaHJvbWUgc3RhdHMgb25seSBvbiBsZWdhY3kgYWNjZXNzIG9mIHN0YXRzIG9ialxuICAgICAgICAgICAgb3JpZ0dldFN0YXRzLmFwcGx5KHNlbGYsIFtcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG1ha2VNYXBTdGF0cyhmaXhDaHJvbWVTdGF0c18ocmVzcG9uc2UpLFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5yZXN1bHQoKSkpO1xuICAgICAgICAgICAgICB9LCByZWplY3RdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBwYztcbiAgICB9O1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XG5cbiAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgIGlmICh3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgWydjcmVhdGVPZmZlcicsICdjcmVhdGVBbnN3ZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEgfHwgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkoc2VsZiwgW3Jlc29sdmUsIHJlamVjdCwgb3B0c10pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBhZGQgcHJvbWlzZSBzdXBwb3J0IC0tIG5hdGl2ZWx5IGF2YWlsYWJsZSBpbiBDaHJvbWUgNTFcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDUxKSB7XG4gICAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cbiAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICAgIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFthcmdzWzBdLCByZXNvbHZlLCByZWplY3RdKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFyZ3NbMV0uYXBwbHkobnVsbCwgW10pO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgICAgYXJnc1syXS5hcHBseShudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc2hpbSBpbXBsaWNpdCBjcmVhdGlvbiBvZiBSVENTZXNzaW9uRGVzY3JpcHRpb24vUlRDSWNlQ2FuZGlkYXRlXG4gICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJykgP1xuICAgICAgICAgICAgICAgIFJUQ0ljZUNhbmRpZGF0ZSA6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbikoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGFkZEljZUNhbmRpZGF0ZShudWxsIG9yIHVuZGVmaW5lZClcbiAgICB2YXIgbmF0aXZlQWRkSWNlQ2FuZGlkYXRlID1cbiAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZTtcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50c1swXSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzWzFdKSB7XG4gICAgICAgICAgYXJndW1lbnRzWzFdLmFwcGx5KG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYXRpdmVBZGRJY2VDYW5kaWRhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG59O1xuXG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltTWVkaWFTdHJlYW06IGNocm9tZVNoaW0uc2hpbU1lZGlhU3RyZWFtLFxuICBzaGltT25UcmFjazogY2hyb21lU2hpbS5zaGltT25UcmFjayxcbiAgc2hpbVNvdXJjZU9iamVjdDogY2hyb21lU2hpbS5zaGltU291cmNlT2JqZWN0LFxuICBzaGltUGVlckNvbm5lY3Rpb246IGNocm9tZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykubG9nO1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29uc3RyYWludHNUb0Nocm9tZV8gPSBmdW5jdGlvbihjKSB7XG4gICAgaWYgKHR5cGVvZiBjICE9PSAnb2JqZWN0JyB8fCBjLm1hbmRhdG9yeSB8fCBjLm9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgdmFyIGNjID0ge307XG4gICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciByID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/IGNba2V5XSA6IHtpZGVhbDogY1trZXldfTtcbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHIubWluID0gci5tYXggPSByLmV4YWN0O1xuICAgICAgfVxuICAgICAgdmFyIG9sZG5hbWVfID0gZnVuY3Rpb24ocHJlZml4LCBuYW1lKSB7XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsgbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuYW1lID09PSAnZGV2aWNlSWQnKSA/ICdzb3VyY2VJZCcgOiBuYW1lO1xuICAgICAgfTtcbiAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2Mub3B0aW9uYWwgPSBjYy5vcHRpb25hbCB8fCBbXTtcbiAgICAgICAgdmFyIG9jID0ge307XG4gICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWluJywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICAgIG9jID0ge307XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJ21heCcsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnJywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiByLmV4YWN0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICBjYy5tYW5kYXRvcnkgPSBjYy5tYW5kYXRvcnkgfHwge307XG4gICAgICAgIGNjLm1hbmRhdG9yeVtvbGRuYW1lXygnJywga2V5KV0gPSByLmV4YWN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgWydtaW4nLCAnbWF4J10uZm9yRWFjaChmdW5jdGlvbihtaXgpIHtcbiAgICAgICAgICBpZiAoclttaXhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNjLm1hbmRhdG9yeSA9IGNjLm1hbmRhdG9yeSB8fCB7fTtcbiAgICAgICAgICAgIGNjLm1hbmRhdG9yeVtvbGRuYW1lXyhtaXgsIGtleSldID0gclttaXhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGMuYWR2YW5jZWQpIHtcbiAgICAgIGNjLm9wdGlvbmFsID0gKGNjLm9wdGlvbmFsIHx8IFtdKS5jb25jYXQoYy5hZHZhbmNlZCk7XG4gICAgfVxuICAgIHJldHVybiBjYztcbiAgfTtcblxuICB2YXIgc2hpbUNvbnN0cmFpbnRzXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBmdW5jKSB7XG4gICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgaWYgKGNvbnN0cmFpbnRzICYmIGNvbnN0cmFpbnRzLmF1ZGlvKSB7XG4gICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICB9XG4gICAgaWYgKGNvbnN0cmFpbnRzICYmIHR5cGVvZiBjb25zdHJhaW50cy52aWRlbyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIFNoaW0gZmFjaW5nTW9kZSBmb3IgbW9iaWxlLCB3aGVyZSBpdCBkZWZhdWx0cyB0byBcInVzZXJcIi5cbiAgICAgIHZhciBmYWNlID0gY29uc3RyYWludHMudmlkZW8uZmFjaW5nTW9kZTtcbiAgICAgIGZhY2UgPSBmYWNlICYmICgodHlwZW9mIGZhY2UgPT09ICdvYmplY3QnKSA/IGZhY2UgOiB7aWRlYWw6IGZhY2V9KTtcblxuICAgICAgaWYgKChmYWNlICYmIChmYWNlLmV4YWN0ID09PSAndXNlcicgfHwgZmFjZS5leGFjdCA9PT0gJ2Vudmlyb25tZW50JyB8fFxuICAgICAgICAgICAgICAgICAgICBmYWNlLmlkZWFsID09PSAndXNlcicgfHwgZmFjZS5pZGVhbCA9PT0gJ2Vudmlyb25tZW50JykpICYmXG4gICAgICAgICAgIShuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFN1cHBvcnRlZENvbnN0cmFpbnRzICYmXG4gICAgICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFN1cHBvcnRlZENvbnN0cmFpbnRzKCkuZmFjaW5nTW9kZSkpIHtcbiAgICAgICAgZGVsZXRlIGNvbnN0cmFpbnRzLnZpZGVvLmZhY2luZ01vZGU7XG4gICAgICAgIGlmIChmYWNlLmV4YWN0ID09PSAnZW52aXJvbm1lbnQnIHx8IGZhY2UuaWRlYWwgPT09ICdlbnZpcm9ubWVudCcpIHtcbiAgICAgICAgICAvLyBMb29rIGZvciBcImJhY2tcIiBpbiBsYWJlbCwgb3IgdXNlIGxhc3QgY2FtICh0eXBpY2FsbHkgYmFjayBjYW0pLlxuICAgICAgICAgIHJldHVybiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRldmljZXMpIHtcbiAgICAgICAgICAgIGRldmljZXMgPSBkZXZpY2VzLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkLmtpbmQgPT09ICd2aWRlb2lucHV0JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGJhY2sgPSBkZXZpY2VzLmZpbmQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICByZXR1cm4gZC5sYWJlbC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2JhY2snKSAhPT0gLTE7XG4gICAgICAgICAgICB9KSB8fCAoZGV2aWNlcy5sZW5ndGggJiYgZGV2aWNlc1tkZXZpY2VzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgIGlmIChiYWNrKSB7XG4gICAgICAgICAgICAgIGNvbnN0cmFpbnRzLnZpZGVvLmRldmljZUlkID0gZmFjZS5leGFjdCA/IHtleGFjdDogYmFjay5kZXZpY2VJZH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aWRlYWw6IGJhY2suZGV2aWNlSWR9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgICAgICAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMoY29uc3RyYWludHMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICB9XG4gICAgbG9nZ2luZygnY2hyb21lOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICByZXR1cm4gZnVuYyhjb25zdHJhaW50cyk7XG4gIH07XG5cbiAgdmFyIHNoaW1FcnJvcl8gPSBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgUGVybWlzc2lvbkRlbmllZEVycm9yOiAnTm90QWxsb3dlZEVycm9yJyxcbiAgICAgICAgQ29uc3RyYWludE5vdFNhdGlzZmllZEVycm9yOiAnT3ZlcmNvbnN0cmFpbmVkRXJyb3InXG4gICAgICB9W2UubmFtZV0gfHwgZS5uYW1lLFxuICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxuICAgICAgY29uc3RyYWludDogZS5jb25zdHJhaW50TmFtZSxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICh0aGlzLm1lc3NhZ2UgJiYgJzogJykgKyB0aGlzLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICB2YXIgZ2V0VXNlck1lZGlhXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICBzaGltQ29uc3RyYWludHNfKGNvbnN0cmFpbnRzLCBmdW5jdGlvbihjKSB7XG4gICAgICBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhKGMsIG9uU3VjY2VzcywgZnVuY3Rpb24oZSkge1xuICAgICAgICBvbkVycm9yKHNoaW1FcnJvcl8oZSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGdldFVzZXJNZWRpYV87XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYShjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge1xuICAgICAgZ2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGVudW1lcmF0ZURldmljZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIHZhciBraW5kcyA9IHthdWRpbzogJ2F1ZGlvaW5wdXQnLCB2aWRlbzogJ3ZpZGVvaW5wdXQnfTtcbiAgICAgICAgICByZXR1cm4gTWVkaWFTdHJlYW1UcmFjay5nZXRTb3VyY2VzKGZ1bmN0aW9uKGRldmljZXMpIHtcbiAgICAgICAgICAgIHJlc29sdmUoZGV2aWNlcy5tYXAoZnVuY3Rpb24oZGV2aWNlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7bGFiZWw6IGRldmljZS5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICBraW5kOiBraW5kc1tkZXZpY2Uua2luZF0sXG4gICAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQ6IGRldmljZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICBncm91cElkOiAnJ307XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBBIHNoaW0gZm9yIGdldFVzZXJNZWRpYSBtZXRob2Qgb24gdGhlIG1lZGlhRGV2aWNlcyBvYmplY3QuXG4gIC8vIFRPRE8oS2FwdGVuSmFuc3NvbikgcmVtb3ZlIG9uY2UgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIHN0YWJsZS5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSkge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICAgIHJldHVybiBnZXRVc2VyTWVkaWFQcm9taXNlXyhjb25zdHJhaW50cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVuIHRob3VnaCBDaHJvbWUgNDUgaGFzIG5hdmlnYXRvci5tZWRpYURldmljZXMgYW5kIGEgZ2V0VXNlck1lZGlhXG4gICAgLy8gZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIFByb21pc2UsIGl0IGRvZXMgbm90IGFjY2VwdCBzcGVjLXN0eWxlXG4gICAgLy8gY29uc3RyYWludHMuXG4gICAgdmFyIG9yaWdHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGNzKSB7XG4gICAgICByZXR1cm4gc2hpbUNvbnN0cmFpbnRzXyhjcywgZnVuY3Rpb24oYykge1xuICAgICAgICByZXR1cm4gb3JpZ0dldFVzZXJNZWRpYShjKS50aGVuKGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgIGlmIChjLmF1ZGlvICYmICFzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGggfHxcbiAgICAgICAgICAgICAgYy52aWRlbyAmJiAhc3RyZWFtLmdldFZpZGVvVHJhY2tzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB0cmFjay5zdG9wKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJycsICdOb3RGb3VuZEVycm9yJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoc2hpbUVycm9yXyhlKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIER1bW15IGRldmljZWNoYW5nZSBldmVudCBtZXRob2RzLlxuICAvLyBUT0RPKEthcHRlbkphbnNzb24pIHJlbW92ZSBvbmNlIGltcGxlbWVudGVkIGluIENocm9tZSBzdGFibGUuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgbG9nZ2luZygnRHVtbXkgbWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgY2FsbGVkLicpO1xuICAgIH07XG4gIH1cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb2dnaW5nKCdEdW1teSBtZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciBjYWxsZWQuJyk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU0RQVXRpbHMgPSByZXF1aXJlKCdzZHAnKTtcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG5cbnZhciBlZGdlU2hpbSA9IHtcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAod2luZG93LlJUQ0ljZUdhdGhlcmVyKSB7XG4gICAgICAvLyBPUlRDIGRlZmluZXMgYW4gUlRDSWNlQ2FuZGlkYXRlIG9iamVjdCBidXQgbm8gY29uc3RydWN0b3IuXG4gICAgICAvLyBOb3QgaW1wbGVtZW50ZWQgaW4gRWRnZS5cbiAgICAgIGlmICghd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSkge1xuICAgICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgIHJldHVybiBhcmdzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gT1JUQyBkb2VzIG5vdCBoYXZlIGEgc2Vzc2lvbiBkZXNjcmlwdGlvbiBvYmplY3QgYnV0XG4gICAgICAvLyBvdGhlciBicm93c2VycyAoaS5lLiBDaHJvbWUpIHRoYXQgd2lsbCBzdXBwb3J0IGJvdGggUEMgYW5kIE9SVENcbiAgICAgIC8vIGluIHRoZSBmdXR1cmUgbWlnaHQgaGF2ZSB0aGlzIGRlZmluZWQgYWxyZWFkeS5cbiAgICAgIGlmICghd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbikge1xuICAgICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgIHJldHVybiBhcmdzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gdGhpcyBhZGRzIGFuIGFkZGl0aW9uYWwgZXZlbnQgbGlzdGVuZXIgdG8gTWVkaWFTdHJhY2tUcmFjayB0aGF0IHNpZ25hbHNcbiAgICAgIC8vIHdoZW4gYSB0cmFja3MgZW5hYmxlZCBwcm9wZXJ0eSB3YXMgY2hhbmdlZC5cbiAgICAgIHZhciBvcmlnTVNURW5hYmxlZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoXG4gICAgICAgICAgTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUsICdlbmFibGVkJyk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUsICdlbmFibGVkJywge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgb3JpZ01TVEVuYWJsZWQuc2V0LmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgIHZhciBldiA9IG5ldyBFdmVudCgnZW5hYmxlZCcpO1xuICAgICAgICAgIGV2LmVuYWJsZWQgPSB2YWx1ZTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXYpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIF9ldmVudFRhcmdldCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgIFsnYWRkRXZlbnRMaXN0ZW5lcicsICdyZW1vdmVFdmVudExpc3RlbmVyJywgJ2Rpc3BhdGNoRXZlbnQnXVxuICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgc2VsZlttZXRob2RdID0gX2V2ZW50VGFyZ2V0W21ldGhvZF0uYmluZChfZXZlbnRUYXJnZXQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9uaWNlY2FuZGlkYXRlID0gbnVsbDtcbiAgICAgIHRoaXMub25hZGRzdHJlYW0gPSBudWxsO1xuICAgICAgdGhpcy5vbnRyYWNrID0gbnVsbDtcbiAgICAgIHRoaXMub25yZW1vdmVzdHJlYW0gPSBudWxsO1xuICAgICAgdGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkID0gbnVsbDtcbiAgICAgIHRoaXMub25kYXRhY2hhbm5lbCA9IG51bGw7XG5cbiAgICAgIHRoaXMubG9jYWxTdHJlYW1zID0gW107XG4gICAgICB0aGlzLnJlbW90ZVN0cmVhbXMgPSBbXTtcbiAgICAgIHRoaXMuZ2V0TG9jYWxTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmLmxvY2FsU3RyZWFtcztcbiAgICAgIH07XG4gICAgICB0aGlzLmdldFJlbW90ZVN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYucmVtb3RlU3RyZWFtcztcbiAgICAgIH07XG5cbiAgICAgIHRoaXMubG9jYWxEZXNjcmlwdGlvbiA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgc2RwOiAnJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICcnLFxuICAgICAgICBzZHA6ICcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2lnbmFsaW5nU3RhdGUgPSAnc3RhYmxlJztcbiAgICAgIHRoaXMuaWNlQ29ubmVjdGlvblN0YXRlID0gJ25ldyc7XG4gICAgICB0aGlzLmljZUdhdGhlcmluZ1N0YXRlID0gJ25ldyc7XG5cbiAgICAgIHRoaXMuaWNlT3B0aW9ucyA9IHtcbiAgICAgICAgZ2F0aGVyUG9saWN5OiAnYWxsJyxcbiAgICAgICAgaWNlU2VydmVyczogW11cbiAgICAgIH07XG4gICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgc3dpdGNoIChjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgICAgY2FzZSAnYWxsJzpcbiAgICAgICAgICBjYXNlICdyZWxheSc6XG4gICAgICAgICAgICB0aGlzLmljZU9wdGlvbnMuZ2F0aGVyUG9saWN5ID0gY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICAgICAgLy8gRklYTUU6IHJlbW92ZSBvbmNlIGltcGxlbWVudGF0aW9uIGFuZCBzcGVjIGhhdmUgYWRkZWQgdGhpcy5cbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ljZVRyYW5zcG9ydFBvbGljeSBcIm5vbmVcIiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIGRvbid0IHNldCBpY2VUcmFuc3BvcnRQb2xpY3kuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy51c2luZ0J1bmRsZSA9IGNvbmZpZyAmJiBjb25maWcuYnVuZGxlUG9saWN5ID09PSAnbWF4LWJ1bmRsZSc7XG5cbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgLy8gRWRnZSBkb2VzIG5vdCBsaWtlXG4gICAgICAgIC8vIDEpIHN0dW46XG4gICAgICAgIC8vIDIpIHR1cm46IHRoYXQgZG9lcyBub3QgaGF2ZSBhbGwgb2YgdHVybjpob3N0OnBvcnQ/dHJhbnNwb3J0PXVkcFxuICAgICAgICAvLyAzKSB0dXJuOiB3aXRoIGlwdjYgYWRkcmVzc2VzXG4gICAgICAgIHZhciBpY2VTZXJ2ZXJzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25maWcuaWNlU2VydmVycykpO1xuICAgICAgICB0aGlzLmljZU9wdGlvbnMuaWNlU2VydmVycyA9IGljZVNlcnZlcnMuZmlsdGVyKGZ1bmN0aW9uKHNlcnZlcikge1xuICAgICAgICAgIGlmIChzZXJ2ZXIgJiYgc2VydmVyLnVybHMpIHtcbiAgICAgICAgICAgIHZhciB1cmxzID0gc2VydmVyLnVybHM7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHVybHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHVybHMgPSBbdXJsc107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cmxzID0gdXJscy5maWx0ZXIoZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICAgIHJldHVybiAodXJsLmluZGV4T2YoJ3R1cm46JykgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgIHVybC5pbmRleE9mKCd0cmFuc3BvcnQ9dWRwJykgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgICB1cmwuaW5kZXhPZigndHVybjpbJykgPT09IC0xKSB8fFxuICAgICAgICAgICAgICAgICAgKHVybC5pbmRleE9mKCdzdHVuOicpID09PSAwICYmXG4gICAgICAgICAgICAgICAgICAgIGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPj0gMTQzOTMpO1xuICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICByZXR1cm4gISF1cmxzO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAvLyBwZXItdHJhY2sgaWNlR2F0aGVycywgaWNlVHJhbnNwb3J0cywgZHRsc1RyYW5zcG9ydHMsIHJ0cFNlbmRlcnMsIC4uLlxuICAgICAgLy8gZXZlcnl0aGluZyB0aGF0IGlzIG5lZWRlZCB0byBkZXNjcmliZSBhIFNEUCBtLWxpbmUuXG4gICAgICB0aGlzLnRyYW5zY2VpdmVycyA9IFtdO1xuXG4gICAgICAvLyBzaW5jZSB0aGUgaWNlR2F0aGVyZXIgaXMgY3VycmVudGx5IGNyZWF0ZWQgaW4gY3JlYXRlT2ZmZXIgYnV0IHdlXG4gICAgICAvLyBtdXN0IG5vdCBlbWl0IGNhbmRpZGF0ZXMgdW50aWwgYWZ0ZXIgc2V0TG9jYWxEZXNjcmlwdGlvbiB3ZSBidWZmZXJcbiAgICAgIC8vIHRoZW0gaW4gdGhpcyBhcnJheS5cbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlciA9IFtdO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYubG9jYWxEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgLy8gRklYTUU6IG5lZWQgdG8gYXBwbHkgaWNlIGNhbmRpZGF0ZXMgaW4gYSB3YXkgd2hpY2ggaXMgYXN5bmMgYnV0XG4gICAgICAvLyBpbi1vcmRlclxuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGVuZCA9ICFldmVudC5jYW5kaWRhdGUgfHwgT2JqZWN0LmtleXMoZXZlbnQuY2FuZGlkYXRlKS5sZW5ndGggPT09IDA7XG4gICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHNlY3Rpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnNbal0uaW5kZXhPZignXFxyXFxuYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbicpID09PSAtMSkge1xuICAgICAgICAgICAgICBzZWN0aW9uc1tqXSArPSAnYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUuaW5kZXhPZigndHlwIGVuZE9mQ2FuZGlkYXRlcycpXG4gICAgICAgICAgICA9PT0gLTEpIHtcbiAgICAgICAgICBzZWN0aW9uc1tldmVudC5jYW5kaWRhdGUuc2RwTUxpbmVJbmRleCArIDFdICs9XG4gICAgICAgICAgICAgICdhPScgKyBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlICsgJ1xcclxcbic7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZXZlbnQuY2FuZGlkYXRlICYmIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICB2YXIgY29tcGxldGUgPSBzZWxmLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyICYmXG4gICAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdjb21wbGV0ZWQnO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlciA9IFtdO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAvLyBDbG9uZSBpcyBuZWNlc3NhcnkgZm9yIGxvY2FsIGRlbW9zIG1vc3RseSwgYXR0YWNoaW5nIGRpcmVjdGx5XG4gICAgICAvLyB0byB0d28gZGlmZmVyZW50IHNlbmRlcnMgZG9lcyBub3Qgd29yayAoYnVpbGQgMTA1NDcpLlxuICAgICAgdmFyIGNsb25lZFN0cmVhbSA9IHN0cmVhbS5jbG9uZSgpO1xuICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2ssIGlkeCkge1xuICAgICAgICB2YXIgY2xvbmVkVHJhY2sgPSBjbG9uZWRTdHJlYW0uZ2V0VHJhY2tzKClbaWR4XTtcbiAgICAgICAgdHJhY2suYWRkRXZlbnRMaXN0ZW5lcignZW5hYmxlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgY2xvbmVkVHJhY2suZW5hYmxlZCA9IGV2ZW50LmVuYWJsZWQ7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcy5wdXNoKGNsb25lZFN0cmVhbSk7XG4gICAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgdmFyIGlkeCA9IHRoaXMubG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKTtcbiAgICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgICB0aGlzLmxvY2FsU3RyZWFtcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgdGhpcy5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTZW5kZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2NlaXZlcnMuZmlsdGVyKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHJldHVybiAhIXRyYW5zY2VpdmVyLnJ0cFNlbmRlcjtcbiAgICAgIH0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5ydHBTZW5kZXI7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRSZWNlaXZlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zY2VpdmVycy5maWx0ZXIoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICB9KVxuICAgICAgLm1hcChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lcyB0aGUgaW50ZXJzZWN0aW9uIG9mIGxvY2FsIGFuZCByZW1vdGUgY2FwYWJpbGl0aWVzLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2dldENvbW1vbkNhcGFiaWxpdGllcyA9XG4gICAgICAgIGZ1bmN0aW9uKGxvY2FsQ2FwYWJpbGl0aWVzLCByZW1vdGVDYXBhYmlsaXRpZXMpIHtcbiAgICAgICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0ge1xuICAgICAgICAgICAgY29kZWNzOiBbXSxcbiAgICAgICAgICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxuICAgICAgICAgICAgZmVjTWVjaGFuaXNtczogW11cbiAgICAgICAgICB9O1xuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGxDb2RlYykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciByQ29kZWMgPSByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzW2ldO1xuICAgICAgICAgICAgICBpZiAobENvZGVjLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gckNvZGVjLm5hbWUudG9Mb3dlckNhc2UoKSAmJlxuICAgICAgICAgICAgICAgICAgbENvZGVjLmNsb2NrUmF0ZSA9PT0gckNvZGVjLmNsb2NrUmF0ZSkge1xuICAgICAgICAgICAgICAgIC8vIG51bWJlciBvZiBjaGFubmVscyBpcyB0aGUgaGlnaGVzdCBjb21tb24gbnVtYmVyIG9mIGNoYW5uZWxzXG4gICAgICAgICAgICAgICAgckNvZGVjLm51bUNoYW5uZWxzID0gTWF0aC5taW4obENvZGVjLm51bUNoYW5uZWxzLFxuICAgICAgICAgICAgICAgICAgICByQ29kZWMubnVtQ2hhbm5lbHMpO1xuICAgICAgICAgICAgICAgIC8vIHB1c2ggckNvZGVjIHNvIHdlIHJlcGx5IHdpdGggb2ZmZXJlciBwYXlsb2FkIHR5cGVcbiAgICAgICAgICAgICAgICBjb21tb25DYXBhYmlsaXRpZXMuY29kZWNzLnB1c2gockNvZGVjKTtcblxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSBjb21tb24gZmVlZGJhY2sgbWVjaGFuaXNtc1xuICAgICAgICAgICAgICAgIHJDb2RlYy5ydGNwRmVlZGJhY2sgPSByQ29kZWMucnRjcEZlZWRiYWNrLmZpbHRlcihmdW5jdGlvbihmYikge1xuICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsQ29kZWMucnRjcEZlZWRiYWNrLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsQ29kZWMucnRjcEZlZWRiYWNrW2pdLnR5cGUgPT09IGZiLnR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxDb2RlYy5ydGNwRmVlZGJhY2tbal0ucGFyYW1ldGVyID09PSBmYi5wYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBhbHNvIG5lZWQgdG8gZGV0ZXJtaW5lIC5wYXJhbWV0ZXJzXG4gICAgICAgICAgICAgICAgLy8gIHNlZSBodHRwczovL2dpdGh1Yi5jb20vb3BlbnBlZXIvb3J0Yy9pc3N1ZXMvNTY5XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obEhlYWRlckV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3RlQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgaSsrKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgckhlYWRlckV4dGVuc2lvbiA9IHJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgaWYgKGxIZWFkZXJFeHRlbnNpb24udXJpID09PSBySGVhZGVyRXh0ZW5zaW9uLnVyaSkge1xuICAgICAgICAgICAgICAgICAgICBjb21tb25DYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5wdXNoKHJIZWFkZXJFeHRlbnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gRklYTUU6IGZlY01lY2hhbmlzbXNcbiAgICAgICAgICByZXR1cm4gY29tbW9uQ2FwYWJpbGl0aWVzO1xuICAgICAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIElDRSBnYXRoZXJlciwgSUNFIHRyYW5zcG9ydCBhbmQgRFRMUyB0cmFuc3BvcnQuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMgPVxuICAgICAgICBmdW5jdGlvbihtaWQsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIGljZUdhdGhlcmVyID0gbmV3IFJUQ0ljZUdhdGhlcmVyKHNlbGYuaWNlT3B0aW9ucyk7XG4gICAgICAgICAgdmFyIGljZVRyYW5zcG9ydCA9IG5ldyBSVENJY2VUcmFuc3BvcnQoaWNlR2F0aGVyZXIpO1xuICAgICAgICAgIGljZUdhdGhlcmVyLm9ubG9jYWxjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJyk7XG4gICAgICAgICAgICBldmVudC5jYW5kaWRhdGUgPSB7c2RwTWlkOiBtaWQsIHNkcE1MaW5lSW5kZXg6IHNkcE1MaW5lSW5kZXh9O1xuXG4gICAgICAgICAgICB2YXIgY2FuZCA9IGV2dC5jYW5kaWRhdGU7XG4gICAgICAgICAgICB2YXIgZW5kID0gIWNhbmQgfHwgT2JqZWN0LmtleXMoY2FuZCkubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgLy8gRWRnZSBlbWl0cyBhbiBlbXB0eSBvYmplY3QgZm9yIFJUQ0ljZUNhbmRpZGF0ZUNvbXBsZXRl4oClXG4gICAgICAgICAgICBpZiAoZW5kKSB7XG4gICAgICAgICAgICAgIC8vIHBvbHlmaWxsIHNpbmNlIFJUQ0ljZUdhdGhlcmVyLnN0YXRlIGlzIG5vdCBpbXBsZW1lbnRlZCBpblxuICAgICAgICAgICAgICAvLyBFZGdlIDEwNTQ3IHlldC5cbiAgICAgICAgICAgICAgaWYgKGljZUdhdGhlcmVyLnN0YXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpY2VHYXRoZXJlci5zdGF0ZSA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gRW1pdCBhIGNhbmRpZGF0ZSB3aXRoIHR5cGUgZW5kT2ZDYW5kaWRhdGVzIHRvIG1ha2UgdGhlIHNhbXBsZXNcbiAgICAgICAgICAgICAgLy8gd29yay4gRWRnZSByZXF1aXJlcyBhZGRJY2VDYW5kaWRhdGUgd2l0aCB0aGlzIGVtcHR5IGNhbmRpZGF0ZVxuICAgICAgICAgICAgICAvLyB0byBzdGFydCBjaGVja2luZy4gVGhlIHJlYWwgc29sdXRpb24gaXMgdG8gc2lnbmFsXG4gICAgICAgICAgICAgIC8vIGVuZC1vZi1jYW5kaWRhdGVzIHRvIHRoZSBvdGhlciBzaWRlIHdoZW4gZ2V0dGluZyB0aGUgbnVsbFxuICAgICAgICAgICAgICAvLyBjYW5kaWRhdGUgYnV0IHNvbWUgYXBwcyAobGlrZSB0aGUgc2FtcGxlcykgZG9uJ3QgZG8gdGhhdC5cbiAgICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSA9XG4gICAgICAgICAgICAgICAgICAnY2FuZGlkYXRlOjEgMSB1ZHAgMSAwLjAuMC4wIDkgdHlwIGVuZE9mQ2FuZGlkYXRlcyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBSVENJY2VDYW5kaWRhdGUgZG9lc24ndCBoYXZlIGEgY29tcG9uZW50LCBuZWVkcyB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICBjYW5kLmNvbXBvbmVudCA9IGljZVRyYW5zcG9ydC5jb21wb25lbnQgPT09ICdSVENQJyA/IDIgOiAxO1xuICAgICAgICAgICAgICBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlID0gU0RQVXRpbHMud3JpdGVDYW5kaWRhdGUoY2FuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSBsb2NhbCBkZXNjcmlwdGlvbi5cbiAgICAgICAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZS5pbmRleE9mKCd0eXAgZW5kT2ZDYW5kaWRhdGVzJylcbiAgICAgICAgICAgICAgICA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXggKyAxXSArPVxuICAgICAgICAgICAgICAgICAgJ2E9JyArIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgKyAnXFxyXFxuJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlY3Rpb25zW2V2ZW50LmNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICsgMV0gKz1cbiAgICAgICAgICAgICAgICAgICdhPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYubG9jYWxEZXNjcmlwdGlvbi5zZHAgPSBzZWN0aW9ucy5qb2luKCcnKTtcblxuICAgICAgICAgICAgdmFyIGNvbXBsZXRlID0gc2VsZi50cmFuc2NlaXZlcnMuZXZlcnkoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyICYmXG4gICAgICAgICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRW1pdCBjYW5kaWRhdGUgaWYgbG9jYWxEZXNjcmlwdGlvbiBpcyBzZXQuXG4gICAgICAgICAgICAvLyBBbHNvIGVtaXRzIG51bGwgY2FuZGlkYXRlIHdoZW4gYWxsIGdhdGhlcmVycyBhcmUgY29tcGxldGUuXG4gICAgICAgICAgICBzd2l0Y2ggKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUpIHtcbiAgICAgICAgICAgICAgY2FzZSAnbmV3JzpcbiAgICAgICAgICAgICAgICBzZWxmLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZCAmJiBjb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdnYXRoZXJpbmcnOlxuICAgICAgICAgICAgICAgIHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLm9uaWNlY2FuZGlkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uaWNlY2FuZGlkYXRlKG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdjb21wbGV0ZSc6XG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIG5vdCBoYXBwZW4uLi4gY3VycmVudGx5IVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OiAvLyBuby1vcC5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGljZVRyYW5zcG9ydC5vbmljZXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQgPSBuZXcgUlRDRHRsc1RyYW5zcG9ydChpY2VUcmFuc3BvcnQpO1xuICAgICAgICAgIGR0bHNUcmFuc3BvcnQub25kdGxzc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgZHRsc1RyYW5zcG9ydC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBvbmVycm9yIGRvZXMgbm90IHNldCBzdGF0ZSB0byBmYWlsZWQgYnkgaXRzZWxmLlxuICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGF0ZSA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpY2VHYXRoZXJlcjogaWNlR2F0aGVyZXIsXG4gICAgICAgICAgICBpY2VUcmFuc3BvcnQ6IGljZVRyYW5zcG9ydCxcbiAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IGR0bHNUcmFuc3BvcnRcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgLy8gU3RhcnQgdGhlIFJUUCBTZW5kZXIgYW5kIFJlY2VpdmVyIGZvciBhIHRyYW5zY2VpdmVyLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3RyYW5zY2VpdmUgPSBmdW5jdGlvbih0cmFuc2NlaXZlcixcbiAgICAgICAgc2VuZCwgcmVjdikge1xuICAgICAgdmFyIHBhcmFtcyA9IHRoaXMuX2dldENvbW1vbkNhcGFiaWxpdGllcyh0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xuICAgICAgaWYgKHNlbmQgJiYgdHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICBwYXJhbXMucnRjcCA9IHtcbiAgICAgICAgICBjbmFtZTogU0RQVXRpbHMubG9jYWxDTmFtZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbXMucnRjcC5zc3JjID0gdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zZW5kKHBhcmFtcyk7XG4gICAgICB9XG4gICAgICBpZiAocmVjdiAmJiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgICAgICAvLyByZW1vdmUgUlRYIGZpZWxkIGluIEVkZ2UgMTQ5NDJcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmtpbmQgPT09ICd2aWRlbydcbiAgICAgICAgICAgICYmIHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgZGVsZXRlIHAucnR4O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICBwYXJhbXMucnRjcCA9IHtcbiAgICAgICAgICBjbmFtZTogdHJhbnNjZWl2ZXIuY25hbWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5yZWNlaXZlKHBhcmFtcyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0TG9jYWxEZXNjcmlwdGlvbiA9XG4gICAgICAgIGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBzZWN0aW9ucztcbiAgICAgICAgICB2YXIgc2Vzc2lvbnBhcnQ7XG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicpIHtcbiAgICAgICAgICAgIC8vIEZJWE1FOiBXaGF0IHdhcyB0aGUgcHVycG9zZSBvZiB0aGlzIGVtcHR5IGlmIHN0YXRlbWVudD9cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICAgICAgICAvLyBWRVJZIGxpbWl0ZWQgc3VwcG9ydCBmb3IgU0RQIG11bmdpbmcuIExpbWl0ZWQgdG86XG4gICAgICAgICAgICAgIC8vICogY2hhbmdpbmcgdGhlIG9yZGVyIG9mIGNvZGVjc1xuICAgICAgICAgICAgICBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoZGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBjYXBzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICAgICAgc2VsZi5fcGVuZGluZ09mZmVyW3NkcE1MaW5lSW5kZXhdLmxvY2FsQ2FwYWJpbGl0aWVzID0gY2FwcztcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHRoaXMudHJhbnNjZWl2ZXJzID0gdGhpcy5fcGVuZGluZ09mZmVyO1xuICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fcGVuZGluZ09mZmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicpIHtcbiAgICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhzZWxmLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgICB2YXIgaXNJY2VMaXRlID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoc2Vzc2lvbnBhcnQsXG4gICAgICAgICAgICAgICAgJ2E9aWNlLWxpdGUnKS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgICAgICAgIHZhciBpY2VHYXRoZXJlciA9IHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyO1xuICAgICAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzO1xuICAgICAgICAgICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzO1xuXG4gICAgICAgICAgICAgIHZhciByZWplY3RlZCA9IG1lZGlhU2VjdGlvbi5zcGxpdCgnXFxuJywgMSlbMF1cbiAgICAgICAgICAgICAgICAgIC5zcGxpdCgnICcsIDIpWzFdID09PSAnMCc7XG5cbiAgICAgICAgICAgICAgaWYgKCFyZWplY3RlZCAmJiAhdHJhbnNjZWl2ZXIuaXNEYXRhY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhcbiAgICAgICAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzSWNlTGl0ZSkge1xuICAgICAgICAgICAgICAgICAgdmFyIGNhbmRzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1jYW5kaWRhdGU6JylcbiAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoY2FuZCk7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYW5kLmNvbXBvbmVudCA9PT0gJzEnO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAvLyBpY2UtbGl0ZSBvbmx5IGluY2x1ZGVzIGhvc3QgY2FuZGlkYXRlcyBpbiB0aGUgU0RQIHNvIHdlIGNhblxuICAgICAgICAgICAgICAgICAgLy8gdXNlIHNldFJlbW90ZUNhbmRpZGF0ZXMgKHdoaWNoIGltcGxpZXMgYW5cbiAgICAgICAgICAgICAgICAgIC8vIFJUQ0ljZUNhbmRpZGF0ZUNvbXBsZXRlKVxuICAgICAgICAgICAgICAgICAgaWYgKGNhbmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZW1vdGVEdGxzUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzKFxuICAgICAgICAgICAgICAgICAgICBtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNJY2VMaXRlKSB7XG4gICAgICAgICAgICAgICAgICByZW1vdGVEdGxzUGFyYW1ldGVycy5yb2xlID0gJ3NlcnZlcic7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFzZWxmLnVzaW5nQnVuZGxlIHx8IHNkcE1MaW5lSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zdGFydChpY2VHYXRoZXJlciwgcmVtb3RlSWNlUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgICBpc0ljZUxpdGUgPyAnY29udHJvbGxpbmcnIDogJ2NvbnRyb2xsZWQnKTtcbiAgICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBzZWxmLl9nZXRDb21tb25DYXBhYmlsaXRpZXMobG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcyk7XG5cbiAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgUlRDUnRwU2VuZGVyLiBUaGUgUlRDUnRwUmVjZWl2ZXIgZm9yIHRoaXNcbiAgICAgICAgICAgICAgICAvLyB0cmFuc2NlaXZlciBoYXMgYWxyZWFkeSBiZWVuIHN0YXJ0ZWQgaW4gc2V0UmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZSh0cmFuc2NlaXZlcixcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNvZGVjcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubG9jYWxEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnR5cGUsXG4gICAgICAgICAgICBzZHA6IGRlc2NyaXB0aW9uLnNkcFxuICAgICAgICAgIH07XG4gICAgICAgICAgc3dpdGNoIChkZXNjcmlwdGlvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdvZmZlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdoYXZlLWxvY2FsLW9mZmVyJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5zd2VyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ3N0YWJsZScpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Vuc3VwcG9ydGVkIHR5cGUgXCInICsgZGVzY3JpcHRpb24udHlwZSArXG4gICAgICAgICAgICAgICAgICAnXCInKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiBhIHN1Y2Nlc3MgY2FsbGJhY2sgd2FzIHByb3ZpZGVkLCBlbWl0IElDRSBjYW5kaWRhdGVzIGFmdGVyIGl0XG4gICAgICAgICAgLy8gaGFzIGJlZW4gZXhlY3V0ZWQuIE90aGVyd2lzZSwgZW1pdCBjYWxsYmFjayBhZnRlciB0aGUgUHJvbWlzZSBpc1xuICAgICAgICAgIC8vIHJlc29sdmVkLlxuICAgICAgICAgIHZhciBoYXNDYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgICB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nO1xuICAgICAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNiID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgIGlmIChzZWxmLmljZUdhdGhlcmluZ1N0YXRlID09PSAnbmV3Jykge1xuICAgICAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnZ2F0aGVyaW5nJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHAgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICBwLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWhhc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLmljZUdhdGhlcmluZ1N0YXRlID09PSAnbmV3Jykge1xuICAgICAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnZ2F0aGVyaW5nJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBVc3VhbGx5IGNhbmRpZGF0ZXMgd2lsbCBiZSBlbWl0dGVkIGVhcmxpZXIuXG4gICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMuYmluZChzZWxmKSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0UmVtb3RlRGVzY3JpcHRpb24gPVxuICAgICAgICBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICB2YXIgc3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgICAgdmFyIHJlY2VpdmVyTGlzdCA9IFtdO1xuICAgICAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoZGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICB2YXIgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgIHZhciBpc0ljZUxpdGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChzZXNzaW9ucGFydCxcbiAgICAgICAgICAgICAgJ2E9aWNlLWxpdGUnKS5sZW5ndGggPiAwO1xuICAgICAgICAgIHRoaXMudXNpbmdCdW5kbGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChzZXNzaW9ucGFydCxcbiAgICAgICAgICAgICAgJ2E9Z3JvdXA6QlVORExFICcpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgIHZhciBtbGluZSA9IGxpbmVzWzBdLnN1YnN0cigyKS5zcGxpdCgnICcpO1xuICAgICAgICAgICAgdmFyIGtpbmQgPSBtbGluZVswXTtcbiAgICAgICAgICAgIHZhciByZWplY3RlZCA9IG1saW5lWzFdID09PSAnMCc7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gU0RQVXRpbHMuZ2V0RGlyZWN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuXG4gICAgICAgICAgICB2YXIgbWlkID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1taWQ6Jyk7XG4gICAgICAgICAgICBpZiAobWlkLmxlbmd0aCkge1xuICAgICAgICAgICAgICBtaWQgPSBtaWRbMF0uc3Vic3RyKDYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWlkID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlamVjdCBkYXRhY2hhbm5lbHMgd2hpY2ggYXJlIG5vdCBpbXBsZW1lbnRlZCB5ZXQuXG4gICAgICAgICAgICBpZiAoa2luZCA9PT0gJ2FwcGxpY2F0aW9uJyAmJiBtbGluZVsyXSA9PT0gJ0RUTFMvU0NUUCcpIHtcbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gPSB7XG4gICAgICAgICAgICAgICAgbWlkOiBtaWQsXG4gICAgICAgICAgICAgICAgaXNEYXRhY2hhbm5lbDogdHJ1ZVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2NlaXZlcjtcbiAgICAgICAgICAgIHZhciBpY2VHYXRoZXJlcjtcbiAgICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgIHZhciBydHBTZW5kZXI7XG4gICAgICAgICAgICB2YXIgcnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzO1xuXG4gICAgICAgICAgICB2YXIgdHJhY2s7XG4gICAgICAgICAgICAvLyBGSVhNRTogZW5zdXJlIHRoZSBtZWRpYVNlY3Rpb24gaGFzIHJ0Y3AtbXV4IHNldC5cbiAgICAgICAgICAgIHZhciByZW1vdGVDYXBhYmlsaXRpZXMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgaWYgKCFyZWplY3RlZCkge1xuICAgICAgICAgICAgICByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICByZW1vdGVEdGxzUGFyYW1ldGVycy5yb2xlID0gJ2NsaWVudCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzID1cbiAgICAgICAgICAgICAgICBTRFBVdGlscy5wYXJzZVJ0cEVuY29kaW5nUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuXG4gICAgICAgICAgICB2YXIgY25hbWU7XG4gICAgICAgICAgICAvLyBHZXRzIHRoZSBmaXJzdCBTU1JDLiBOb3RlIHRoYXQgd2l0aCBSVFggdGhlcmUgbWlnaHQgYmUgbXVsdGlwbGVcbiAgICAgICAgICAgIC8vIFNTUkNzLlxuICAgICAgICAgICAgdmFyIHJlbW90ZVNzcmMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgICAgICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChyZW1vdGVTc3JjKSB7XG4gICAgICAgICAgICAgIGNuYW1lID0gcmVtb3RlU3NyYy52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgJ2E9ZW5kLW9mLWNhbmRpZGF0ZXMnLCBzZXNzaW9ucGFydCkubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIHZhciBjYW5kcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9Y2FuZGlkYXRlOicpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoY2FuZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjYW5kLmNvbXBvbmVudCA9PT0gJzEnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHZhciB0cmFuc3BvcnRzID0gc2VsZi51c2luZ0J1bmRsZSAmJiBzZHBNTGluZUluZGV4ID4gMCA/IHtcbiAgICAgICAgICAgICAgICBpY2VHYXRoZXJlcjogc2VsZi50cmFuc2NlaXZlcnNbMF0uaWNlR2F0aGVyZXIsXG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0OiBzZWxmLnRyYW5zY2VpdmVyc1swXS5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogc2VsZi50cmFuc2NlaXZlcnNbMF0uZHRsc1RyYW5zcG9ydFxuICAgICAgICAgICAgICB9IDogc2VsZi5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMobWlkLCBzZHBNTGluZUluZGV4KTtcblxuICAgICAgICAgICAgICBpZiAoaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMgPSBSVENSdHBSZWNlaXZlci5nZXRDYXBhYmlsaXRpZXMoa2luZCk7XG5cbiAgICAgICAgICAgICAgLy8gZmlsdGVyIFJUWCB1bnRpbCBhZGRpdGlvbmFsIHN0dWZmIG5lZWRlZCBmb3IgUlRYIGlzIGltcGxlbWVudGVkXG4gICAgICAgICAgICAgIC8vIGluIGFkYXB0ZXIuanNcbiAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzID0gbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2RlYy5uYW1lICE9PSAncnR4JztcbiAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSBbe1xuICAgICAgICAgICAgICAgIHNzcmM6ICgyICogc2RwTUxpbmVJbmRleCArIDIpICogMTAwMVxuICAgICAgICAgICAgICB9XTtcblxuICAgICAgICAgICAgICBydHBSZWNlaXZlciA9IG5ldyBSVENSdHBSZWNlaXZlcih0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsIGtpbmQpO1xuXG4gICAgICAgICAgICAgIHRyYWNrID0gcnRwUmVjZWl2ZXIudHJhY2s7XG4gICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5wdXNoKFt0cmFjaywgcnRwUmVjZWl2ZXJdKTtcbiAgICAgICAgICAgICAgLy8gRklYTUU6IG5vdCBjb3JyZWN0IHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIHN0cmVhbXMgYnV0IHRoYXQgaXNcbiAgICAgICAgICAgICAgLy8gbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQgaW4gdGhpcyBzaGltLlxuICAgICAgICAgICAgICBzdHJlYW0uYWRkVHJhY2sodHJhY2spO1xuXG4gICAgICAgICAgICAgIC8vIEZJWE1FOiBsb29rIGF0IGRpcmVjdGlvbi5cbiAgICAgICAgICAgICAgaWYgKHNlbGYubG9jYWxTdHJlYW1zLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgIHNlbGYubG9jYWxTdHJlYW1zWzBdLmdldFRyYWNrcygpLmxlbmd0aCA+PSBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsVHJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKGtpbmQgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAgICAgICAgIGxvY2FsVHJhY2sgPSBzZWxmLmxvY2FsU3RyZWFtc1swXS5nZXRBdWRpb1RyYWNrcygpWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgICAgICAgICAgbG9jYWxUcmFjayA9IHNlbGYubG9jYWxTdHJlYW1zWzBdLmdldFZpZGVvVHJhY2tzKClbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChsb2NhbFRyYWNrKSB7XG4gICAgICAgICAgICAgICAgICBydHBTZW5kZXIgPSBuZXcgUlRDUnRwU2VuZGVyKGxvY2FsVHJhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNwb3J0cy5pY2VHYXRoZXJlcixcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllczogbG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiByZW1vdGVDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgcnRwU2VuZGVyOiBydHBTZW5kZXIsXG4gICAgICAgICAgICAgICAgcnRwUmVjZWl2ZXI6IHJ0cFJlY2VpdmVyLFxuICAgICAgICAgICAgICAgIGtpbmQ6IGtpbmQsXG4gICAgICAgICAgICAgICAgbWlkOiBtaWQsXG4gICAgICAgICAgICAgICAgY25hbWU6IGNuYW1lLFxuICAgICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVyczogcmVjdkVuY29kaW5nUGFyYW1ldGVyc1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgUlRDUnRwUmVjZWl2ZXIgbm93LiBUaGUgUlRQU2VuZGVyIGlzIHN0YXJ0ZWQgaW5cbiAgICAgICAgICAgICAgLy8gc2V0TG9jYWxEZXNjcmlwdGlvbi5cbiAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZShzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSxcbiAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdhbnN3ZXInICYmICFyZWplY3RlZCkge1xuICAgICAgICAgICAgICB0cmFuc2NlaXZlciA9IHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICAgICAgICBpY2VHYXRoZXJlciA9IHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyO1xuICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgICBydHBTZW5kZXIgPSB0cmFuc2NlaXZlci5ydHBTZW5kZXI7XG4gICAgICAgICAgICAgIHJ0cFJlY2VpdmVyID0gdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzO1xuXG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVtb3RlQ2FwYWJpbGl0aWVzID1cbiAgICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uY25hbWUgPSBjbmFtZTtcblxuICAgICAgICAgICAgICBpZiAoKGlzSWNlTGl0ZSB8fCBpc0NvbXBsZXRlKSAmJiBjYW5kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKCFzZWxmLnVzaW5nQnVuZGxlIHx8IHNkcE1MaW5lSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc3RhcnQoaWNlR2F0aGVyZXIsIHJlbW90ZUljZVBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICdjb250cm9sbGluZycpO1xuICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZSh0cmFuc2NlaXZlcixcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdyZWN2b25seScsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKTtcblxuICAgICAgICAgICAgICBpZiAocnRwUmVjZWl2ZXIgJiZcbiAgICAgICAgICAgICAgICAgIChkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKSkge1xuICAgICAgICAgICAgICAgIHRyYWNrID0gcnRwUmVjZWl2ZXIudHJhY2s7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlcl0pO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFjdHVhbGx5IHRoZSByZWNlaXZlciBzaG91bGQgYmUgY3JlYXRlZCBsYXRlci5cbiAgICAgICAgICAgICAgICBkZWxldGUgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgICAgICAgc2RwOiBkZXNjcmlwdGlvbi5zZHBcbiAgICAgICAgICB9O1xuICAgICAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnb2ZmZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnaGF2ZS1yZW1vdGUtb2ZmZXInKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbnN3ZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICtcbiAgICAgICAgICAgICAgICAgICdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyZWFtLmdldFRyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VsZi5yZW1vdGVTdHJlYW1zLnB1c2goc3RyZWFtKTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2FkZHN0cmVhbScpO1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW0gPSBzdHJlYW07XG4gICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgIGlmIChzZWxmLm9uYWRkc3RyZWFtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLm9uYWRkc3RyZWFtKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJhY2sgPSBpdGVtWzBdO1xuICAgICAgICAgICAgICAgIHZhciByZWNlaXZlciA9IGl0ZW1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHRyYWNrRXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQucmVjZWl2ZXIgPSByZWNlaXZlcjtcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnN0cmVhbXMgPSBbc3RyZWFtXTtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9udHJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9udHJhY2sodHJhY2tFdmVudCk7XG4gICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMV0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIC8qIG5vdCB5ZXRcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICAqL1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0KSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydCkge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBGSVhNRTogY2xlYW4gdXAgdHJhY2tzLCBsb2NhbCBzdHJlYW1zLCByZW1vdGUgc3RyZWFtcywgZXRjXG4gICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnY2xvc2VkJyk7XG4gICAgfTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2lnbmFsaW5nIHN0YXRlLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlID1cbiAgICAgICAgZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICAgICAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdzaWduYWxpbmdzdGF0ZWNoYW5nZScpO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgaWYgKHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBmaXJlIHRoZSBuZWdvdGlhdGlvbm5lZWRlZCBldmVudC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCA9XG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIEZpcmUgYXdheSAoZm9yIG5vdykuXG4gICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcpO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgaWYgKHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIGNvbm5lY3Rpb24gc3RhdGUuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlQ29ubmVjdGlvblN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgbmV3U3RhdGU7XG4gICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAnbmV3JzogMCxcbiAgICAgICAgY2xvc2VkOiAwLFxuICAgICAgICBjb25uZWN0aW5nOiAwLFxuICAgICAgICBjaGVja2luZzogMCxcbiAgICAgICAgY29ubmVjdGVkOiAwLFxuICAgICAgICBjb21wbGV0ZWQ6IDAsXG4gICAgICAgIGZhaWxlZDogMFxuICAgICAgfTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgc3RhdGVzW3RyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdGF0ZV0rKztcbiAgICAgICAgc3RhdGVzW3RyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgICB9KTtcbiAgICAgIC8vIElDRVRyYW5zcG9ydC5jb21wbGV0ZWQgYW5kIGNvbm5lY3RlZCBhcmUgdGhlIHNhbWUgZm9yIHRoaXMgcHVycG9zZS5cbiAgICAgIHN0YXRlcy5jb25uZWN0ZWQgKz0gc3RhdGVzLmNvbXBsZXRlZDtcblxuICAgICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICAgIGlmIChzdGF0ZXMuZmFpbGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdmYWlsZWQnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGluZyA+IDAgfHwgc3RhdGVzLmNoZWNraW5nID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdjb25uZWN0aW5nJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmRpc2Nvbm5lY3RlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnZGlzY29ubmVjdGVkJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLm5ldyA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmNvbm5lY3RlZCA+IDAgfHwgc3RhdGVzLmNvbXBsZXRlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld1N0YXRlICE9PSBzZWxmLmljZUNvbm5lY3Rpb25TdGF0ZSkge1xuICAgICAgICBzZWxmLmljZUNvbm5lY3Rpb25TdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBpZiAodGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlT2ZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGlmICh0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmVhdGVPZmZlciBjYWxsZWQgd2hpbGUgdGhlcmUgaXMgYSBwZW5kaW5nIG9mZmVyLicpO1xuICAgICAgfVxuICAgICAgdmFyIG9mZmVyT3B0aW9ucztcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb2ZmZXJPcHRpb25zID0gYXJndW1lbnRzWzBdO1xuICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIG9mZmVyT3B0aW9ucyA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRyYWNrcyA9IFtdO1xuICAgICAgdmFyIG51bUF1ZGlvVHJhY2tzID0gMDtcbiAgICAgIHZhciBudW1WaWRlb1RyYWNrcyA9IDA7XG4gICAgICAvLyBEZWZhdWx0IHRvIHNlbmRyZWN2LlxuICAgICAgaWYgKHRoaXMubG9jYWxTdHJlYW1zLmxlbmd0aCkge1xuICAgICAgICBudW1BdWRpb1RyYWNrcyA9IHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldEF1ZGlvVHJhY2tzKCkubGVuZ3RoO1xuICAgICAgICBudW1WaWRlb1RyYWNrcyA9IHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldFZpZGVvVHJhY2tzKCkubGVuZ3RoO1xuICAgICAgfVxuICAgICAgLy8gRGV0ZXJtaW5lIG51bWJlciBvZiBhdWRpbyBhbmQgdmlkZW8gdHJhY2tzIHdlIG5lZWQgdG8gc2VuZC9yZWN2LlxuICAgICAgaWYgKG9mZmVyT3B0aW9ucykge1xuICAgICAgICAvLyBSZWplY3QgQ2hyb21lIGxlZ2FjeSBjb25zdHJhaW50cy5cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5tYW5kYXRvcnkgfHwgb2ZmZXJPcHRpb25zLm9wdGlvbmFsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgJ0xlZ2FjeSBtYW5kYXRvcnkvb3B0aW9uYWwgY29uc3RyYWludHMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID0gb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW87XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcyA9IG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5sb2NhbFN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIFB1c2ggbG9jYWwgc3RyZWFtcy5cbiAgICAgICAgdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IHRyYWNrLmtpbmQsXG4gICAgICAgICAgICB0cmFjazogdHJhY2ssXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJhY2sua2luZCA9PT0gJ2F1ZGlvJyA/XG4gICAgICAgICAgICAgICAgbnVtQXVkaW9UcmFja3MgPiAwIDogbnVtVmlkZW9UcmFja3MgPiAwXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHRyYWNrLmtpbmQgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XG4gICAgICAgICAgfSBlbHNlIGlmICh0cmFjay5raW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgICBudW1WaWRlb1RyYWNrcy0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAvLyBDcmVhdGUgTS1saW5lcyBmb3IgcmVjdm9ubHkgc3RyZWFtcy5cbiAgICAgIHdoaWxlIChudW1BdWRpb1RyYWNrcyA+IDAgfHwgbnVtVmlkZW9UcmFja3MgPiAwKSB7XG4gICAgICAgIGlmIChudW1BdWRpb1RyYWNrcyA+IDApIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiAnYXVkaW8nLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcy0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1WaWRlb1RyYWNrcyA+IDApIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiAndmlkZW8nLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcy0tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSgpO1xuICAgICAgdmFyIHRyYW5zY2VpdmVycyA9IFtdO1xuICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24obWxpbmUsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgLy8gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhbiBpY2UgZ2F0aGVyZXIsIGljZSB0cmFuc3BvcnQsXG4gICAgICAgIC8vIGR0bHMgdHJhbnNwb3J0LCBwb3RlbnRpYWxseSBydHBzZW5kZXIgYW5kIHJ0cHJlY2VpdmVyLlxuICAgICAgICB2YXIgdHJhY2sgPSBtbGluZS50cmFjaztcbiAgICAgICAgdmFyIGtpbmQgPSBtbGluZS5raW5kO1xuICAgICAgICB2YXIgbWlkID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbiAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSBzZWxmLnVzaW5nQnVuZGxlICYmIHNkcE1MaW5lSW5kZXggPiAwID8ge1xuICAgICAgICAgIGljZUdhdGhlcmVyOiB0cmFuc2NlaXZlcnNbMF0uaWNlR2F0aGVyZXIsXG4gICAgICAgICAgaWNlVHJhbnNwb3J0OiB0cmFuc2NlaXZlcnNbMF0uaWNlVHJhbnNwb3J0LFxuICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0XG4gICAgICAgIH0gOiBzZWxmLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyhtaWQsIHNkcE1MaW5lSW5kZXgpO1xuXG4gICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcyA9IFJUQ1J0cFNlbmRlci5nZXRDYXBhYmlsaXRpZXMoa2luZCk7XG4gICAgICAgIC8vIGZpbHRlciBSVFggdW50aWwgYWRkaXRpb25hbCBzdHVmZiBuZWVkZWQgZm9yIFJUWCBpcyBpbXBsZW1lbnRlZFxuICAgICAgICAvLyBpbiBhZGFwdGVyLmpzXG4gICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcyA9IGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcy5maWx0ZXIoXG4gICAgICAgICAgICBmdW5jdGlvbihjb2RlYykge1xuICAgICAgICAgICAgICByZXR1cm4gY29kZWMubmFtZSAhPT0gJ3J0eCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICAgICAgICAvLyB3b3JrIGFyb3VuZCBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3Avd2VicnRjL2lzc3Vlcy9kZXRhaWw/aWQ9NjU1MlxuICAgICAgICAgIC8vIGJ5IGFkZGluZyBsZXZlbC1hc3ltbWV0cnktYWxsb3dlZD0xXG4gICAgICAgICAgaWYgKGNvZGVjLm5hbWUgPT09ICdIMjY0JyAmJlxuICAgICAgICAgICAgICBjb2RlYy5wYXJhbWV0ZXJzWydsZXZlbC1hc3ltbWV0cnktYWxsb3dlZCddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvZGVjLnBhcmFtZXRlcnNbJ2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkJ10gPSAnMSc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgcnRwU2VuZGVyO1xuICAgICAgICB2YXIgcnRwUmVjZWl2ZXI7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgYW4gc3NyYyBub3csIHRvIGJlIHVzZWQgbGF0ZXIgaW4gcnRwU2VuZGVyLnNlbmRcbiAgICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSBbe1xuICAgICAgICAgIHNzcmM6ICgyICogc2RwTUxpbmVJbmRleCArIDEpICogMTAwMVxuICAgICAgICB9XTtcbiAgICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgICAgcnRwU2VuZGVyID0gbmV3IFJUQ1J0cFNlbmRlcih0cmFjaywgdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtbGluZS53YW50UmVjZWl2ZSkge1xuICAgICAgICAgIHJ0cFJlY2VpdmVyID0gbmV3IFJUQ1J0cFJlY2VpdmVyKHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCwga2luZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gPSB7XG4gICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zcG9ydHMuaWNlR2F0aGVyZXIsXG4gICAgICAgICAgaWNlVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsXG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXM6IGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllczogbnVsbCxcbiAgICAgICAgICBydHBTZW5kZXI6IHJ0cFNlbmRlcixcbiAgICAgICAgICBydHBSZWNlaXZlcjogcnRwUmVjZWl2ZXIsXG4gICAgICAgICAga2luZDoga2luZCxcbiAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzOiBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLFxuICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM6IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMudXNpbmdCdW5kbGUpIHtcbiAgICAgICAgc2RwICs9ICdhPWdyb3VwOkJVTkRMRSAnICsgdHJhbnNjZWl2ZXJzLm1hcChmdW5jdGlvbih0KSB7XG4gICAgICAgICAgcmV0dXJuIHQubWlkO1xuICAgICAgICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcbiAgICAgIH1cbiAgICAgIHRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKG1saW5lLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgc2RwICs9IFNEUFV0aWxzLndyaXRlTWVkaWFTZWN0aW9uKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsICdvZmZlcicsIHNlbGYubG9jYWxTdHJlYW1zWzBdKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9wZW5kaW5nT2ZmZXIgPSB0cmFuc2NlaXZlcnM7XG4gICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnb2ZmZXInLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1swXSwgMCwgZGVzYyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRlc2MpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUoKTtcbiAgICAgIGlmICh0aGlzLnVzaW5nQnVuZGxlKSB7XG4gICAgICAgIHNkcCArPSAnYT1ncm91cDpCVU5ETEUgJyArIHRoaXMudHJhbnNjZWl2ZXJzLm1hcChmdW5jdGlvbih0KSB7XG4gICAgICAgICAgcmV0dXJuIHQubWlkO1xuICAgICAgICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcbiAgICAgIH1cbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmlzRGF0YWNoYW5uZWwpIHtcbiAgICAgICAgICBzZHAgKz0gJ209YXBwbGljYXRpb24gMCBEVExTL1NDVFAgNTAwMFxcclxcbicgK1xuICAgICAgICAgICAgICAnYz1JTiBJUDQgMC4wLjAuMFxcclxcbicgK1xuICAgICAgICAgICAgICAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJzZWN0aW9uIG9mIGNhcGFiaWxpdGllcy5cbiAgICAgICAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IHNlbGYuX2dldENvbW1vbkNhcGFiaWxpdGllcyhcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzKTtcblxuICAgICAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsIGNvbW1vbkNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICdhbnN3ZXInLCBzZWxmLmxvY2FsU3RyZWFtc1swXSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJ2Fuc3dlcicsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzBdLCAwLCBkZXNjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gICAgICBpZiAoIWNhbmRpZGF0ZSkge1xuICAgICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LmFkZFJlbW90ZUNhbmRpZGF0ZSh7fSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1MaW5lSW5kZXggPSBjYW5kaWRhdGUuc2RwTUxpbmVJbmRleDtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5zZHBNaWQpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50cmFuc2NlaXZlcnNbaV0ubWlkID09PSBjYW5kaWRhdGUuc2RwTWlkKSB7XG4gICAgICAgICAgICAgIG1MaW5lSW5kZXggPSBpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gdGhpcy50cmFuc2NlaXZlcnNbbUxpbmVJbmRleF07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlcikge1xuICAgICAgICAgIHZhciBjYW5kID0gT2JqZWN0LmtleXMoY2FuZGlkYXRlLmNhbmRpZGF0ZSkubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgIFNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlKGNhbmRpZGF0ZS5jYW5kaWRhdGUpIDoge307XG4gICAgICAgICAgLy8gSWdub3JlIENocm9tZSdzIGludmFsaWQgY2FuZGlkYXRlcyBzaW5jZSBFZGdlIGRvZXMgbm90IGxpa2UgdGhlbS5cbiAgICAgICAgICBpZiAoY2FuZC5wcm90b2NvbCA9PT0gJ3RjcCcgJiYgKGNhbmQucG9ydCA9PT0gMCB8fCBjYW5kLnBvcnQgPT09IDkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElnbm9yZSBSVENQIGNhbmRpZGF0ZXMsIHdlIGFzc3VtZSBSVENQLU1VWC5cbiAgICAgICAgICBpZiAoY2FuZC5jb21wb25lbnQgIT09ICcxJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBBIGRpcnR5IGhhY2sgdG8gbWFrZSBzYW1wbGVzIHdvcmsuXG4gICAgICAgICAgaWYgKGNhbmQudHlwZSA9PT0gJ2VuZE9mQ2FuZGlkYXRlcycpIHtcbiAgICAgICAgICAgIGNhbmQgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LmFkZFJlbW90ZUNhbmRpZGF0ZShjYW5kKTtcblxuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyh0aGlzLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgc2VjdGlvbnNbbUxpbmVJbmRleCArIDFdICs9IChjYW5kLnR5cGUgPyBjYW5kaWRhdGUuY2FuZGlkYXRlLnRyaW0oKVxuICAgICAgICAgICAgICA6ICdhPWVuZC1vZi1jYW5kaWRhdGVzJykgKyAnXFxyXFxuJztcbiAgICAgICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMV0sIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgWydydHBTZW5kZXInLCAncnRwUmVjZWl2ZXInLCAnaWNlR2F0aGVyZXInLCAnaWNlVHJhbnNwb3J0JyxcbiAgICAgICAgICAgICdkdGxzVHJhbnNwb3J0J10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgICAgaWYgKHRyYW5zY2VpdmVyW21ldGhvZF0pIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYW5zY2VpdmVyW21ldGhvZF0uZ2V0U3RhdHMoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB2YXIgY2IgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgYXJndW1lbnRzWzFdO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgLy8gc2hpbSBnZXRTdGF0cyB3aXRoIG1hcGxpa2Ugc3VwcG9ydFxuICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhyZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5zZXQoaWQsIHJlc3VsdFtpZF0pO1xuICAgICAgICAgICAgICByZXN1bHRzW2lkXSA9IHJlc3VsdFtpZF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNiLCAwLCByZXN1bHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJylcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNoaW1FcnJvcl8gPSBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHtQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InfVtlLm5hbWVdIHx8IGUubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcbiAgICAgIGNvbnN0cmFpbnQ6IGUuY29uc3RyYWludCxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIGdldFVzZXJNZWRpYSBlcnJvciBzaGltLlxuICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xuICAgIH0pO1xuICB9O1xufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG52YXIgZmlyZWZveFNoaW0gPSB7XG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmICEoJ29udHJhY2snIGluXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIGlmICh0aGlzLl9vbnRyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgLy8gRmlyZWZveCBoYXMgc3VwcG9ydGVkIG1velNyY09iamVjdCBzaW5jZSBGRjIyLCB1bnByZWZpeGVkIGluIDQyLlxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICEoJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW96U3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHRoaXMubW96U3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICdvYmplY3QnIHx8ICEod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8XG4gICAgICAgIHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbikpIHtcbiAgICAgIHJldHVybjsgLy8gcHJvYmFibHkgbWVkaWEucGVlcmNvbm5lY3Rpb24uZW5hYmxlZD1mYWxzZSBpbiBhYm91dDpjb25maWdcbiAgICB9XG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cbiAgICBpZiAoIXdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAzOCkge1xuICAgICAgICAgIC8vIC51cmxzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gRkYgPCAzOC5cbiAgICAgICAgICAvLyBjcmVhdGUgUlRDSWNlU2VydmVycyB3aXRoIGEgc2luZ2xlIHVybC5cbiAgICAgICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlU2VydmVycykge1xuICAgICAgICAgICAgdmFyIG5ld0ljZVNlcnZlcnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGNDb25maWcuaWNlU2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgc2VydmVyID0gcGNDb25maWcuaWNlU2VydmVyc1tpXTtcbiAgICAgICAgICAgICAgaWYgKHNlcnZlci5oYXNPd25Qcm9wZXJ0eSgndXJscycpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZXJ2ZXIudXJscy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgdmFyIG5ld1NlcnZlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2ZXIudXJsc1tqXVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXIudXJsc1tqXS5pbmRleE9mKCd0dXJuJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLnVzZXJuYW1lID0gc2VydmVyLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgICAgICBuZXdTZXJ2ZXIuY3JlZGVudGlhbCA9IHNlcnZlci5jcmVkZW50aWFsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKG5ld1NlcnZlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGNDb25maWcuaWNlU2VydmVycyA9IG5ld0ljZVNlcnZlcnM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgbW96UlRDUGVlckNvbm5lY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSBtb3pSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XG5cbiAgICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXG4gICAgICBpZiAobW96UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IG1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcbiAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBtb3pSVENJY2VDYW5kaWRhdGU7XG4gICAgfVxuXG4gICAgLy8gc2hpbSBhd2F5IG5lZWQgZm9yIG9ic29sZXRlIFJUQ0ljZUNhbmRpZGF0ZS9SVENTZXNzaW9uRGVzY3JpcHRpb24uXG4gICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJykgP1xuICAgICAgICAgICAgICAgIFJUQ0ljZUNhbmRpZGF0ZSA6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbikoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGFkZEljZUNhbmRpZGF0ZShudWxsIG9yIHVuZGVmaW5lZClcbiAgICB2YXIgbmF0aXZlQWRkSWNlQ2FuZGlkYXRlID1cbiAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZTtcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50c1swXSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzWzFdKSB7XG4gICAgICAgICAgYXJndW1lbnRzWzFdLmFwcGx5KG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYXRpdmVBZGRJY2VDYW5kaWRhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0OCkge1xuICAgICAgLy8gc2hpbSBnZXRTdGF0cyB3aXRoIG1hcGxpa2Ugc3VwcG9ydFxuICAgICAgdmFyIG1ha2VNYXBTdGF0cyA9IGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICAgIHZhciBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIE9iamVjdC5rZXlzKHN0YXRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIG1hcC5zZXQoa2V5LCBzdGF0c1trZXldKTtcbiAgICAgICAgICBtYXBba2V5XSA9IHN0YXRzW2tleV07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgfTtcblxuICAgICAgdmFyIG5hdGl2ZUdldFN0YXRzID0gUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzO1xuICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIG9uU3VjYywgb25FcnIpIHtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZUdldFN0YXRzLmFwcGx5KHRoaXMsIFtzZWxlY3RvciB8fCBudWxsXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihzdGF0cykge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VNYXBTdGF0cyhzdGF0cyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihvblN1Y2MsIG9uRXJyKTtcbiAgICAgIH07XG4gICAgfVxuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbU9uVHJhY2s6IGZpcmVmb3hTaGltLnNoaW1PblRyYWNrLFxuICBzaGltU291cmNlT2JqZWN0OiBmaXJlZm94U2hpbS5zaGltU291cmNlT2JqZWN0LFxuICBzaGltUGVlckNvbm5lY3Rpb246IGZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzJykubG9nO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNoaW1FcnJvcl8gPSBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgU2VjdXJpdHlFcnJvcjogJ05vdEFsbG93ZWRFcnJvcicsXG4gICAgICAgIFBlcm1pc3Npb25EZW5pZWRFcnJvcjogJ05vdEFsbG93ZWRFcnJvcidcbiAgICAgIH1bZS5uYW1lXSB8fCBlLm5hbWUsXG4gICAgICBtZXNzYWdlOiB7XG4gICAgICAgICdUaGUgb3BlcmF0aW9uIGlzIGluc2VjdXJlLic6ICdUaGUgcmVxdWVzdCBpcyBub3QgYWxsb3dlZCBieSB0aGUgJyArXG4gICAgICAgICd1c2VyIGFnZW50IG9yIHRoZSBwbGF0Zm9ybSBpbiB0aGUgY3VycmVudCBjb250ZXh0LidcbiAgICAgIH1bZS5tZXNzYWdlXSB8fCBlLm1lc3NhZ2UsXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnQsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyAodGhpcy5tZXNzYWdlICYmICc6ICcpICsgdGhpcy5tZXNzYWdlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gZ2V0VXNlck1lZGlhIGNvbnN0cmFpbnRzIHNoaW0uXG4gIHZhciBnZXRVc2VyTWVkaWFfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIHZhciBjb25zdHJhaW50c1RvRkYzN18gPSBmdW5jdGlvbihjKSB7XG4gICAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMucmVxdWlyZSkge1xuICAgICAgICByZXR1cm4gYztcbiAgICAgIH1cbiAgICAgIHZhciByZXF1aXJlID0gW107XG4gICAgICBPYmplY3Qua2V5cyhjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpZiAoa2V5ID09PSAncmVxdWlyZScgfHwga2V5ID09PSAnYWR2YW5jZWQnIHx8IGtleSA9PT0gJ21lZGlhU291cmNlJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IGNba2V5XSA9ICh0eXBlb2YgY1trZXldID09PSAnb2JqZWN0JykgP1xuICAgICAgICAgICAgY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgICBpZiAoci5taW4gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgci5tYXggIT09IHVuZGVmaW5lZCB8fCByLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXF1aXJlLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgci4gbWluID0gci5tYXggPSByLmV4YWN0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjW2tleV0gPSByLmV4YWN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWxldGUgci5leGFjdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoci5pZGVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYy5hZHZhbmNlZCA9IGMuYWR2YW5jZWQgfHwgW107XG4gICAgICAgICAgdmFyIG9jID0ge307XG4gICAgICAgICAgaWYgKHR5cGVvZiByLmlkZWFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgb2Nba2V5XSA9IHttaW46IHIuaWRlYWwsIG1heDogci5pZGVhbH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9jW2tleV0gPSByLmlkZWFsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjLmFkdmFuY2VkLnB1c2gob2MpO1xuICAgICAgICAgIGRlbGV0ZSByLmlkZWFsO1xuICAgICAgICAgIGlmICghT2JqZWN0LmtleXMocikubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgY1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAocmVxdWlyZS5sZW5ndGgpIHtcbiAgICAgICAgYy5yZXF1aXJlID0gcmVxdWlyZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjO1xuICAgIH07XG4gICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAzOCkge1xuICAgICAgbG9nZ2luZygnc3BlYzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICBpZiAoY29uc3RyYWludHMuYXVkaW8pIHtcbiAgICAgICAgY29uc3RyYWludHMuYXVkaW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMuYXVkaW8pO1xuICAgICAgfVxuICAgICAgaWYgKGNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2ZmMzc6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIH1cbiAgICByZXR1cm4gbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYShjb25zdHJhaW50cywgb25TdWNjZXNzLCBmdW5jdGlvbihlKSB7XG4gICAgICBvbkVycm9yKHNoaW1FcnJvcl8oZSkpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdCBvZiBnZXRVc2VyTWVkaWEgYXMgYSBQcm9taXNlLlxuICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGdldFVzZXJNZWRpYV8oY29uc3RyYWludHMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hpbSBmb3IgbWVkaWFEZXZpY2VzIG9uIG9sZGVyIHZlcnNpb25zLlxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge2dldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfSxcbiAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9XG4gICAgfTtcbiAgfVxuICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPVxuICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIHZhciBpbmZvcyA9IFtcbiAgICAgICAgICAgIHtraW5kOiAnYXVkaW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9LFxuICAgICAgICAgICAge2tpbmQ6ICd2aWRlb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ31cbiAgICAgICAgICBdO1xuICAgICAgICAgIHJlc29sdmUoaW5mb3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0MSkge1xuICAgIC8vIFdvcmsgYXJvdW5kIGh0dHA6Ly9idWd6aWwubGEvMTE2OTY2NVxuICAgIHZhciBvcmdFbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzLmJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gb3JnRW51bWVyYXRlRGV2aWNlcygpLnRoZW4odW5kZWZpbmVkLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQ5KSB7XG4gICAgdmFyIG9yaWdHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBvcmlnR2V0VXNlck1lZGlhKGMpLnRoZW4oZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgIC8vIFdvcmsgYXJvdW5kIGh0dHBzOi8vYnVnemlsLmxhLzgwMjMyNlxuICAgICAgICBpZiAoYy5hdWRpbyAmJiAhc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCkubGVuZ3RoIHx8XG4gICAgICAgICAgICBjLnZpZGVvICYmICFzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgdHJhY2suc3RvcCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJ1RoZSBvYmplY3QgY2FuIG5vdCBiZSBmb3VuZCBoZXJlLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm90Rm91bmRFcnJvcicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQ0KSB7XG4gICAgICByZXR1cm4gZ2V0VXNlck1lZGlhXyhjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjZSBGaXJlZm94IDQ0KydzIGRlcHJlY2F0aW9uIHdhcm5pbmcgd2l0aCB1bnByZWZpeGVkIHZlcnNpb24uXG4gICAgY29uc29sZS53YXJuKCduYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIGhhcyBiZWVuIHJlcGxhY2VkIGJ5ICcgK1xuICAgICAgICAgICAgICAgICAnbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEnKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cykudGhlbihvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICB9O1xufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIHNhZmFyaVNoaW0gPSB7XG4gIC8vIFRPRE86IERyQWxleCwgc2hvdWxkIGJlIGhlcmUsIGRvdWJsZSBjaGVjayBhZ2FpbnN0IExheW91dFRlc3RzXG4gIC8vIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHsgfSxcblxuICAvLyBUT0RPOiBvbmNlIHRoZSBiYWNrLWVuZCBmb3IgdGhlIG1hYyBwb3J0IGlzIGRvbmUsIGFkZC5cbiAgLy8gVE9ETzogY2hlY2sgZm9yIHdlYmtpdEdUSytcbiAgLy8gc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHsgfSxcblxuICBzaGltR2V0VXNlck1lZGlhOiBmdW5jdGlvbigpIHtcbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYTtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1HZXRVc2VyTWVkaWE6IHNhZmFyaVNoaW0uc2hpbUdldFVzZXJNZWRpYVxuICAvLyBUT0RPXG4gIC8vIHNoaW1PblRyYWNrOiBzYWZhcmlTaGltLnNoaW1PblRyYWNrLFxuICAvLyBzaGltUGVlckNvbm5lY3Rpb246IHNhZmFyaVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2dEaXNhYmxlZF8gPSB0cnVlO1xuXG4vLyBVdGlsaXR5IG1ldGhvZHMuXG52YXIgdXRpbHMgPSB7XG4gIGRpc2FibGVMb2c6IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJndW1lbnQgdHlwZTogJyArIHR5cGVvZiBib29sICtcbiAgICAgICAgICAnLiBQbGVhc2UgdXNlIGEgYm9vbGVhbi4nKTtcbiAgICB9XG4gICAgbG9nRGlzYWJsZWRfID0gYm9vbDtcbiAgICByZXR1cm4gKGJvb2wpID8gJ2FkYXB0ZXIuanMgbG9nZ2luZyBkaXNhYmxlZCcgOlxuICAgICAgICAnYWRhcHRlci5qcyBsb2dnaW5nIGVuYWJsZWQnO1xuICB9LFxuXG4gIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAobG9nRGlzYWJsZWRfKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IGJyb3dzZXIgdmVyc2lvbiBvdXQgb2YgdGhlIHByb3ZpZGVkIHVzZXIgYWdlbnQgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IHVhc3RyaW5nIHVzZXJBZ2VudCBzdHJpbmcuXG4gICAqIEBwYXJhbSB7IXN0cmluZ30gZXhwciBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCBhcyBtYXRjaCBjcml0ZXJpYS5cbiAgICogQHBhcmFtIHshbnVtYmVyfSBwb3MgcG9zaXRpb24gaW4gdGhlIHZlcnNpb24gc3RyaW5nIHRvIGJlIHJldHVybmVkLlxuICAgKiBAcmV0dXJuIHshbnVtYmVyfSBicm93c2VyIHZlcnNpb24uXG4gICAqL1xuICBleHRyYWN0VmVyc2lvbjogZnVuY3Rpb24odWFzdHJpbmcsIGV4cHIsIHBvcykge1xuICAgIHZhciBtYXRjaCA9IHVhc3RyaW5nLm1hdGNoKGV4cHIpO1xuICAgIHJldHVybiBtYXRjaCAmJiBtYXRjaC5sZW5ndGggPj0gcG9zICYmIHBhcnNlSW50KG1hdGNoW3Bvc10sIDEwKTtcbiAgfSxcblxuICAvKipcbiAgICogQnJvd3NlciBkZXRlY3Rvci5cbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSByZXN1bHQgY29udGFpbmluZyBicm93c2VyIGFuZCB2ZXJzaW9uXG4gICAqICAgICBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgZGV0ZWN0QnJvd3NlcjogZnVuY3Rpb24oKSB7XG4gICAgLy8gUmV0dXJuZWQgcmVzdWx0IG9iamVjdC5cbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgcmVzdWx0LmJyb3dzZXIgPSBudWxsO1xuICAgIHJlc3VsdC52ZXJzaW9uID0gbnVsbDtcblxuICAgIC8vIEZhaWwgZWFybHkgaWYgaXQncyBub3QgYSBicm93c2VyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8ICF3aW5kb3cubmF2aWdhdG9yKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdOb3QgYSBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3guXG4gICAgaWYgKG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2ZpcmVmb3gnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0ZpcmVmb3hcXC8oWzAtOV0rKVxcLi8sIDEpO1xuXG4gICAgLy8gYWxsIHdlYmtpdC1iYXNlZCBicm93c2Vyc1xuICAgIH0gZWxzZSBpZiAobmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSkge1xuICAgICAgLy8gQ2hyb21lLCBDaHJvbWl1bSwgV2VidmlldywgT3BlcmEsIGFsbCB1c2UgdGhlIGNocm9tZSBzaGltIGZvciBub3dcbiAgICAgIGlmICh3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnY2hyb21lJztcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0Nocm9tKGV8aXVtKVxcLyhbMC05XSspXFwuLywgMik7XG5cbiAgICAgIC8vIFNhZmFyaSBvciB1bmtub3duIHdlYmtpdC1iYXNlZFxuICAgICAgLy8gZm9yIHRoZSB0aW1lIGJlaW5nIFNhZmFyaSBoYXMgc3VwcG9ydCBmb3IgTWVkaWFTdHJlYW1zIGJ1dCBub3Qgd2ViUlRDXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTYWZhcmkgVUEgc3Vic3RyaW5ncyBvZiBpbnRlcmVzdCBmb3IgcmVmZXJlbmNlOlxuICAgICAgICAvLyAtIHdlYmtpdCB2ZXJzaW9uOiAgICAgICAgICAgQXBwbGVXZWJLaXQvNjAyLjEuMjUgKGFsc28gdXNlZCBpbiBPcCxDcilcbiAgICAgICAgLy8gLSBzYWZhcmkgVUkgdmVyc2lvbjogICAgICAgIFZlcnNpb24vOS4wLjMgKHVuaXF1ZSB0byBTYWZhcmkpXG4gICAgICAgIC8vIC0gc2FmYXJpIFVJIHdlYmtpdCB2ZXJzaW9uOiBTYWZhcmkvNjAxLjQuNCAoYWxzbyB1c2VkIGluIE9wLENyKVxuICAgICAgICAvL1xuICAgICAgICAvLyBpZiB0aGUgd2Via2l0IHZlcnNpb24gYW5kIHNhZmFyaSBVSSB3ZWJraXQgdmVyc2lvbnMgYXJlIGVxdWFscyxcbiAgICAgICAgLy8gLi4uIHRoaXMgaXMgYSBzdGFibGUgdmVyc2lvbi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gb25seSB0aGUgaW50ZXJuYWwgd2Via2l0IHZlcnNpb24gaXMgaW1wb3J0YW50IHRvZGF5IHRvIGtub3cgaWZcbiAgICAgICAgLy8gbWVkaWEgc3RyZWFtcyBhcmUgc3VwcG9ydGVkXG4gICAgICAgIC8vXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKFxcZCspLihcXGQrKS8pKSB7XG4gICAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnc2FmYXJpJztcbiAgICAgICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAgIC9BcHBsZVdlYktpdFxcLyhbMC05XSspXFwuLywgMSk7XG5cbiAgICAgICAgLy8gdW5rbm93biB3ZWJraXQtYmFzZWQgYnJvd3NlclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdC5icm93c2VyID0gJ1Vuc3VwcG9ydGVkIHdlYmtpdC1iYXNlZCBicm93c2VyICcgK1xuICAgICAgICAgICAgICAnd2l0aCBHVU0gc3VwcG9ydCBidXQgbm8gV2ViUlRDIHN1cHBvcnQuJztcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAvLyBFZGdlLlxuICAgIH0gZWxzZSBpZiAobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyAmJlxuICAgICAgICBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9FZGdlXFwvKFxcZCspLihcXGQrKSQvKSkge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnZWRnZSc7XG4gICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvRWRnZVxcLyhcXGQrKS4oXFxkKykkLywgMik7XG5cbiAgICAvLyBEZWZhdWx0IGZhbGx0aHJvdWdoOiBub3Qgc3VwcG9ydGVkLlxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdOb3QgYSBzdXBwb3J0ZWQgYnJvd3Nlci4nO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuXG4vLyBFeHBvcnQuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9nOiB1dGlscy5sb2csXG4gIGRpc2FibGVMb2c6IHV0aWxzLmRpc2FibGVMb2csXG4gIGJyb3dzZXJEZXRhaWxzOiB1dGlscy5kZXRlY3RCcm93c2VyKCksXG4gIGV4dHJhY3RWZXJzaW9uOiB1dGlscy5leHRyYWN0VmVyc2lvblxufTtcbiJdfQ==
