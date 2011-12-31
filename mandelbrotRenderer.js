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

        var intensity = 0;
        var red = 0;
        var green = 0;
        var blue = 0;

        if (!inSet) {
            intensity = ((it / maxIterations) * 722) + 40;
            if (intensity > 0 && intensity <= 254) {
                red = intensity;
            } else if (intensity > 254 && intensity <= 508) {
                red = 254;
                green = intensity - 254;
            } else if (intensity > 508) {
                red = 254;
                green = 254;
                blue = intensity - 508;
            }
        }

        var pixelStartPos = ((y * width) + x) * 4;
        // Set the opacity to solid
        imageData[pixelStartPos + 3] = 255;
        // Set the color
        imageData[pixelStartPos] = red;
        imageData[pixelStartPos + 1] = green;
        imageData[pixelStartPos + 2] = blue;
    }
}
