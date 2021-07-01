let model;
let targetLabel;
let trainingData = [];

let state = 'collection';

function setup() {
    let options = {
        inputs: [
            'Nurse',
            'TriageNurse',
            // 'GreeterNurse',
            'Tech',
            'CT',
            // 'Janitorial',
            // 'Radiology',
            'Phlebotomist',
            'XRay',
            'Attending',
            'Resident',
            // 'Pharmacist'
        ],
        outputs: ['TickEstimation'],
        task: 'regression',
        debug: 'true',
    };
    model = ml5.neuralNetwork(options);
    // model.loadData('mouse-notes.json', dataLoaded());
}


function trainNN() {
    let fr = new FileReader();
    const file = document.querySelector('input[type=file]').files[0];


    if (file) {
        fr.readAsText(file, "UTF-8");

        fr.addEventListener('load', (evt) => {
            let temp = evt.target.result.split('\n')
            temp.forEach(vector => {
                let temp2 = vector.split(',')
                temp2.forEach((data, i) => {
                    temp2[i] = parseInt(data)
                })
                trainingData.push(temp2)
            });
    
            trainingData.forEach(line => {
                let target = {
                    TickEstimation: line[1]
                };
                // let inputs = {
                //     Nurse: line[2],
                //     TriageNurse: line[3],
                //     GreeterNurse: line[4],
                //     Tech: line[5],
                //     CT: line[6],
                //     Janitorial: line[7],
                //     Radiology: line[8],
                //     Phlebotomist: line[9],
                //     XRay: line[10],
                //     Attending: line[11],
                //     Resident: line[12],
                //     Pharmacist: line[13]
                // }
                let inputs = {
                    Nurse: line[2],
                    TriageNurse: line[3],
                    Tech: line[4],
                    CT: line[5],
                    Phlebotomist: line[6],
                    XRay: line[7],
                    Attending: line[8],
                    Resident: line[9],
                }
                model.addData(inputs, target);
            })
            model.normalizeData();
            console.log(model)
            let options = {
                epochs: 50,
                batchSize: 10
            };
            model.train(options, whileTraining, finishedTraining);
        }, false)
    }
}

function whileTraining(epoch, loss) {
    // console.log(epoch);
}

function finishedTraining() {
    console.log('finished training.');
    state = 'prediction';
    console.log(model)
}

function processQuery() {
    let queryVector = [];
    queryVector.push(document.getElementById("nurse").value);
    queryVector.push(document.getElementById("triage").value);
    // queryVector.push(document.getElementById("greeter").value);
    queryVector.push(document.getElementById("tech").value);
    queryVector.push(document.getElementById("ct").value);
    // queryVector.push(document.getElementById("janitorial").value);
    // queryVector.push(document.getElementById("radiology").value);
    queryVector.push(document.getElementById("phlebotomist").value);
    queryVector.push(document.getElementById("xray").value);
    queryVector.push(document.getElementById("attending").value);
    queryVector.push(document.getElementById("resident").value);
    // queryVector.push(document.getElementById("pharmacist").value);
    
    model.predict(queryVector, (err, results) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(results[0].value)
        alert(results[0].value)
    })
}
