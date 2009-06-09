function draw() {
	var canvas = document.getElementById("can");
	if (canvas.getContext) {
		var ctx = canvas.getContext("2d");

		// Set up constants
		var imageWidth = canvas.width;
		var imageHeight = canvas.height;
		var minReal = -2.0;
		var maxReal = 1.0;
		var minImaginary = -1.2;

		// We have all the info we need, so do the drawing
		drawMandelbrot(ctx, imageWidth, imageHeight, minReal, maxReal, minImaginary);
	}
}

function drawMandelbrot(ctx, width, height, minReal, maxReal, minImaginary) {
	var maxIterations = 50;

	if (ctx) {
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";

		var maxImaginary = minImaginary + (maxReal - minReal) * (height / width);
		var realFactor = (maxReal - minReal) / (width - 1);
		var imaginaryFactor = (maxImaginary - minImaginary) / (height - 1);

		for (var y = 0; y < height; ++y) {
			var cImaginary = maxImaginary - y * imaginaryFactor;

			for (var x = 0; x < width; ++x) {
				var cReal = minReal + x * realFactor;

				// Calculate if c is in the set
				var zReal = cReal;
				var zImaginary = cImaginary;
				var inSet = true;

				for (var n = 0; n < maxIterations; ++n) {
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
					ctx.fillRect(x, y, 1, 1);
				}
			}
		}	
	}	
}
