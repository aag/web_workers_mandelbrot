var startTime;
var slicesFinished = 0;
var numWorkers = 0;

function draw() {
	var canvas = document.getElementById("can");
	if (canvas.getContext) {
		var ctx = canvas.getContext("2d");

        var imageWidth = canvas.width;
		var imageHeight = canvas.height;

        numWorkers = 2;
        slicesFinished = 0;
        
		// We have all the info we need, so do the drawing
        startTime = new Date();
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
            
            var argArray = [startX, width, startY, sliceForEachWorker, maxImaginary, imaginaryFactor, minReal, realFactor, maxIterations];
            
            var worker = new Worker("mandelbrotRenderer.js");
            
            worker.onmessage = function(event) {
                var retArray = event.data;
                var retStartX = retArray[0];
                var retStartY = retArray[1];
                var valueArray = retArray[2];
                
                paintToCanvas(ctx, retStartX, retStartY, valueArray);
            };

            worker.onerror = function(error) {
                dump("Worker error: " + error.message + "\n");
                throw error;
            };

            worker.postMessage(argArray);
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
        document.getElementById("messageDiv").textContent = "Rendering took " + timing + " seconds.";
    }
}
