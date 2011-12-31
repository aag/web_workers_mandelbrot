var startTime;
var slicesFinished = 0;
var numWorkers = 0;
var returnedValueArrays = null;
var workerPool = null;

function init() {
	reInitWorkerPool();
}

function reInitWorkerPool() {
	numWorkers = getNumWorkersFromPage();
	logToMessageDiv("Re-initializing the worker pool to size: " + numWorkers);
	workerPool = null;
	workerPool = new Array(numWorkers);

	for (var i = 0; i < workerPool.length; i++) {
		workerPool[i] = getNewWorker();
	}
}

function getNewWorker() {
	var worker = new Worker("mandelbrotRenderer.js");
			
	worker.onmessage = function(event) {
		var theTime = new Date();

		var renderValues = event.data;
		var retWorkerID = renderValues.workerID;
		var retStartX = renderValues.startX;
		var retStartY = renderValues.startY;
		var retImageData = renderValues.imageData;

		logToMessageDiv("Worker " + retWorkerID + " returned from rendering: " + theTime + " diff: " + ((theTime - startTime) / 1000));

		var width = getCanvasContext().canvas.width;
		var height = getCanvasContext().canvas.height;
		var sliceForEachWorker = parseInt(height / numWorkers);

		var newImageData = getCanvasContext().createImageData(width, sliceForEachWorker);
        for (var i = 0; i < retImageData.length; i++) {
            newImageData.data[i] = retImageData[i];
        }
		getCanvasContext().putImageData(newImageData, retStartX, retStartY);

		theTime = new Date();
		logToMessageDiv("Worker " + retWorkerID + " finished drawing: " + theTime + " diff: " + ((theTime - startTime) / 1000));
	};

	worker.onerror = function(error) {
		logToMessageDiv("Worker error: " + error.message + "\n");
		throw error;
	};

	return worker;
}

function draw() {
	var imageWidth = getCanvasContext().canvas.width;
	var imageHeight = getCanvasContext().canvas.height;

	// Clear the whole canvas
	getCanvasContext().clearRect(0, 0, imageWidth, imageHeight);

	numWorkers = getNumWorkersFromPage();
	slicesFinished = 0;
	returnedValueArrays = new Array(numWorkers);
		
	// We have all the info we need, so do the drawing
	startTime = new Date();
	logToMessageDiv("Starting to draw: " + startTime);
	drawMandelbrotWithWorkers(numWorkers);
}

function getNumWorkersFromPage() {
	var retVal = 0;

	var nwSelect = document.getElementById("numWorkers");
	if (nwSelect) {
		retVal = parseInt(nwSelect.options[nwSelect.selectedIndex].value);
	}

	return retVal;
}

function drawMandelbrotWithWorkers(numWorkers) {
	var maxIterations = 100;
	var minReal = -2.0;
	var maxReal = 1.0;
	var minImaginary = -1.2;

	var width = getCanvasContext().canvas.width;
	var height = getCanvasContext().canvas.height;

	if (getCanvasContext()) {
		var maxImaginary = minImaginary + (maxReal - minReal) * (height / width);
		var realFactor = (maxReal - minReal) / (width - 1);
		var imaginaryFactor = (maxImaginary - minImaginary) / (height - 1);
		
		var startX = 0;
		var startY = 0;
		
		var sliceForEachWorker = parseInt(height / numWorkers);
		
		// Send work to the workers
		for (var i = 0; i < numWorkers; i++) {
			startY = parseInt(i * sliceForEachWorker);

			var imageData = getCanvasContext().createImageData(width, sliceForEachWorker);
			
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

			workerPool[i].postMessage(args);
		}
	}
}

var ctx;
function getCanvasContext() {
	if (!ctx) {
		var canvas = document.getElementById("can");
		if (canvas.getContext) {
			ctx = canvas.getContext("2d");
		}
	}	

	return ctx;
}

var messageDiv;
function logToMessageDiv(message) {
	if (!messageDiv) {
		messageDiv = document.getElementById("messageDiv");
	}

	messageDiv.innerHTML += message + "<br />\n";
}
