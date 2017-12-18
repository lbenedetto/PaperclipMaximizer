var popSize = 20;

// Create an array to hold the population of networks
var networks = [];

// Populate the networks array
for (var i = 0; i < popSize; i++) {
	networks.push(new Brainwave.Network(4, 1, 1, 4));
}

// Next we need to create the Genetics object that will evolve the networks for us
var genetics = new Brainwave.Genetics(popSize, networks[0].getNumWeights());

var generation = 0;
var ops = 5000;
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
		genetics.population[k].fitness = fitness();
		k++;
		networks[k].importWeights(genetics.population[k].weights);
		ops = 5000;
		resetGame();
	} else {//Run current network
		ops--;
		//Pass game board array into the run function
		var targetButtonId = networks[k].run([1, 4, 6, 2]);
		//TODO: Click button
	}

});

function resetGame() {
	//Reset all game variables to give the next network a try
}

function fitness() {
	//Get the fitness of the current game state
}