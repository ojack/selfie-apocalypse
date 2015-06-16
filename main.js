var renderer, scene, camera, cube, mesh, videoTexture;

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
				//var geometry = new THREE.BoxGeometry( 200, 200, 200 );

				var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );
				texture.anisotropy = renderer.getMaxAnisotropy();
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
	/*renderer = new THREE.WebGLRenderer();
	//renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('container').appendChild(renderer.domElement);

	scene = new THREE.Scene();


	var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
	//var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	videoTexture = new THREE.Texture( video );
	var material   = new THREE.MeshLambertMaterial({
		color: 0xff00ff,
		side: THREE.DoubleSide
 		// map : videoTexture
	});
	var plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
/*	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		videoTexture = new THREE.Texture( video );
	var material   = new THREE.MeshBasicMaterial({
 		 map : videoTexture
	});
cube = new THREE.Mesh( geometry, material );
scene.add( cube );
camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
scene.add(camera);
render();
}*/

function render() {
	requestAnimationFrame( render );
	if( video.readyState === video.HAVE_ENOUGH_DATA ){
  //videoTexture.needsUpdate = true;
}
videoTexture.needsUpdate = true;
	//cube.rotation.x += 0.1;
//cube.rotation.y += 0.1;
//mesh.rotation.x += 0.005;
				//mesh.rotation.y += 0.01;
	renderer.render( scene, camera );
}

