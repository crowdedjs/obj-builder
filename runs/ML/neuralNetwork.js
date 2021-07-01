// ml5.js: Train Your Own Neural Network
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/6.1-ml5-train-your-own.html
// https://youtu.be/8HEgeAbYphA
// https://editor.p5js.org/codingtrain/sketches/zwGahux8a

let model;
let targetLabel;
let trainingData = [];

let state = 'collection';

function setup() {
    let options = {
        inputs: [
            'Nurse',
            'Triage Nurse',
            'Greeter Nurse',
            'Tech',
            'CT',
            'Janitorial',
            'Radiology',
            'Phlebotomist',
            'XRay',
            'Attending',
            'Resident',
            'Pharmacist'
        ],
        outputs: ['TickEstimation'],
        task: 'regression',
        // debug: 'true',
        // learningRate: 0.5
    };
    model = ml5.neuralNetwork(options);
    // model.loadData('mouse-notes.json', dataLoaded());
}

// window.onload = function() {
//     var iframe = document.createElement('iframe')
//     iframe.id = 'iframe'
//     iframe.style.display = 'none'
//     document.body.appendChild(iframe)
//     iframe.src = 'simResults.csv'
//     setTimeout(function() {
//         let text = document.getElementById('iframe').innerHTML;
//         console.log(text);
//     })

    // console.log(data)
// }

function trainNN() {
    let fr = new FileReader();
    const file = document.querySelector('input[type=file]').files[0];
    const preview = document.querySelector('img')

    
    if (file) {
        fr.readAsText(file, "UTF-8");

        fr.addEventListener('load', (evt) => {
            console.log(evt.target.result)
            trainingData = evt.target.result.split('\n')
            training
            console.log(trainingData)
        }, false)
    }
}


function keyPressed() {
    if (key == 't') {
        state = 'training';
        console.log('starting training');
        model.normalizeData();
        let options = {
            epochs: 200
        };
        model.train(options, whileTraining, finishedTraining);
    } else if (key == 's') {
        model.saveData('mouse-notes')
    } else {
        targetLabel = key.toUpperCase();
    }
}

function whileTraining(epoch, loss) {
    console.log(epoch);
}

function finishedTraining() {
    console.log('finished training.');
    state = 'prediction';
}

function gotResults(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    console.log(results);
}
