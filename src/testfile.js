import {Worker} from "worker_threads"

const numberOfLayouts = 5

let result = [];

for (let i = 0; i < numberOfLayouts; i++) {
    result.push(runProg(i))
}

//alternative: Promise.any (when anything is finished)
Promise.all(result)
.then(results => {
    console.log(results)
    //try to put a function call in here
})

function runProg(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker("../../node/index.js", { workerData });
        worker.on('message', data => {
            console.log(data)
            resolve(data)
        })
    })
}

console.log(result)