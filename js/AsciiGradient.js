
var charString = " .:-=+*#%@";
var height = 128;
var block = "█";

var AsciiGradient = function(){
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = height + 'px monospace';
	metrics = context.measureText('i');

	canvas = document.createElement('canvas');
	canvas.height = height;
	canvas.width = metrics.width * charString.length;
	// canvas.height =512;
	// canvas.width =512;

	context = canvas.getContext('2d');
	context.fillStyle = 'black';
	context.fillRect(0,0,canvas.width,canvas.height);
	context.font = height + 'px monospace';
	context.fillStyle = 'white';


	context.fillText(charString, 0, height - 1);

	this.canvas = canvas;
	this.numChars = charString.length;
	//document.body.appendChild(canvas);

}

module.exports = AsciiGradient;
