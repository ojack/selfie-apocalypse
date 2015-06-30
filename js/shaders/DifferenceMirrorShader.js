/**
 *  by Olivia Jacks
 * based off of: alteredq / http://alteredqualia.com/
 *
 * Composite two textures based off of blendmode (difference)
 */

THREE.DifferenceMirrorShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"mixRatio":  { type: "f", value: 0.5 },
		"opacity":   { type: "f", value: 1.0 },
		"mirror": {type: "f", value: 0.5}

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",
		"uniform float mixRatio;",
		"uniform float mirror;",
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",
			"vec2 p = vUv;",
			"p.x = 1.0 - p.x;",
			//"if(p.x > mirror) p.x = p.x-2.0*(p.x-mirror);",
			"vec4 texel1 = texture2D( tDiffuse, p);",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",
			"float mixI = 1.0 - mixRatio;",
			//"gl_FragColor = opacity * mix( texel1, texel2, mixRatio );",
			"gl_FragColor = vec4(2.0*abs(texel1.r*mixRatio - texel2.r*mixI), 2.0*abs(texel1.g*mixRatio - texel2.g*mixI), 2.0*abs(texel1.b*mixRatio - texel2.b*mixI), 1.0);",

		"}"

	].join("\n")

};
//vec4(abs(t0.r*diff - t1.r*diffI), abs(t0.g*diff - t1.g*diffI),  abs(t0.b*diff - t1.b*diffI)
