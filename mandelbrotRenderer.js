onmessage = function(event) {
	var argArray = event.data;
	
	var retArray = renderRows(argArray);
	
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
	
	var valueArray = new Array(height);
	
	for (var y = 0; y < height; y++) {
		var cImaginary = maxImaginary - (startY + y) * imaginaryFactor;

		var rowArray = renderRow(startX, width, minReal, realFactor, cImaginary, maxIterations);
		valueArray[y] = rowArray;
	}
	
	var retValues = new Object;
	retValues.workerID = workerID;
	retValues.startX = startX;
	retValues.startY = startY;
	retValues.valueArray = valueArray;

	return retValues;
}

function renderRow(startX, width, minReal, realFactor, cImaginary, maxIterations) {
	var retArray = new Array(width);

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

		if (inSet) {
			retArray[x] = 0;
		} else {
			// Scale the brightness to 100
			retArray[x] = (it / maxIterations) * 100;
		}
	}
	
	return retArray;
}
