onmessage = function(event) {
	var args = event.data;
	
	var retArray = renderRows(args);
	
	postMessage(retArray);
};

function renderRows(args) {
	var workerID = args.workerID;
	var startX = args.startX;
	var width = args.width;
	var startY = args.startY;
	var height = args.height;
	var maxImaginary = args.maxImaginary;
	var imaginaryFactor = args.imaginaryFactor;
	var minReal = args.minReal;
	var realFactor = args.realFactor;
	var maxIterations = args.maxIterations;
	var imageData = args.imageData;
	
	for (var y = 0; y < height; y++) {
		var cImaginary = maxImaginary - (startY + y) * imaginaryFactor;

		renderRow(startX, y, width, minReal, realFactor, cImaginary, maxIterations, imageData);
	}
	
	var retValues = new Object;
	retValues.workerID = workerID;
	retValues.startX = startX;
	retValues.startY = startY;
	retValues.imageData = imageData;

	return retValues;
}

function renderRow(startX, y, width, minReal, realFactor, cImaginary, maxIterations, imageData) {
	for (var x = startX; x < width; x++) {
		var cReal = minReal + x * realFactor;

		// Calculate if c is in the set
		var zReal = cReal;
		var zImaginary = cImaginary;
		var inSet = true;
		var it = 0;

		for (it = 0; it < maxIterations; ++it) {
			var zReal2 = zReal * zReal;
			var zImaginary2 = zImaginary * zImaginary;

			// if abs(z) > 2
			if ((zReal2 + zImaginary2) > 4) {
				inSet = false;
				break;
			}
			zImaginary = 2 * zReal * zImaginary + cImaginary;
			zReal = zReal2 - zImaginary2 + cReal;
		}

		var brightness = 0;
		if (!inSet) {
			brightness = (it / maxIterations) * 254;
		}

		var pixelStartPos = ((y * width) + x) * 4;
		// Set the opacity to solid
		imageData[pixelStartPos + 3] = 255;
		// Set the red to the brightness
		imageData[pixelStartPos] = brightness;
	}
}
