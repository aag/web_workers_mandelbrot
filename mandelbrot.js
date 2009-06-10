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

		numWorkers = 6;
		slicesFinished = 0;
		returnedValueArrays = new Array(numWorkers);
		
		// We have all the info we need, so do the drawing
		startTime = new Date();
		logToMessageDiv("Starting to draw: " + startTime);
		drawMandelbrot(ctx, imageWidth, imageHeight, numWorkers);
	}
}

function drawMandelbrot(ctx, width, height, numWorkers) {
	var maxIterations = 100;
	var minReal = -1.0;
	var maxReal = 0.2;
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

			var worker = new Worker("mandelbrotRenderer.js");
			
			worker.onmessage = function(event) {
				var theTime = new Date();
				var renderValues = event.data;
				var workerID = renderValues.workerID;
				var retStartX = renderValues.startX;
				var retStartY = renderValues.startY;
				var valueArray = renderValues.valueArray;

				logToMessageDiv("Worker " + workerID + " returned: " + theTime + " diff: " + ((theTime - startTime) / 1000));
				
				paintToCanvas(ctx, retStartX, retStartY, valueArray);
			};

			worker.onerror = function(error) {
				dump("Worker error: " + error.message + "\n");
				throw error;
			};

			worker.postMessage(args);
		}
	}
}

function paintToCanvas(ctx, startX, startY, array) {
	var arrayHeight = array.length;
	var arrayWidth = 0;
	
	if (arrayHeight > 0) {
		arrayWidth = array[0].length;
	}

	var lastBrightness = 0;
	for (var i = 0; i < arrayHeight; i++) {
		for (var j = startX; j < arrayWidth; j++) {
			var brightness = parseInt((array[i][j] / 100) * 254);
			if (lastBrightness != brightness) {
				ctx.fillStyle = "rgba(" + brightness + ", 0, 0, 1.0)";
				lastBrightness = brightness;
			}
			ctx.fillRect(j, (startY + i), 1, 1);
		}
	}
	
	slicesFinished = slicesFinished + 1;
	
	if (slicesFinished == numWorkers) {
		var endTime = new Date();
		var timing = (endTime - startTime) / 1000;
		logToMessageDiv("Rendering took " + timing + " seconds.");
	}
}

var messageDiv;
function logToMessageDiv(message) {
	if (!messageDiv) {
		messageDiv = document.getElementById("messageDiv");
	}

	messageDiv.innerHTML += message + "<br />\n";
}
