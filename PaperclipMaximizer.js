setTimeout(run, 1000);

function run() {
	var popSize = 20;
	// Create an array to hold the population of networks
	var networks = [];

	// Populate the networks array
	for (var i = 0; i < popSize; i++) {
		networks.push(new Brainwave.Network(4, 1, 1, 4));
	}
	var highscore = 0;
	// Next we need to create the Genetics object that will evolve the networks for us
	var genetics = new Brainwave.Genetics(popSize, networks[0].getNumWeights());
	var clickRate = 100; //click once ever x ms
	var generation = 0;
	var ops = 5000;
	var game = $("#game")[0].contentWindow;
	var actions = [
		select("#btnMakePaperclip").click,
		select("#btnLowerPrice").click,
		select("#btnRaisePrice").click,
		select("#btnExpandMarketing").click,
		select("#btnBuyWire").click,
		select("#btnMakeClipper").click,
		select("#btnMakeMegaClipper").click,
		select("#btnAddProc").click,
		select("#btnAddMem").click,
		select("#btnQcompute").click,
		select("#btnInvest").click,
		select("#btnWithdraw").click,
		select("#btnImproveInvestments").click,
		select("#btnNewTournament").click,
		select("#btnRunTournament").click,
		function () { select("#investStrat").val("low") },
		function () { select("#investStrat").val("med") },
		function () { select("#investStrat").val("hi") },
		//TODO: Add actions for picking strategic modeling strats
		select("projectButton1").click,
		select("projectButton2").click,
		select("projectButton3").click,
		select("projectButton4").click,
		select("projectButton5").click,
		select("projectButton6").click,
		select("projectButton7").click,
		select("projectButton8").click,
		select("projectButton9").click,
		select("projectButton10").click,
		select("projectButton11").click,
		select("projectButton12").click,
		select("projectButton13").click,
		select("projectButton14").click,
		select("projectButton15").click,
		select("projectButton16").click,
		select("projectButton17").click,
		select("projectButton18").click,
		select("projectButton19").click,
		select("projectButton20").click,
		select("projectButton42").click,
		select("projectButton21").click
		//TODO: add the rest of the project buttons
	];
	game.reset();
	var k = 0;
	networks[k].importWeights(genetics.population[k].weights);
	var timer = setInterval(function () {
		if (generation > 1000) {//Done with all generations
			//Done evolving
			clearInterval(timer);
			//TODO: Save best network
		} else if (k > popSize) {//Done with all networks in current generation
			//Evolve the networks based on the fitness results
			genetics.epoch(genetics.population);
			//Done with this generation
			generation++;
			k = 0;
		} else if (ops < 0) {//Done with current network
			var score = toInt($("#clips").innerHTML);
			if (score > highscore) {
				console.log("Generation " + generation + "." + k + " achieved new highscore of " + score);
				highscore = score;
			}
			genetics.population[k].fitness = score;
			k++;
			networks[k].importWeights(genetics.population[k].weights);
			ops = 5000;
			game.reset();
		} else {//Run current network
			ops--;
			//Pass game board array into the run function
			var chosenAction = networks[k].run(getGameState());
			console.log(chosenAction);
			actions[chosenAction]();
		}

	}, clickRate);
};

function getGameState() {
	return [
		toInt(select("#clips")),
		toInt(select("#funds")),
		toInt(select("#unsoldClips")),
		toInt(select("#avgRev")),
		toInt(select("#avgSales")),
		toInt(select("#adCost")),
		toInt(select("#wire")),
		toInt(select("#wireCost")),
		toInt(select("#clipmakerLevel2")),
		toInt(select("#megaClipperLevel")),
		toInt(select("#clipperCost")),
		toInt(select("#megaClipperCost")),
		toInt(select("#trust")),
		toInt(select("#nextTrust")),
		toInt(select("#processors")),
		toInt(select("#memory")),
		toInt(select("#operations")),
		toInt(select("#creativity")),
		select("#qChip0").css("opacity"),
		select("#qChip1").css("opacity"),
		select("#qChip2").css("opacity"),
		select("#qChip3").css("opacity"),
		select("#qChip4").css("opacity"),
		select("#qChip5").css("opacity"),
		select("#qChip6").css("opacity"),
		select("#qChip7").css("opacity"),
		select("#qChip8").css("opacity"),
		select("#qChip9").css("opacity"),
		parseInt(select("#qCompDisplay").innerHTML.replace("qOps: ", "")),
		toInt(select("#investmentBankroll").innerHTML),
		toInt(select("#secValue").innerHTML),
		toInt(select("#portValue").innerHTML),
		toInt(select("#investmentLevel").innerHTML),
		toInt(select("#investUpgradeCost").innerHTML),
		toInt(select("#yomiDisplay").innerHTML),
		toInt(select("#newTourneyCost").innerHTML),
	];
}

function toInt(input) {
	var ht = input.innerHTML;
	return parseFloat(ht.replace(/,/g, ''));
}

var context = window.parent.frames[0].document;
function select(target){
	var tmep = $(target, window.parent.frames[0].document)[0];
	return tmep;
}