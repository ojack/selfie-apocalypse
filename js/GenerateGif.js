
var gifWidth = 600;

var GenerateGif = function(element, numFrames, effectChain){
	document.getElementById("recording").src = "textures/player_record.png";
	document.getElementById("recording").style.visibility = "visible";
	this.canvas = document.createElement( 'canvas' );
	this.canvas.width = gifWidth;
	this.canvas.height = gifWidth*element.height/element.width;
	this.context = this.canvas.getContext( '2d' );
	this.numFrames = numFrames;
	this.frameIndex = 0;
	this.gif = new GIF({
  		workers: 2,
  		quality: 100
	});
	this.gif.on('finished', function(blob) {
		document.getElementById("recording").style.visibility = "hidden";
	  window.open(URL.createObjectURL(blob));
	});

}

GenerateGif.prototype.addFrame = function(element){
	this.frameIndex++;
	if(this.frameIndex >= this.numFrames){
		this.finish();
		return false;
	} else {
	this.context.drawImage( element, 0, 0, this.canvas.width, this.canvas.height);
	this.gif.addFrame(this.canvas, {copy: true, delay:150});
	this.frameIndex++;
	return true;
	}
};

GenerateGif.prototype.finish = function(){
	document.getElementById("recording").src = "textures/ajax-loader.gif";
	//renderingGif = false;
	this.gif.render();
};

module.exports = GenerateGif;
