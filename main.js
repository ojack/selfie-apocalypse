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
       }, 10000);
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

