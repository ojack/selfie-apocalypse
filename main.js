var getUserMedia = require('getusermedia');
var EffectChain = require('./js/EffectChain.js');
var gifFrames = 0;
var effects = ["Ascii", "Checkerboard", "Kaleidoscope", "GlassWarp",  "Difference", "RgbDots", "Film"];
var effectIndex = 2;
var renderingGif = false;
var currentGif;
var frameCount = 0;
var renderer, effectChain, scene, camera, cube, mesh, texture1, texture2, composer, dotScreenEffect, rgbEffect, mouseX, mouseY, shader, remoteVid, localVid, blendEffect;
mouseX = mouseY = 1;
var getImageData = false;
var localVid = document.getElementById('videoObj');
//var remoteVid = document.getElementById('remoteVideo');
window.addEventListener("mousemove", onMouseMove);
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
       effectIndex=0;
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
		effectChain.render(mouseX/window.innerWidth, mouseY/window.innerHeight, frameCount);
		var imgData = renderer.domElement.toDataURL();
		window.open(imgData);
	} else if(e.keyCode ==  71){
		renderingGif = true;
		currentGif = new generateGif(renderer.domElement, 50);

  } else if (e.keyCode == '37') {
    	effectIndex--;
    	if(effectIndex < 0) effectIndex = effects.length-1;
    }
    else if (e.keyCode == '39') {
    	effectIndex++;
    	if(effectIndex >= effects.length) effectIndex = 0;
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

