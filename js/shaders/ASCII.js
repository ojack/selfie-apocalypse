/**
 *  Ascii shader
 *
 */

THREE.AsciiShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tDiffuse2": { type: "t", value: null },
		"rows": {type: "f", value: null},
		"cols": {type: "f", value: null}

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float rows;",
		"uniform float cols;",
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",
                  "vec4 color;",
                  "vec2 uv = vUv;",
                  "vec2 xf = vec2(cols, rows);",
                  "vec2 box = (floor(xf*uv) + 0.5) / xf;",
                  "vec2 offset = (uv - floor(xf*uv)/xf);",
                  "color = texture2D(tDiffuse, box);",
                  "float luminance = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;",
                //  "gl_FragColor = vec4(xf * offset, 1.0, 1.0);",
                "gl_FragColor = texture2D(tDiffuse2, offset*xf*luminance);",
		"}"

	].join("\n")

};
//vec4(abs(t0.r*diff - t1.r*diffI), abs(t0.g*diff - t1.g*diffI),  abs(t0.b*diff - t1.b*diffI)
