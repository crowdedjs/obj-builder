import { innerCircleLayout } from "./innerCircleLayout.js";
import fs from 'fs';
import readline from 'readline';




// innerCircleLayout("./runs/InnerCircle", hallWidth, w, l);

//The space we are searching:
    //HALL_WIDTH : Min 3, Max 20
    //BUILDING_WIDTH : Min 80, Max 200
    //BUILDING_LENGTH : Min 80, Max 200
    //MID_RATIO : Min 0.3 Max 0.6
        //I think we should have more, such as 
    //or booleans that control whether those side halls spawn
    //or a maximum room size (an edit to the "15" value in fillProcessing)
const searchSpace = [
    {name:"HALL_WIDTH", min:3, max:13},
    // We could have door size
    {name:"BUILDING_WIDTH", min:90, max:150},
    {name:"BUILDING_LENGTH", min:90, max:150},
    {name:"MID_RATIO", min:0.3, max:0.6}
];
const populationLength = 18;
const iterations = 100;


let nextPop = genAlgLoop(initPopulation(), 1);
for (let i = 2; i <= iterations; i++) {
    nextPop = genAlgLoop(repopulate(nextPop), i)
}


function genAlgLoop(population, iteration) {
    generateBuildings(population);
    return removeLeastFit(evalFitness(population), population, iteration);
}

function initPopulation() {
    let population = [];
    for (let i = 0; i < populationLength; i++) {
        population.push(randomVector());
    }
    return population;
}

function repopulate(population) {
    let newPopulation = [];
    for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
            newPopulation.push(crossover(population[i], population[j]))
        }
        newPopulation.push(mutate(population[i], 0.05))
    }

    for (let i = newPopulation.length; i < populationLength; i++) {
        newPopulation.push(randomVector());
    }

    return newPopulation;
}

function generateBuildings(population) {
    let count = 1;
    population.forEach(buildingVector => {
        console.log("\nBeginning " + count + "\n");
        innerCircleLayout(
            "../runs/ga/thisGeneration/a" + count,
            buildingVector[0] * (searchSpace[0].max - searchSpace[0].min) + searchSpace[0].min,
            buildingVector[1] * (searchSpace[1].max - searchSpace[1].min) + searchSpace[1].min,
            buildingVector[2] * (searchSpace[2].max - searchSpace[2].min) + searchSpace[2].min,
            buildingVector[3] * (searchSpace[3].max - searchSpace[3].min) + searchSpace[3].min
        );
        count++;
    });
}

function randomVector() {
    let newVector = [];
    for (let i = 0; i < searchSpace.length; i++) {
        newVector.push(Math.random());
    }
    return newVector;
}

function crossover(parentA, parentB) {
    let newVector = [];
    for (let i = 0; i < searchSpace.length; i++) {
        if (Math.floor(Math.random()*2))
            newVector.push(parentA[i])
        else
            newVector.push(parentB[i])

    }
    return newVector;
}

function mutate(vector, mutationOdds) {
    for (let i = 0; i < searchSpace.length; i++) {
        if (Math.random() < mutationOdds)
            vector[i] = Math.random();
    }
    return vector;
}

function removeLeastFit(fitnessVals, population, iteration, numToRemove = populationLength-5) {
    //sort
    fitnessVals.sort((a, b) => b[0] - a[0])
    let newPopulation = []
    
    for (let i = 0; i < fitnessVals.length; i++)
    {
        if (i >= numToRemove)
            newPopulation.push(population[i])
    }
    fs.copyFileSync("../runs/ga/thisGeneration/a" + (fitnessVals[0][1] + 1) + ".obj", "../runs/ga/best/bestGen" + iteration + ".obj")
    return newPopulation;
}

function evalFitness(population) {
    //IN DEVELOPMENT. IDEAS:
    //we could measure the distance between important points
        //That would be keeping in mind that the most crucial, lifesaving travel distances should be weighted
        //More commonly traveled distances should also be weighted
    //hall width needs to be evaluated.  This would be easier to do in our simulation, but it would take SO long.
        //Probably what we need is a heuristic.
    //we could get a room count.  We need to make sure that the algorithm doesn't favor tiny ERs.


    //REALLY BASIC HEURISTIC
    let bestHeuristics = [0,0]
    let roomHeuristics = []
    let hallHeuristics = []

    for (let i = 0; i < population.length; i++) {
        roomHeuristics.push(roomHeuristic("../runs/ga/thisGeneration/a" + (i+1) + "Labels.json"));
        hallHeuristics.push(hallHeuristic(population, i));

        if (roomHeuristics[i] > bestHeuristics[0])
            bestHeuristics[0] = roomHeuristics[i];
        if (hallHeuristics[i] > bestHeuristics[1])
            bestHeuristics[1] = hallHeuristics[i];
    };

    let fitnessVals = [];

    for (let i = 0; i < population.length; i++) {
        fitnessVals.push([
            (
                roomHeuristics[i] +
                hallHeuristics[i]
            ) / (
                bestHeuristics[0] +
                bestHeuristics[1]
            ), i
        ])
    }
    
    return fitnessVals;
}

function roomHeuristic(filePath) {
    //we use a heuristic to save time.  The size of the json file should be proportional to the number of rooms.
    const stats = fs.statSync(filePath)
    return stats.size;
}

function hallHeuristic(population, vectorNum) {
    let hallValue = population[vectorNum][0] * (searchSpace[0].max - searchSpace[0].min) + searchSpace[0].min;
    let hallCutoff = 6;
    return hallValue < hallCutoff ? population[vectorNum][0] : hallCutoff / hallValue;
}
