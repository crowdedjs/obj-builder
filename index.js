import { fillSpaceWithRooms } from "./src/fillSpaceWithRooms.js";
import { innerCircleLayout } from "./src/innerCircleLayout.js";
import flatGenerator from "./src/flatGenerator.js"
import wallGenerator from "./src/wallGenerator.js"
import { HLayout } from "./src/HLayout.js";
import { YLayout } from "./src/YLayout.js";
import { XLayout } from "./src/XLayout.js";
import { demo } from "./src/Demo.js";


let hallWidth = 3;
let w = 100;
let l = 100;
let midRatio = 3/4;
let randAngles = randomAngles();


// fillSpaceWithRooms("./runs/BasicFilledSpace");
// innerCircleLayout("./runs/InnerCircle");
// HLayout("./runs/HLayout");
YLayout("./runs/YLayout", undefined, [0, randAngles[0], randAngles[1]], undefined);
// YLayout("./runs/YLayout", undefined, undefined, undefined);
// XLayout("./runs/XLayout");
// demo("./runs/demo");


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