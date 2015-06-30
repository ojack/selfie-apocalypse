/**
 *  by Olivia Jacks
 * create checkerboard mirror
 *
 */

THREE.CheckerboardShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"width": {type: "f", value: 0.1},
		"height": {type: "f", value: 0.3}

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float width;",
		"uniform float height;",
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",
			"vec2 p = vUv;",
			"p.x = 1.0 - p.x;",
			"vec2 checker = vec2(width, height);",
			//"if(p.x > mirror) p.x = p.x-2.0*(p.x-mirror);",
			"vec2 cell = step(0.5, fract(vUv/checker));",
			"if(cell.x + cell.y == 1.0){",
			"gl_FragColor = texture2D( tDiffuse, p);",
			"} else {",
			"gl_FragColor = texture2D( tDiffuse, vUv);",
			"}",

		"}"

	].join("\n")

};
//vec4(abs(t0.r*diff - t1.r*diffI), abs(t0.g*diff - t1.g*diffI),  abs(t0.b*diff - t1.b*diffI)
