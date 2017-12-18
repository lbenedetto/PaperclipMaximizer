var net = new brain.recurrent.RNN();
setInterval(compute, 500);//AI can click one thing every 1/2 second
var ops = 72000;//10 minutes

function compute(){
	if(ops-- < 0){
		done();
		return;
	}
	//Do stuff
	var targetButton = net.run([0, 0]);  // [0]
}

function done(){
	//calculate final results
}