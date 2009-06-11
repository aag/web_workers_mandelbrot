var startTime;
var slicesFinished = 0;
var numWorkers = 0;
var returnedValueArrays = null;

function draw() {
	var canvas = document.getElementById("can");
	if (canvas.getContext) {
		var ctx = canvas.getContext("2d");

		var imageWidth = canvas.width;
		var imageHeight = canvas.height;

		clearCanvas(ctx, imageWidth, imageHeight);

		numWorkers = getNumWorkersFromPage();
		slicesFinished = 0;
		returnedValueArrays = new Array(numWorkers);
		
		// We have all the info we need, so do the drawing
		startTime = new Date();
		logToMessageDiv("Starting to draw: " + startTime);
		drawMandelbrot(ctx, imageWidth, imageHeight, numWorkers);
	}
}

function clearCanvas(ctx, width, height) {
//	ctx.fillStyle = "rgb(0,0,0)";
	ctx.clearRect(0, 0, width, height);
}

function getNumWorkersFromPage() {
	var retVal = 0;

	var nwSelect = document.getElementById("numWorkers");
	if (nwSelect) {
		retVal = parseInt(nwSelect.options[nwSelect.selectedIndex].value);
	}

	logToMessageDiv("NumWorkers: " + retVal);

	return retVal;
}

function drawMandelbrot(ctx, width, height, numWorkers) {
	var maxIterations = 100;
	var minReal = -2.0;
	var maxReal = 1.0;
	var minImaginary = -1.2;

	if (ctx) {
		var maxImaginary = minImaginary + (maxReal - minReal) * (height / width);
		var realFactor = (maxReal - minReal) / (width - 1);
		var imaginaryFactor = (maxImaginary - minImaginary) / (height - 1);
		
		var startX = 0;
		var startY = 0;
		
		var sliceForEachWorker = parseInt(height / numWorkers);
		
		// Start up the workers
		for (var i = 0; i < numWorkers; i++) {
			startY = parseInt(i * sliceForEachWorker);

			var imageData = ctx.createImageData(width, sliceForEachWorker);
			
			var args = new Object;
			args.workerID = i;
			args.startX = startX;
			args.width = width;
			args.startY = startY;
			args.height = sliceForEachWorker;
			args.maxImaginary = maxImaginary;
			args.imaginaryFactor = imaginaryFactor;
			args.minReal = minReal;
			args.realFactor = realFactor;
			args.maxIterations = maxIterations;
			args.imageData = imageData.data;

			var worker = new Worker("mandelbrotRenderer.js");
			
			worker.onmessage = function(event) {
				var theTime = new Date();
				logToMessageDiv("Worker " + workerID + " returned from rendering: " + theTime + " diff: " + ((theTime - startTime) / 1000));

				var renderValues = event.data;
				var workerID = renderValues.workerID;
				var retStartX = renderValues.startX;
				var retStartY = renderValues.startY;
				var retImageData = renderValues.imageData;

				var newImageData = ctx.createImageData(width, sliceForEachWorker);
				newImageData.data = retImageData;
				ctx.putImageData(newImageData, retStartX, retStartY);

				theTime = new Date();
				logToMessageDiv("Worker " + workerID + " finished drawing: " + theTime + " diff: " + ((theTime - startTime) / 1000));
			};

			worker.onerror = function(error) {
				dump("Worker error: " + error.message + "\n");
				throw error;
			};

			worker.postMessage(args);
		}
	}
}

var messageDiv;
function logToMessageDiv(message) {
	if (!messageDiv) {
		messageDiv = document.getElementById("messageDiv");
	}

	messageDiv.innerHTML += message + "<br />\n";
}
