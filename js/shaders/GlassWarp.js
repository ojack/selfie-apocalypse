/**
 *  by Olivia Jacks
 * adapted from http://glslsandbox.com/e#26136.1
 *
 */

THREE.GlassWarpShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"mouseX": {type: "f", value: 0.1},
		"mouseY": {type: "f", value: 0.3},
		"mag": {type: "f", value: 50.}

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float mouseX;",
		"uniform float mouseY;",
		"uniform float mag;",
		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",
	

		"void main() {",
			"vec2 p = vUv;",
			"p.x = 1.0 - p.x;",
			"float size = mag*(mouseX+0.5);",
			"vec2 pos = vec2(mouseX,1.0-mouseY);",
			//"float dist = 0.3*distance(pos, vUv);",
			
			"float color = 0.1;",
		//	"vec2 disp = vec2(vUv.x + dist, vUv.y +dist);",
			"float dist = 0.;",
	
			"for(int i = 0; i < 1; i++){",
				"dist += (size) / distance(pos+dist, vUv);",
				"color += cos(vUv.x*vUv.y*dist);",
			"}",
			//"gl_FragColor = texture2D( tDiffuse, vUv);",
			"vec4 col  = texture2D(tDiffuse, vec2(vUv.x-color*0.1, vUv.y));",
			" gl_FragColor = vec4(col.r, col.g, col.b, 1.0);",
			

		"}"

	].join("\n")

};

/*
ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
varying vec2 surfacePosition;

#define N 100
void main( void ) {
	float size = 500.*(mouse.x+0.5);
	float dist = 0.;
	vec2 pos = vec2(mouse.x-0.5,mouse.y-0.5);
	vec3 color = vec3(0.1);;
	
	for(int i = 0; i < N; i++){
		dist += (size) / distance(pos+dist, surfacePosition);
		color += vec3(cos(surfacePosition.x*surfacePosition.y*dist));
	}
	gl_FragColor = vec4(color, 1.0);

*/
//vec4(abs(t0.r*diff - t1.r*diffI), abs(t0.g*diff - t1.g*diffI),  abs(t0.b*diff - t1.b*diffI)
