import fs from "fs";
import {Worker} from "worker_threads"


//How many sims do we want to run at a time?
const groupSize = 20;
//How many staff configurations do we want to train the neural network on?
const trainingSamples = groupSize * 20;
let arrivalsDone = [];
let activeWorkers = [];
let vectors = [];
let count = 0;


vectors = fs.readFileSync("vectors.csv", "utf-8").split("\n")
runData();


function runData() {
    for (let i = 0; i < groupSize; i++) {
        arrivalsDone.push(runCrowdSim(count, vectors.shift()));
        count++;
    }
}

function runCrowdSim(workerData, vector) {
    return new Promise((resolve, reject) => {
        const worker = new Worker("../../../node/index.js", { workerData });
        activeWorkers.push([workerData, worker])
        worker.on('message', data => {
            activeWorkers = activeWorkers.filter(w => w[0] != workerData)
            fs.appendFileSync("simResults2.csv", `${data.layoutNum},${data.endTick},${vector.toString()}\n`)
            if (arrivalsDone.length < trainingSamples) {
                arrivalsDone.push(runCrowdSim(count, vectors.shift()));
                count++;
            }
            resolve(data)
        })
        worker.on('error', data => {
            console.log(workerData + ": " + data)
            fs.appendFileSync("simResults2.csv", `${data.layoutNum},${data.endTick},${vector.toString()}\n`)
            if (arrivalsDone.length < trainingSamples) {
                arrivalsDone.push(runCrowdSim(count, vectors.shift()));
                count++;
            }
            resolve(data)
        })
        // worker.on('exit', data => {
        //     activeWorkers = activeWorkers.filter(w => w[0] != workerData)
        //     fs.appendFileSync("simResults.csv", `${data.layoutNum},${data.endTick},${vector.toString()}\n`)
        //     if (arrivalsDone.length < trainingSamples - groupSize) {
        //         arrivalsDone.push(runCrowdSim(count, vectors.shift()));
        //         count++;
        //     }
        //     resolve({
        //         layoutNum: workerData + 1,
        //         endTick: Infinity
        //     })
        // })
    })
}
