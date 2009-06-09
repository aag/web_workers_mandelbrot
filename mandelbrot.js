function draw() {
	var canvas = document.getElementById("can");
	if (canvas.getContext) {
		var ctx = canvas.getContext("2d");
		drawMandelbrot(ctx);
	}
}

function drawMandelbrot(ctx) {
	if (ctx) {
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
		ctx.fillRect(20, 20, 50, 50);
	}	
}
