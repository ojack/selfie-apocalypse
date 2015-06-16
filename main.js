var renderer, scene, camera, cube, mesh, videoTexture, composer;

var video = document.getElementById('localVideo');

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
				
				videoTexture.minFilter = THREE.LinearFilter;
				videoTexture.magFilter = THREE.LinearFilter;
				videoTexture.format = THREE.RGBFormat;

				var material = new THREE.MeshBasicMaterial( { map: videoTexture} );

				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );
				render();
				//
}
	

function render() {
	requestAnimationFrame( render );
	videoTexture.needsUpdate = true;
	renderer.render( scene, camera );
}

