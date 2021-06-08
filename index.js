import {improvedERLayout} from "./src/FloorPlans/improvedERLayout.js"


let hallWidth = 3;
let w = 100;
let l = 100;
let midRatio = 3/4;
// let randAngles = randomAngles();

for (let i = 0; i < 1000; i++) {
    console.log(i)
    improvedERLayout("src/FloorPlans/improvedER/", 100, 100, 13, 1, "")
}


function randomAngles() {
    let angleA, angleB;
    do {
        angleA = Math.random() *  Math.PI/3 + Math.PI/3;
        angleB = Math.random() *  Math.PI/3 + Math.PI/3 + angleA;
    } while (angleB < Math.PI);

    console.log(" > Angle 1:" + angleA)
    console.log(" > Angle 2:" + angleB)
    return [angleA, angleB]
}