setTimeout(run, 2000);
var numActions;
var popSize = 20;

var highscore = 0;
//5 minutes per sim = 300 seconds
//5000 ops per sim = 16 ops per second
//20 population, 100 generations
var clickRate = 62; //click once ever x ms
var generation = 0;
var startOps = 5000;
var ops = startOps;
var game, actions, numInputs, genetics;
var lastAction = 0;
var lastGameState = 0;
var k = 0;
var networks = [];
function run() {
	game = $("#game")[0].contentWindow;
	actionNames = [
		"Make Paperclip",
		"Lower Price",
		"Raise Price",
		"Expand Marketing",
		"Buy Wire",
		"Make Clipper",
		"Make Mega Clipper"
	];
	actions = [
		function () { select("#btnMakePaperclip").click() },
		function () { select("#btnLowerPrice").click() },
		function () { select("#btnRaisePrice").click() },
		function () { select("#btnExpandMarketing").click() },
		function () { select("#btnBuyWire").click() },
		function () { select("#btnMakeClipper").click() },
		function () { select("#btnMakeMegaClipper").click() },
		// function () { select("#btnAddProc").click() },
		// function () { select("#btnAddMem").click() },
		// function () { select("#btnQcompute").click() },
		// function () { select("#btnInvest").click() },
		// function () { select("#btnWithdraw").click() },
		// function () { select("#btnImproveInvestments").click() },
		// function () { select("#btnNewTournament").click() },
		// function () { select("#btnRunTournament").click() },
		// function () { select("#investStrat").val("low") },
		// function () { select("#investStrat").val("med") },
		// function () { select("#investStrat").val("hi") },
		//TODO: Add actions for picking strategic modeling strats
		// function () { try { select("projectButton1").click() } catch (e) {} },
		// function () { try { select("projectButton2").click() } catch (e) {} },
		// function () { try { select("projectButton3").click() } catch (e) {} },
		// function () { try { select("projectButton4").click() } catch (e) {} },
		// function () { try { select("projectButton5").click() } catch (e) {} },
		// function () { try { select("projectButton6").click() } catch (e) {} },
		// function () { try { select("projectButton7").click() } catch (e) {} },
		// function () { try { select("projectButton8").click() } catch (e) {} },
		// function () { try { select("projectButton9").click() } catch (e) {} },
		// function () { try { select("projectButton10").click() } catch (e) {} },
		// function () { try { select("projectButton11").click() } catch (e) {} },
		// function () { try { select("projectButton12").click() } catch (e) {} },
		// function () { try { select("projectButton13").click() } catch (e) {} },
		// function () { try { select("projectButton14").click() } catch (e) {} },
		// function () { try { select("projectButton15").click() } catch (e) {} },
		// function () { try { select("projectButton16").click() } catch (e) {} },
		// function () { try { select("projectButton17").click() } catch (e) {} },
		// function () { try { select("projectButton18").click() } catch (e) {} },
		// function () { try { select("projectButton19").click() } catch (e) {} },
		// function () { try { select("projectButton20").click() } catch (e) {} },
		// function () { try { select("projectButton21").click() } catch (e) {} },
		// function () { try { select("projectButton42").click() } catch (e) {} }
		//TODO: add the rest of the project buttons
	];
	numActions = actions.length;
	game.reset();
	k = 0;
	// Create an array to hold the population of networks
	networks = [];
	// Populate the networks array
	numInputs = getGameState().length;
	//Network(numInputs, numOutputs, numHiddenLayers, numNeuronsPerHiddenLayer);
	for (var i = 0; i < popSize; i++) {
		networks.push(new Brainwave.Network(numInputs, 1, 3, numInputs));
	}
	// Next we need to create the Genetics object that will evolve the networks for us
	genetics = new Brainwave.Genetics(popSize, networks[0].getNumWeights());
	networks[k].importWeights(genetics.population[k].weights);
	setTimeout(work, clickRate);
}
var isFirstAction = true;
function work() {
	if (generation >= 1000) {//Done with all generations
		//Save best network
		var bestFit = 0;
		var bestFitIx = 0;
		for(var n = 0; n < popSize; n++){
			if(genetics.population[n].fitness > bestFit){
				bestFitIx = n;
				bestFit = genetics.population[n].fitness;
			}
		}
		console.log(JSON.stringify(networks[bestFitIx]))
	} else if (k >= popSize) {//Done with all networks in current generation
		//Evolve the networks based on the fitness results
		genetics.epoch(genetics.population);
		//Done with this generation
		generation++;
		k = 0;
		setTimeout(work, clickRate)
	} else if (ops <= 0) {//Done with current network
		var score = fitness();
		console.log("Generation #" + generation + ", Net #" + k);
		if (score >= highscore) {
			console.log("Achieved highscore of " + score);
			highscore = score;
		}else{
			console.log("Achieved score of " + score);
		}
		genetics.population[k].fitness = score;
		k++;
		if(k < popSize)
			networks[k].importWeights(genetics.population[k].weights);
		ops = startOps;
		isFirstAction = true;
		game.reset();
		numTimesNotChanged = 0;
		setTimeout(work, clickRate + 1000)
	} else {//Run current network
		ops--;
		//Pass game board array into the run function
		var chosenAction = scaleOutput(networks[k].run(getGameState()));
		lastAction = chosenAction;
		console.log("(" + chosenAction + ") " + actionNames[chosenAction]);
		if(numTimesNotChanged >= 10){//Network is stuck, kill it
			ops = 0;
		}
		actions[chosenAction]();
		setTimeout(work, clickRate)
	}
}

