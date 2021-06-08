import { innerCircleLayout } from "./FloorPlans/innerCircleLayout.js";
import fs from 'fs';
import fse from 'fs-extra';
import {Worker} from "worker_threads"
import { improvedERLayout } from "./FloorPlans/improvedERLayout.js";


//Below search space is for the innerCircleLayout
    // const searchSpace = [
    //     {name:"HALL_WIDTH", min:3, max:13},
    //     {name:"DOOR_SIZE", min:3, max:8},
    //     {name:"BUILDING_WIDTH", min:100, max:200},
    //     {name:"BUILDING_LENGTH", min:100, max:200},
    //     {name:"MID_RATIO", min:0.3, max:0.6},
    //     {name:"MAX_ROOM_SIZE", min:10, max:20},
    //     {name:"LABEL_VAL", min:0, max:1}
    // ];

//Below search space is for the improvedERLayout
const searchSpace = [
    {name:"BUILDING_WIDTH", min:100, max:200},
    {name:"BUILDING_LENGTH", min:100, max:200},
    {name:"MAX_ROOM_SIZE", min:5, max:9},
    {name:"LABEL_VAL", min:0, max:1}
]

const populationLength = 20;
const iterations = 1000;
const numToKeep = 5;
let iteration = 0;



fs.writeFileSync("../runs/ga/best.txt", "");
fs.writeFileSync("../runs/ga/best.csv", "Hall Width, Door Size, Building Width, Building Length, Mid-Ratio, Max Room Size, Label Value\n");
fs.writeFileSync("../runs/ga/ticks.csv", "Generation,Best,Average\n");

let population = [];
let fitness = [];
let activeWorkers = [];
genAlgLoop();

function genAlgLoop() {
    iteration++;
    if (iteration == 1) {
        console.log("\n\n~~~~~~~BEGINNING GENERATION " + iteration + "~~~~~~~");
        fs.appendFileSync("../runs/ga/best.txt", "\n\nBEST OF GEN " + iteration + "\n");
        population = initPopulation();
        generateBuildings();
    } else if (iteration <= iterations) {
        console.log("\n\n~~~~~~~BEGINNING GENERATION " + iteration + "~~~~~~~");
        fs.appendFileSync("../runs/ga/best.txt", "\n\nBEST OF GEN " + iteration + "\n");
        population = repopulate()
        generateBuildings();
    }
}


function initPopulation() {
    console.log("initPopulation")
    let population = [];
    for (let i = 0; i < populationLength; i++) {
        population.push(randomVector());
    }
    return population;
}

function repopulate() {
    console.log("repopulate")
    fs.appendFileSync("../runs/ga/best.txt", printStats(population[0]));
    fs.appendFileSync("../runs/ga/best.csv", toCSV(population[0]));
    fse.emptyDirSync("../assets/locations");
    fse.emptyDirSync("../assets/objs");
    
    let newPopulation = [];
    newPopulation.push(population[0]);
    for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
            newPopulation.push(crossover(population[i], population[j], newPopulation))
        }
        newPopulation.push(mutate(population[i], newPopulation))
    }

    for (let i = newPopulation.length; i < populationLength; i++) {
        newPopulation.push(randomVector());
    }

    return newPopulation;
}

function generateBuildings() {
    console.log("generateBuildings")
    let count = 1;
    fitness.length = 0;
    population.forEach(vector => {
        // innerCircleLayout(
        improvedERLayout(
            // `../../node/node_modules/@crowdedjs/assets/`,
            `../assets/`,
            vector[0] * (searchSpace[0].max - searchSpace[0].min) + searchSpace[0].min,
            vector[1] * (searchSpace[1].max - searchSpace[1].min) + searchSpace[1].min,
            vector[2] * (searchSpace[2].max - searchSpace[2].min) + searchSpace[2].min,
            // vector[3] * (searchSpace[3].max - searchSpace[3].min) + searchSpace[3].min,
            // vector[4] * (searchSpace[4].max - searchSpace[4].min) + searchSpace[4].min,
            // vector[5] * (searchSpace[5].max - searchSpace[5].min) + searchSpace[5].min,
            // vector[6] * (searchSpace[6].max - searchSpace[6].min) + searchSpace[6].min,
            count
        );
        count++;
    });

    console.log("runSim")
    for (let i = 0; i < populationLength; i++) {
        fitness.push(runCrowdSim(i))
        // fitness.push(runDiscreteEventSim(i))
    }

    Promise.all(fitness)
    .then(results => {
        fitness = results;
        console.log(fitness)
        evalFitness()
    })
}

