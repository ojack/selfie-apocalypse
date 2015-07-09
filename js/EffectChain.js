/* Factory pattern for creating effects
http://javascript.info/tutorial/factory-constructor-pattern
*/

var ascii = require('./AsciiGradient.js');
var t;

function EffectChain(type, renderer, texture){
	  // Throw an error if no constructor for the given automobile
    
    //return eval("new " + type+"("+renderer+")");

    var newEff = eval("new "+type+"(renderer, texture)");
    return newEff;
}



var RgbDots = function(renderer, texture){
	console.log("rgb called");
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
	this.dotScreenEffect.uniforms[ 'scale' ].value = 0.8;
	this.composer.addPass( this.dotScreenEffect );
	this.rgbEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
	this.rgbEffect.uniforms[ 'amount' ].value = 0.0015;
	this.rgbEffect.renderToScreen = true;
	this.composer.addPass( this.rgbEffect);
}

RgbDots.prototype.render = function(x, y){
	//this.texture.needsUpdate = true;
	this.dotScreenEffect.uniforms[ 'scale' ].value = x*3 ;
	this.rgbEffect.uniforms[ 'amount' ].value = y ;
	this.composer.render();

}

var Kaleidoscope = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.KaleidoEffect = new THREE.ShaderPass( THREE.KaleidoShader);
	//this.KaleidoEffect.renderToScreen = true;
	this.composer.addPass( this.KaleidoEffect);
	this.ColorEffect = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.ColorEffect.renderToScreen = true;
	this.composer.addPass( this.ColorEffect);
}

Kaleidoscope.prototype.render = function(x, y, frame){
	var sides = Math.ceil(x*10);
	this.KaleidoEffect.uniforms[ 'sides' ].value = x*7;
	this.KaleidoEffect.uniforms[ 'offset' ].value = y*8;
	this.ColorEffect.uniforms[ 'hue' ].value = Math.cos(frame*0.01);
	this.composer.render();
}

var KaleidoColor = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.KaleidoEffect = new THREE.ShaderPass( THREE.KaleidoShader);
	//this.KaleidoEffect.renderToScreen = true;
	this.composer.addPass( this.KaleidoEffect);
	this.ColorEffect = new THREE.ShaderPass( THREE.ColorEffectShader);
	//this.ColorEffect.uniforms[ 'saturation' ].value = 1.0;
	this.ColorEffect.renderToScreen = true;
	this.composer.addPass( this.ColorEffect);
}

KaleidoColor.prototype.render = function(x, y, frame){
	var sides = Math.ceil(x*10);
	this.KaleidoEffect.uniforms[ 'sides' ].value = x*7;
	this.KaleidoEffect.uniforms[ 'offset' ].value = y*6;
	this.ColorEffect.uniforms[ 'hue' ].value = Math.cos(frame*0.004);
	this.composer.render();
}

var Film = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));

	this.rgbEffect = new THREE.ShaderPass( THREE.ColorExperimentShader );
	this.rgbEffect.uniforms[ 'amount' ].value = 0.0015;
	//this.rgbEffect.renderToScreen = true;
	this.Experiment = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.Experiment.renderToScreen = true;
	

	this.composer.addPass( this.rgbEffect);
	this.composer.addPass( this.Experiment );
}

Film.prototype.render = function(x, y){

	this.rgbEffect.uniforms[ 'amount' ].value = x*0.8;
	this.Experiment.uniforms[ 'hue' ].value = y*2.0 - 1.0;
		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		
	this.composer.render();
}

var Difference = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));

	this.Difference = new THREE.ShaderPass( THREE.DifferenceMirrorShader);
	
	//this.Difference.renderToScreen = true;
		this.Contrast = new THREE.ShaderPass( THREE.BrightnessContrastShader);
	this.Contrast.uniforms['contrast'].value = 0.0;
	this.Contrast.uniforms['brightness'].value = 0.2;
	this.composer.addPass( this.Contrast );
	this.composer.addPass( this.Difference);
	this.Experiment = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.Experiment.renderToScreen = true;
	this.composer.addPass( this.Experiment );
	
}

