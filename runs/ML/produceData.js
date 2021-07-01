import fs from 'fs';


//Below searchSpace are for generation of staff
const searchSpace = [
    { name: "Nurse",      type: "Nurse",         min: 1, max: 3 },
    { name: "Nurse",      type: "Triage Nurse",  min: 1, max: 3 },
    { name: "Nurse",      type: "Greeter Nurse", min: 1, max: 1 }, //only one
    { name: "Tech",       type: "Tech",          min: 1, max: 3 },
    { name: "Tech",       type: "CT",            min: 1, max: 2 },
    { name: "Tech",       type: "Janitorial",    min: 1, max: 1 }, //only one for now
    { name: "Tech",       type: "Radiology",     min: 1, max: 1 }, //only one
    { name: "Tech",       type: "Phlebotomist",  min: 1, max: 3 },
    { name: "Tech",       type: "XRay",          min: 1, max: 3 },
    { name: "Attending",  type: "Attending",     min: 1, max: 3 },
    { name: "Resident",   type: "Resident",      min: 1, max: 3 },
    { name: "Pharmacist", type: "Pharmacist",    min: 1, max: 1 }, //only one for now
]
const patientData = fs.readFileSync("./patientData.txt", "utf-8")
const filePath = "./dataset/arrivals/"

//How many sims do we want to run at a time?
const groupSize = 20;
//How many staff configurations do we want to train the neural network on?
const trainingSamples = groupSize * 20;
let vectors = [];
let idRegEx = new RegExp(/X[0-9]+/g)

fs.writeFileSync("vectors.csv", "")

genData(0)


vectors.forEach(v => {
    v.forEach(v2 => {
        fs.appendFileSync("vectors.csv", v2.toString() + "\n")
    })
})



function genData(count) {
    let finishData = [];
    vectors.push([])
    for (let i = 1; i <= groupSize; i++) {
        let v = randomVector();
        vectors[count].push(v)
        makeStaff(count * 20 + i, v)
    }

    count++
    if (count * groupSize < trainingSamples)
        genData(count)
}

function randomVector() {
    let newVector = [];
    for (let i = 0; i < searchSpace.length; i++) {
        newVector.push(Math.random());
    }
    return newVector;
}

function makeStaff(count, vector) {
    fs.writeFileSync(filePath + count + "arrivals.js", "export default [\n");
    
    vector.forEach((val, i) => {
        vector[i] = Math.floor(val * (searchSpace[i].max - searchSpace[i].min + 1)) + searchSpace[i].min
    })
    
    let id = 0;
    searchSpace.forEach((nameType, i) => {
        let name = nameType.name;
        let type = nameType.type;
        let arrivalLocation = "Main Entrance";
        let arrivalTick = 0;
        for (let j = 0; j < vector[i]; j++) {
            fs.appendFileSync(filePath + count + "arrivals.js", `\t{\n\t\t"name": "${name}",\n\t\t"type": "${type}",\n\t\t"arrivalLocation": "${arrivalLocation}",\n\t\t"arrivalTick": ${arrivalTick},\n\t\t"id": ${id}\n\t},\n`)
            id++;
        }
    })
    let newData = patientData;
    let replaceArr = patientData.match(idRegEx)
    replaceArr.forEach(patientID => {
        newData = newData.replace(patientID, id++)
    })

    fs.appendFileSync(filePath + count + "arrivals.js", newData);
}
