navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

var videoEl;
var LocalStream = function(vidEl){
	videoEl = vidEl;
	if (!navigator.getUserMedia) 
	{
		console.log("webcam not available");
	} else {
		navigator.getUserMedia({video: true}, gotStream, noStream);
	}
}

function gotStream(stream, vidEl){
	console.log('got stream!');
	console.log(stream);
	if (window.URL) 
	{   videoEl.src = window.URL.createObjectURL(stream);   } 
	else // Opera
	{   videoEl.src = stream;   }
	videoEl.onerror = function(e) 
	{   
		console.log(e);
		stream.stop();  
	 };
	stream.onended = noStream;
}

function noStream(e) 
{
	var msg = 'No camera available.';
	if (e.code == 1) 
	{   msg = 'User denied access to use camera.';   }
	console.log(1);
}


module.exports = LocalStream;