Difference.prototype.render = function(x, y){
	//this.Difference.uniforms[ 'sides' ].value = x*10;
	this.Experiment.uniforms[ 'hue' ].value = x*2.0 - 1.0;
	this.Contrast.uniforms['contrast'].value = y;
	//this.Contrast.uniforms['brightness'].value =  y*2.0 - 1.0;
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}

var Ascii = function(renderer, texture){
	var characters = new ascii();
	// characters.canvas.width = characters.canvas.height = 128;
	//document.body.appendChild(characters.canvas);
	//t = initTexture(characters.canvas);
t= new THREE.Texture( characters.canvas);
	//console.log(t);
	t.needsUpdate=true;
	var woodTexture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );
	this.composer = new THREE.EffectComposer( renderer );
	this.contrast = new THREE.ShaderPass( THREE.BrightnessContrastShader);
	this.contrast.uniforms['contrast'].value = 0.7;
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.composer.addPass( this.contrast );
	this.Ascii = new THREE.ShaderPass( THREE.AsciiShader);
	this.Ascii.uniforms['tDiffuse2'].value = t;
	this.Ascii.renderToScreen = true;
	this.Ascii.uniforms['numChars'].value = characters.numChars;
	this.composer.addPass( this.Ascii);
}

Ascii.prototype.render = function(x, y){
	var cols = Math.floor(x * 150);
//	tex.needsUpdate = true;
	this.Ascii.uniforms[ 'rows' ].value = cols * window.innerHeight / window.innerWidth;
	this.Ascii.uniforms[ 'cols' ].value = cols;
	this.contrast.uniforms ['contrast'].value = y;
	
	this.composer.render();
}

var Checkerboard = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.Checkerboard = new THREE.ShaderPass( THREE.CheckerboardShader);
	this.Checkerboard.renderToScreen = true;
	this.composer.addPass( this.Checkerboard);
}

Checkerboard.prototype.render = function(x, y){
	this.Checkerboard.uniforms[ 'width' ].value = 2.0 - x*2.0;
	this.Checkerboard.uniforms[ 'height' ].value = 2.0 - y*2.0;
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}

var GlassWarp = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.GlassWarp = new THREE.ShaderPass( THREE.GlassWarpShader);
	this.GlassWarp.renderToScreen = true;
	this.composer.addPass( this.GlassWarp);

	//this.composer.addPass( contrast );
}

GlassWarp.prototype.render = function(x, y, frame){
	this.GlassWarp.uniforms[ 'mouseX' ].value = x;
	this.GlassWarp.uniforms[ 'mouseY' ].value = y;
	this.GlassWarp.uniforms[ 'mag' ].value = 40*Math.sin(frame*0.0009);
	//this.ColorEffect.uniforms[ 'hue' ].value = Math.cos(frame*0.01);
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}
var Experiment = function(renderer, texture){
	this.composer = new THREE.EffectComposer( renderer );
	this.composer.addPass( new THREE.TexturePass( texture, 1.0 ));
	this.Experiment = new THREE.ShaderPass( THREE.HueSaturationShader);
	this.Experiment.renderToScreen = true;
	this.composer.addPass( this.Experiment );
}

Experiment.prototype.render = function(x, y, frame){
	this.Experiment.uniforms[ 'hue' ].value = x*2.0 - 1.0;
	this.Experiment.uniforms[ 'saturation' ].value = y*1.2 - 0.2;
	//this.Experiment.uniforms[ 'mouseY' ].value = y;
	
	//this.Difference.uniforms[ 'mixRatio' ].value = y;
	this.composer.render();
}

function initTexture(canvas){
	var tex = new THREE.Texture( canvas );
	//needed because cant ensure that video has power of two dimensions
	//tex.wrapS = THREE.ClampToEdgeWrapping;
//	tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	return tex;
}

module.exports = EffectChain;
	