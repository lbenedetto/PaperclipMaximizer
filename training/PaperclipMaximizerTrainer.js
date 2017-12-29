//5 minutes per sim = 300 seconds
//5000 ops per sim = 16 ops per second
var startOps = 5000;
var clickRate = 62; //click once everY x ms
var popSize = 24;
var numGenerations = 200;
var highscore = 0;
var networks = [];
var numInputs = 13;
var numOutputs = 7;
var numHiddenLayers = 20;
var numNeurons = 50;

for (var i = 0; i < popSize; i++) {
	networks.push(new Brainwave.Network(numInputs, numOutputs, numHiddenLayers, numNeurons));
}

var genetics = new Brainwave.Genetics(popSize, networks[0].getNumWeights());

var generation = 0;
mainLoop();

function mainLoop() {
	if (generation < numGenerations) {
		if (generation > 0) {
			for (var k = 0; k < popSize; k++) {
				$("#game" + k)[0].contentWindow.reset();
			}
		}
		//Wait for resets to finish
		setTimeout(doGeneration, 5000);
	}
}

function doGeneration() {
	importWeights();
	console.log("===== Current Highscore ===== : " + highscore);
	new PaperclipMaximizer(mainLoop, networks, genetics.population);
}

function importWeights() {
	for (var j = 0; j < popSize; j++) {
		networks[j].importWeights(genetics.population[j].weights);
	}
}

function PaperclipMaximizer(callback, net, pop) {
	var ops = startOps;
	var games = [];
	var k;
	var context;
	for (k = 0; k < popSize; k++) {
		context = $("#game" + k);
		games[k] = {
			"context": context,
			"gameState": loadGameState(k),
			"actions": loadGameActions(k)
		}
	}
	var repeatingTask = setInterval(work, clickRate);

	function work() {
		if (ops <= 0) {//Done with all networks
			for (k = 0; k < popSize; k++) {
				var score = fitness(k);
				console.log("Generation #" + generation + ", Net #" + k);
				if (score > highscore) {
					console.log("Achieved highscore of " + score);
					var weights = net.exportWeights();
					console.log(weights);
					localStorage.setItem("bestWeights", weights);
					highscore = score;
				} else {
					console.log("Achieved score of " + score);
				}
				pop[k].fitness = score;
				clearInterval(repeatingTask);
			}
			genetics.epoch(genetics.population);
			generation++;
			callback();
		} else {//Run all networks
			ops--;
			for (k = 0; k < popSize; k++) {
				var chosenAction = chooseAction(net[k].run(getGameState(k)));
				games[k]["actions"][chosenAction]();
				games[k]["gameState"]["btnMakePaperclip"].click();
			}

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

	function loadGameActions(k) {
		return [
			function () {
				games[k]["gameState"]["btnLowerPrice"].click();
			},
			function () {
				games[k]["gameState"]["btnRaisePrice"].click();
			},
			function () {
				games[k]["gameState"]["btnExpandMarketing"].click();
			},
			function () {
				games[k]["gameState"]["btnBuyWire"].click();
			},
			function () {
				games[k]["gameState"]["btnMakeClipper"].click();
			},
			function () {
				games[k]["gameState"]["btnMakeMegaClipper"].click();
			},
			function () {
				//No Op
			}
		];
	}

	function loadGameState(k) {
		return {
			"clips" : select("#clips", k),
			"funds": select("#funds", k),
			"margin": select("#margin", k),//Price per clip
			"clipRate": select("#clipmakerRate", k),
			"avgSales": select("#avgSales", k),
			"wire": select("#wire", k),
			"adCost": select("#adCost", k),
			"wireCost": select("#wireCost", k),
			"clipperCost": select("#clipperCost", k),
			"megaClipperCost": select("#megaClipperCost", k),
			//buttons
			"btnMakePaperclip": select("#btnMakePaperclip", k),
			"btnLowerPrice": select("#btnLowerPrice", k),
			"btnRaisePrice": select("#btnRaisePrice", k),
			"btnExpandMarketing": select("#btnExpandMarketing", k),
			"btnBuyWire": select("#btnBuyWire", k),
			"btnMakeClipper": select("#btnMakeClipper", k),
			"btnMakeMegaClipper": select("#btnMakeMegaClipper", k)
		};
	}

	function getGameState(k) {
		var game = games[k]["gameState"];
		return [
			 toInt(game["funds"]),
			 toInt(game["margin"]),//Price per clip
			 toInt(game["clipmakerRate"]) - toInt(game["avgSales"]), //Net number of clips per second
			(toInt(game["wire"]) === 0) * 1, //Did we run out of wire?
			 toInt(game["adCost"]),
			 toInt(game["wireCost"]),
			 toInt(game["clipperCost"]),
			 toInt(game["megaClipperCost"]),
				   game["btnLowerPrice"].disabled * 1,
				   game["btnExpandMarketing"].disabled * 1,
				   game["btnBuyWire"].disabled * 1,
				   game["btnMakeClipper"].disabled * 1,
				   game["btnMakeMegaClipper"].disabled * 1
		];
	}

	function fitness(k) {
		return toInt(games[k]["gameState"]["clips"])
	}

	function select(target, k) {
		return context.contents().find(target)[0];
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