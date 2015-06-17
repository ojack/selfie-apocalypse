var renderer, scene, camera, cube, mesh, texture1, texture2, composer, dotScreenEffect, rgbEffect, mouseX, mouseY, shader, remoteVid, localVid, blendEffect;
mouseX = mouseY = 1;
//var localVid = document.getElementById('localVideo');
//var remoteVid = document.getElementById('remoteVideo');
document.addEventListener("mousemove", onMouseMove);


var webrtc = new SimpleWebRTC({
	localVideoEl: 'localVideo',
	remoteVideosEl: '',
	autoRequestMedia: true
});

webrtc.on('readyToCall', function () {
	webrtc.joinRoom('room');
	console.log("joined room!");
	//console.log(localVid);
	//initWebGL();
});

webrtc.on('videoAdded', function (video, peer) {
	//console.log(document.getElementById('localVideo'));
  localVid = document.getElementById('localVideo').childNodes[0]; //what happens if camera not enabled on local comp?
    console.log(localVid);
    console.log('video added', peer);
    console.log(video);
    remoteVid = video;
    initWebGL();
  //  var remotes = document.getElementById('remotes');
  //  if (remotes) {
    	//console.log(video.videoEl);
    	//remoteVid = video.videoEl;
       /* var container = document.createElement('div');
        container.className = 'videoContainer';
        container.id = 'container_' + webrtc.getDomId(peer);
        container.appendChild(video);

        // suppress contextmenu
        video.oncontextmenu = function () { return false; };

        remotes.appendChild(container);*/
   // }
});

function initWebGL(){
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
				texture1 = initVideoTexture(localVid);
				texture2 = initVideoTexture(remoteVid);
				//

				/*camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.z = 400;

				scene = new THREE.Scene();*/
				//var geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight);
				
				/*var material = new THREE.MeshBasicMaterial( { map: videoTexture} );

				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh )*/
				initEffects();
				render();
				//
}

function initVideoTexture(vid){
	var tex = new THREE.Texture( vid );
	tex.wrapS = THREE.ClampToEdgeWrapping;
	tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	//tex.format = THREE.RGBFormat;
	return tex;
}

function initEffects(){
	dotRGBEffect();
	// postprocessing
	/*composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.TexturePass( texture1, 1.0 ) );
	shaderEffect = new THREE.ShaderPass(THREE.KaleidoShader);
	
	/*blendEffect = new THREE.ShaderPass(THREE.BlendShader);
	//blendEffect.uniforms['tDiffuse1'].value = texture2;
	blendEffect.uniforms['tDiffuse2'].value = texture1;
	blendEffect.renderToScreen = true;
	shaderEffect.renderToScreen = true;
	composer.addPass(shaderEffect);
	composer.addPass( blendEffect);*/
}

function dotRGBEffect(){
	composer = new THREE.EffectComposer( renderer );
//composer.addPass( new THREE.RenderPass( scene, camera ) );
composer.addPass( new THREE.TexturePass( texture1, 1.0 ) );

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
	texture1.needsUpdate = true;
	//texture2.needsUpdate = true;
	//blendEffect.uniforms['tDiffuse2'].value = texture2;
	//blendEffect.uniforms['tDiffuse1'].value = texture1;
	//shader.uniforms[ 'sides' ].value = Math.floor(mouseY*0.03);
	//shader.uniforms[ 'angle' ].value +=0.01;
	dotScreenEffect.uniforms[ 'scale' ].value = mouseX * 0.01;
	rgbEffect.uniforms[ 'amount' ].value = mouseY*0.001;
	//renderer.render( scene, camera );
	composer.render();
}

