import { innerCircleLayout } from "./innerCircleLayout.js";
import fs from 'fs';
import fse from 'fs-extra';
// import startup from "../../node/index.js"
import child_process from "child_process"


const searchSpace = [
    {name:"HALL_WIDTH", min:3, max:13},
    {name:"DOOR_SIZE", min:3, max:8},
    {name:"BUILDING_WIDTH", min:100, max:200},
    {name:"BUILDING_LENGTH", min:100, max:200},
    {name:"MID_RATIO", min:0.3, max:0.6},
    {name:"MAX_ROOM_SIZE", min:10, max:20}
];
const populationLength = 25;
const iterations = 1000;
const mutationRate = 0.2;



fs.writeFileSync("../runs/ga/best.txt", "");
fs.writeFileSync("../runs/ga/best.csv", "Hall Width,Door Size, Building Width, Building Length, Mid-Ratio, Max Room Size\n");

console.log("\n\n~~~~~~~BEGINNING GENERATION 1~~~~~~~");
let nextPop = genAlgLoop(initPopulation(), 1);
for (let i = 2; i <= iterations; i++) {
    console.log("\n\n~~~~~~~BEGINNING GENERATION " + i + "~~~~~~~");
    fs.appendFileSync("../runs/ga/best.txt", "\n\nBEST OF GEN " + i + "\n");
    nextPop = genAlgLoop(repopulate(nextPop), i)
}


function genAlgLoop(population, iteration) {
    let fitness = generateBuildings(population);
    return removeLeastFit(evalFitness(population, fitness), population, iteration);
}

function initPopulation() {
    let population = [];
    for (let i = 0; i < populationLength; i++) {
        population.push(randomVector());
    }
    return population;
}

function repopulate(population) {
    fs.appendFileSync("../runs/ga/best.txt", printStats(population[0]));
    fs.appendFileSync("../runs/ga/best.csv", toCSV(population[0]));
    fse.emptyDirSync("../runs/ga/thisGeneration");
    
    let newPopulation = [];
    newPopulation.push(population[0]);
    for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
            newPopulation.push(crossover(population[i], population[j]))
        }
        newPopulation.push(mutate(population[i]))
    }

    for (let i = newPopulation.length; i < populationLength; i++) {
        newPopulation.push(randomVector());
    }

    return newPopulation;
}

function generateBuildings(population) {
    let count = 1;
    let fitness = [];
    population.forEach(vector => {
        innerCircleLayout(
            "../../node/node_modules/@crowdedjs/assets/",
            vector[0] * (searchSpace[0].max - searchSpace[0].min) + searchSpace[0].min,
            vector[1] * (searchSpace[1].max - searchSpace[1].min) + searchSpace[1].min,
            vector[2] * (searchSpace[2].max - searchSpace[2].min) + searchSpace[2].min,
            vector[3] * (searchSpace[3].max - searchSpace[3].min) + searchSpace[3].min,
            vector[4] * (searchSpace[4].max - searchSpace[4].min) + searchSpace[4].min,
            vector[5] * (searchSpace[5].max - searchSpace[5].min) + searchSpace[5].min
        );
        console.log("Beginning Layout #" + count)
        let result = parseInt(child_process.execSync("node ../../node/index.js").toString());
        console.log("   > " + result)

        fitness.push(result)
        count++;
    });
    return fitness;
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

function mutate(vector) {
    for (let i = 0; i < searchSpace.length; i++) {
        if (Math.random() < mutationRate)
            vector[i] = Math.random();
    }
    return vector;
}

function removeLeastFit(fitnessVals, population, iteration, numToKeep = 5) {
    fitnessVals.sort((a, b) => b[0] - a[0])
    let newPopulation = []
    
    for (let i = 0; i < fitnessVals.length; i++)
    {
        if (i < numToKeep)
            newPopulation.push(population[fitnessVals[i][1]])
    }
    // fs.copyFileSync("../runs/ga/thisGeneration/a" + (fitnessVals[0][1] + 1) + ".obj", "../runs/ga/best/bestGen" + iteration + ".obj")
    return newPopulation;
}

function evalFitness(population, fitness) {
    let bestResult = Infinity;
    let runtimeResults = fitness;

    for (let i = 0; i < population.length; i++) {
        if (runtimeResults[i] < bestResult)
            bestResult = runtimeResults[i];
    };

    let fitnessVals = [];

    for (let i = 0; i < population.length; i++) {
        fitnessVals.push([
           bestResult / runtimeResults[i], i
        ])
    }
    
    return fitnessVals;
}

function printStats(vector) {
    let toPrint = "";
    for (let i = 0; i < searchSpace.length; i++) {
        toPrint += "> " + searchSpace[i].name + ": " + (vector[i] * (searchSpace[i].max - searchSpace[i].min) + searchSpace[i].min) + "\n";
    }
    return toPrint;
}

function toCSV(vector) {
    let line = "";
    for (let i = 0; i < searchSpace.length; i++) {
        line += (vector[i] * (searchSpace[i].max - searchSpace[i].min) + searchSpace[i].min) + ",";
    }
    line += "\n";
    return line;
}