function evalFitness() {
    console.log("evalFitness")
    let bestResult = Infinity;
    let avgResult = 0;

    for (let i = 0; i < populationLength; i++) {
        if (fitness[i].endTick < bestResult)
            bestResult = fitness[i].endTick;
        avgResult += fitness[i].endTick;
    }

    fs.appendFileSync("../runs/ga/ticks.csv", `${iteration},${bestResult},${avgResult/populationLength}\n`);

    let fitnessVals = [];

    for (let i = 0; i < populationLength; i++) {
        fitnessVals.push([
           bestResult / fitness[i].endTick, i
        ])
    }
    console.log(fitnessVals)
    removeLeastFit(fitnessVals)
}

function removeLeastFit(fitnessVals) {
    console.log("removeLeastFit")
    fitnessVals.sort((a, b) => b[0] - a[0])
    let newPopulation = []
    
    for (let i = 0; i < numToKeep; i++)
    {
        newPopulation.push(population[fitnessVals[i][1]])
    }
    fs.copyFileSync("../assets/objs/_" + (fitnessVals[0][1] + 1) + "layout.obj", "../runs/ga/best/bestGen" + iteration + "Obj.obj")
    fs.copyFileSync("../assets/locations/_" + (fitnessVals[0][1] + 1) + "locations.js", "../runs/ga/best/bestGen" + iteration + "Loc.js")
    population = newPopulation;
    genAlgLoop();
}

function runCrowdSim(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker("../../node/index.js", { workerData });
        activeWorkers.push([workerData, worker])
        worker.on('message', data => {
            activeWorkers = activeWorkers.filter(w => w[0] != workerData)
            resolve(data)
            if (activeWorkers.length <= populationLength - numToKeep) {
                activeWorkers.forEach(w => {
                    w[1].terminate();
                })
                activeWorkers = [];
            }
        })
        worker.on('error', data => {
            console.log("hey we found an error! Workerdata: " + workerData)
            resolve(data)
        })
        worker.on('exit', data => {
            activeWorkers = activeWorkers.filter(w => w[0] != workerData)
            resolve({
                layoutNum: workerData + 1,
                endTick: Infinity
            })
        })
    })
}

function runDiscreteEventSim(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker("./discreteEventSim.js", { workerData });
        worker.on('message', data => {
            resolve(data)
        })
    })
}

function randomVector() {
    let newVector = [];
    for (let i = 0; i < searchSpace.length; i++) {
        newVector.push(Math.random());
    }
    return newVector;
}

function crossover(parentA, parentB, pop) {
    let totalDifference = 0;
    for (let j = 0; j < searchSpace.length; j++) {
        totalDifference += Math.abs(parentA[j] - parentB[j]);
    }
    //the vectors are "different enough"
    if (totalDifference / searchSpace.length >= (0.1*Math.exp(-0.1*iteration))) {
        let newVector = [];
        for (let i = 0; i < searchSpace.length; i++) {
            if (Math.floor(Math.random()*2))
                newVector.push(parentA[i])
            else
                newVector.push(parentB[i])
        }
        return newVector;
    }
    return mutate(parentB, pop);
}


function mutate(vector, pop) {
    do {
        vector[Math.floor(Math.random() * searchSpace.length)] = Math.random();
    } while (checkSimilarity(vector, pop))
    return vector;
}

function checkSimilarity(vector, pop) {
    for (let i = 0; i < pop.length; i++) {
        let totalDifference = 0;
        for (let j = 0; j < searchSpace.length; j++) {
            totalDifference += Math.abs(vector[j] - pop[i][j]);
        }
        //the vectors are "different enough"
        if (totalDifference / searchSpace.length >= (0.2*Math.exp(-0.1*iteration)) || pop.length == 1)
            return false;
    }
    return true
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
