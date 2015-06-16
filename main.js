var renderer, scene, camera, cube, mesh, videoTexture, composer, dotScreenEffect, rgbEffect, mouseX, mouseY, shader;
mouseX = mouseY = 1;
var video = document.getElementById('localVideo');
document.addEventListener("mousemove", onMouseMove);


var webrtc = new SimpleWebRTC({
	localVideoEl: 'localVideo',
	remoteVideosEl: 'remoteVideo',
	autoRequestMedia: true
});

webrtc.on('readyToCall', function () {
	webrtc.joinRoom('My room name');
	console.log("joined room!");
	initWebGL();
});

function initWebGL(){
	renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				//

				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.z = 400;

				scene = new THREE.Scene();
				var geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight);
				videoTexture = new THREE.Texture( video );
				videoTexture.wrapS = THREE.MirroredRepeatWrapping;
				videoTexture.wrapT = THREE.RepeatWrapping;	
				videoTexture.minFilter = THREE.LinearFilter;
				videoTexture.magFilter = THREE.LinearFilter;
				videoTexture.format = THREE.RGBFormat;

				var material = new THREE.MeshBasicMaterial( { map: videoTexture} );

				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );
				initEffects();
				render();
				//
}

function initEffects(){
	// postprocessing
composer = new THREE.EffectComposer( renderer );
composer.addPass( new THREE.RenderPass( scene, camera ) );

dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
dotScreenEffect.uniforms[ 'scale' ].value = 0.8;
composer.addPass( dotScreenEffect );

rgbEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
rgbEffect.uniforms[ 'amount' ].value = 0.0015;
rgbEffect.renderToScreen = true;
//shader = new THREE.ShaderPass(THREE.KaleidoShader);
//rgbEffect.renderToScreen = true;
composer.addPass( rgbEffect);
}
	

function onMouseMove(e){
	mouseX = e.pageX;
	mouseY = e.pageY;
}

function render() {
	requestAnimationFrame( render );
	videoTexture.needsUpdate = true;
	//shader.uniforms[ 'sides' ].value = Math.floor(mouseY*0.03);
	//shader.uniforms[ 'angle' ].value +=0.01;
	dotScreenEffect.uniforms[ 'scale' ].value = mouseX * 0.01;
	rgbEffect.uniforms[ 'amount' ].value = mouseY*0.001;
	//renderer.render( scene, camera );
	composer.render();
}