function scaleOutput(output){
	return Math.floor(output[0] * numActions);
}

var numTimesNotChanged = 0;
var lastFitness = 0;
function getGameState() {
	var gameState = [
		lastAction,
		toInt(select("#clips")),
		toInt(select("#funds")),
		toInt(select("#unsoldClips")),
		toInt(select("#avgRev")),
		toInt(select("#avgSales")),
		toInt(select("#adCost")),
		toInt(select("#margin")),//Price per clip
		toInt(select("#wire")),
		toInt(select("#wireCost")),
		toInt(select("#clipmakerLevel2")),
		toInt(select("#megaClipperLevel")),
		toInt(select("#clipperCost")),
		toInt(select("#megaClipperCost")),
		// toInt(select("#trust")),
		// toInt(select("#nextTrust")),
		// toInt(select("#processors")),
		// toInt(select("#memory")),
		// toInt(select("#operations")),
		// toInt(select("#creativity")),
		// getQChipValue("#qChip0"),
		// getQChipValue("#qChip1"),
		// getQChipValue("#qChip2"),
		// getQChipValue("#qChip3"),
		// getQChipValue("#qChip4"),
		// getQChipValue("#qChip5"),
		// getQChipValue("#qChip6"),
		// getQChipValue("#qChip7"),
		// getQChipValue("#qChip8"),
		// getQChipValue("#qChip9"),
		// getQCompDisplay(),
		// toInt(select("#investmentBankroll").innerHTML),
		// toInt(select("#secValue").innerHTML),
		// toInt(select("#portValue").innerHTML),
		// toInt(select("#investmentLevel").innerHTML),
		// toInt(select("#investUpgradeCost").innerHTML),
		// toInt(select("#yomiDisplay").innerHTML),
		// toInt(select("#newTourneyCost").innerHTML),
	];
	var temp = gameState;
	gameState.push((lastGameState === gameState) * 1);
	//Maybe check if fitness function isn't improving instead?
	var cfitness = fitness();
	if(lastFitness === cfitness){
		numTimesNotChanged++;
	}else{
		numTimesNotChanged = 0;
	}
	lastGameState = temp;
	lastFitness = cfitness;
	return gameState;
}

function fitness(){
	//TODO: Better fitness function
	return toInt(select("#clips"))
		+ (toInt(select("#funds")) / 10)
		- (toInt(select("#unsoldClips")) / 2);
}

function getQCompDisplay () {
	var val = parseInt(select("#qCompDisplay").innerHTML.replace("qOps: ", ""));
	if(isNaN(val)) return 0;
}

function getQChipValue(target){
	try {
		return select("#qChip0").css("opacity");
	} catch (e) {
		return 2;
	}
}

function toInt(input) {
	try {
		var ht = input.innerHTML;
		var val =  parseFloat(ht.replace(/,/g, ''));
		if(isNaN(val)) return 0;
		return val;
	} catch (e) {
		return 0;
	}
}

var context = window.parent.frames[0].document;
function select(target){
	var tmep = $(target, window.parent.frames[0].document)[0];
	return tmep;
}

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;

	for (var i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function pruneCurrentNetwork(){
	ops = 0;
}