var maximizers = [];

//5 minutes per sim = 300 seconds
//5000 ops per sim = 16 ops per second
//20 population, 100 generations
var startOps = 2000;
var popSize = 24;
var numGenerations = 1000;
var clickRate = 62; //click once ever x ms
var highscore = 0;
// Create an array to hold the population of networks
var networks = [];
// Populate the networks array
numInputs = 13;

//Network(numInputs, numOutputs, numHiddenLayers, numNeuronsPerHiddenLayer);
for (var i = 0; i < popSize; i++) {
	networks.push(new Brainwave.Network(numInputs, 7, 20, numInputs));
}
// Next we need to create the Genetics object that will evolve the networks for us
var genetics = new Brainwave.Genetics(popSize, networks[0].getNumWeights());

var callbackNum = -1;
var generation = 0;
mainLoop();

function mainLoop() {
	if (generation < numGenerations) {
		if (callbackNum === popSize - 1) {//Population is done, move to next gen
			callbackNum = -1;
			genetics.epoch(genetics.population);
			generation++;
		}
		if (callbackNum === -1) {
			if (generation > 0) {
				for (var k = 0; k < popSize; k++) {
					$("#game" + k)[0].contentWindow.reset();
				}
			}
			callbackNum = 0;
			setTimeout(doGeneration, 5000);//Wait for resets to finish
		} else {
			callbackNum++;
		}
	} else {
		done();
	}
}

function doGeneration() {
	importWeights();
	console.log("===== Current Highscore ===== : " + highscore);
	// Now the networks and genetics are all set up training can begin. Pass each network an input and issue
	// it a fitness depending on how close its output was to the desired output
	for (var k = 0; k < popSize; k++) {
		new PaperclipMaximizer("#game" + k, k, mainLoop, networks[k], genetics.population[k]);
	}
}

function importWeights() {
	// When creating the genetics object it will also generate random weights an baises for the networks
	// These should be imported into the population of networks before beginning any training
	for (var j = 0; j < popSize; j++) {
		networks[j].importWeights(genetics.population[j].weights);
	}
}

function done() {
	//Done with all generations
	//Save best network
	var bestFit = 0;
	var bestFitIx = 0;
	for (var n = 0; n < popSize; n++) {
		if (genetics.population[n].fitness > bestFit) {
			bestFitIx = n;
			bestFit = genetics.population[n].fitness;
		}
	}
	console.log(JSON.stringify(networks[bestFitIx]));
}

