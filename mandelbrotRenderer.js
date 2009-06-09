onmessage = function(event) {
    var argArray = event.data;
    
    var retArray = renderRows(argArray);
    
    postMessage(retArray);
};

function renderRows(argArray) {
    var startX = argArray[0];
    var width = argArray[1];
    var startY = argArray[2];
    var height = argArray[3];
    var maxImaginary = argArray[4];
    var imaginaryFactor = argArray[5];
    var minReal = argArray[6];
    var realFactor = argArray[7];
    var maxIterations = argArray[8];
    
    var valueArray = new Array(height);
    
    for (var y = 0; y < height; y++) {
        var cImaginary = maxImaginary - (startY + y) * imaginaryFactor;

        var rowArray = renderRow(startX, width, minReal, realFactor, cImaginary, maxIterations);
        valueArray[y] = rowArray;
    }
    
    var retArray = new Array(3);
    retArray[0] = startX;
    retArray[1] = startY;
    retArray[2] = valueArray;
    
    return retArray;
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