function PaperclipMaximizer(target, id, callback, net, pop) {
	maximizers[id] = this;
	var ops = startOps;
	var lastAction = 0;
	var actions, numOutputs;
	var context = $(target);
	var game = loadGame();
	actions = [
		function () {
			game["btnLowerPrice"].click();
		},
		function () {
			game["btnRaisePrice"].click();
		},
		function () {
			game["btnExpandMarketing"].click();
		},
		function () {
			game["btnBuyWire"].click();
		},
		function () {
			game["btnMakeClipper"].click();
		},
		function () {
			game["btnMakeMegaClipper"].click();
		},
		function (){
			//No Op
		}
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
	numOutputs = actions.length;
	pop.fitness = 0;
	var repeatingTask = setInterval(work, clickRate);

	function work() {
		if (ops <= 0) {//Done with current network
			var score = fitness();
			console.log("Generation #" + generation + ", Net #" + id);
			if (score >= highscore) {
				console.log("Achieved highscore of " + score);
				highscore = score;
			} else {
				console.log("Achieved score of " + score);
			}
			pop.fitness += score;
			clearInterval(repeatingTask);
			callback();
		} else {//Run current network
			ops--;
			//Pass game board array into the run function
			var chosenAction = chooseAction(net.run(getGameState()));
			lastAction = chosenAction;
			//console.log("Op #" + ops + ", Gen #" + generation + ", Sim #" + id + ": (" + chosenAction + ") " + actionNames[chosenAction]);
			actions[chosenAction]();
			game["btnMakePaperclip"].click();
		}
	}

	function chooseAction(output) {
		var max = 0;
		var maxIX = 0;
		for (var i = 0; i < numOutputs; i++) {
			if (output[i] > max) {
				maxIX = i;
				max = output[i];
			}
		}
		return maxIX;
	}

	function loadGame() {
		return {
			"funds": select("#funds"),
			"margin": select("#margin"),//Price per clip
			"clipRate": select("#clipmakerRate"),
			"avgSales": select("#avgSales"),
			"wire": select("#wire"),
			"adCost": select("#adCost"),
			"wireCost": select("#wireCost"),
			"clipperCost": select("#clipperCost"),
			"megaClipperCost": select("#megaClipperCost"),
			//buttons
			"btnMakePaperclip": select("#btnMakePaperclip"),
			"btnLowerPrice": select("#btnLowerPrice"),
			"btnRaisePrice": select("#btnRaisePrice"),
			"btnExpandMarketing": select("#btnExpandMarketing"),
			"btnBuyWire": select("#btnBuyWire"),
			"btnMakeClipper": select("#btnMakeClipper"),
			"btnMakeMegaClipper": select("#btnMakeMegaClipper")
			// toInt(select("#trust")),
			// toInt(select("#nextTrust")),
			// toInt(select("#processors")),
			// toInt(select("#memory")),
			// toInt(select("#operations")),
			// toInt(select("#creativity")),
			// getQChipValue("#qChip0") +
			// getQChipValue("#qChip1") +
			// getQChipValue("#qChip2") +
			// getQChipValue("#qChip3") +
			// getQChipValue("#qChip4") +
			// getQChipValue("#qChip5") +
			// getQChipValue("#qChip6") +
			// getQChipValue("#qChip7") +
			// getQChipValue("#qChip8") +
			// getQChipValue("#qChip9"),
			// toInt(select("#investmentBankroll").innerHTML),
			// toInt(select("#secValue").innerHTML),
			// toInt(select("#portValue").innerHTML),
			// toInt(select("#investmentLevel").innerHTML),
			// toInt(select("#investUpgradeCost").innerHTML),
			// toInt(select("#yomiDisplay").innerHTML),
			// toInt(select("#newTourneyCost").innerHTML),
		};
	}

	function getGameState() {
		return [
			toInt(game["funds"]),
			toInt(game["margin"]),//Price per clip
			toInt(game["clipmakerRate"]) - toInt(game["avgSales"]), //Net number of clips per second
			(toInt(game["wire"]) === 0) * 1, //Did we run out of wire?
			toInt(game["adCost"]),
			toInt(game["wireCost"]),
			toInt(game["clipperCost"]),
			toInt(game["megaClipperCost"]),
			//Some booleans for if buttons can be clicked
			game["btnLowerPrice"].disabled * 1,
			game["btnExpandMarketing"].disabled * 1,
			game["btnBuyWire"].disabled * 1,
			game["btnMakeClipper"].disabled * 1,
			game["btnMakeMegaClipper"].disabled * 1
			// toInt(select("#trust")),
			// toInt(select("#nextTrust")),
			// toInt(select("#processors")),
			// toInt(select("#memory")),
			// toInt(select("#operations")),
			// toInt(select("#creativity")),
			// getQChipValue("#qChip0") +
			// getQChipValue("#qChip1") +
			// getQChipValue("#qChip2") +
			// getQChipValue("#qChip3") +
			// getQChipValue("#qChip4") +
			// getQChipValue("#qChip5") +
			// getQChipValue("#qChip6") +
			// getQChipValue("#qChip7") +
			// getQChipValue("#qChip8") +
			// getQChipValue("#qChip9"),
			// toInt(select("#investmentBankroll").innerHTML),
			// toInt(select("#secValue").innerHTML),
			// toInt(select("#portValue").innerHTML),
			// toInt(select("#investmentLevel").innerHTML),
			// toInt(select("#investUpgradeCost").innerHTML),
			// toInt(select("#yomiDisplay").innerHTML),
			// toInt(select("#newTourneyCost").innerHTML),
		];
	}

	function fitness() {
		//TODO: Better fitness function
		return toInt(select("#clips"))
			//+ (toInt(select("#funds")) / 10)
			- (toInt(select("#unsoldClips")) / 2);
	}

	function select(target) {
		return context.contents().find(target)[0];
	}

	function getQChipValue(target) {
		try {
			return select("#qChip0").css("opacity");
		} catch (e) {
			return 2;
		}
	}
}

function toInt(input) {
	try {
		var ht = input.innerHTML;
		var val = parseFloat(ht.replace(/,/g, ''));
		if (isNaN(val)) return 0;
		return val;
	} catch (e) {
		return 0;
	}
}

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	for (var i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
