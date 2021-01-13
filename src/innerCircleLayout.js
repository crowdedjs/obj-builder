import fs from "fs";
import { allocate, generateLabels, visualizeEmpty, checkForHalls, threeHallFill, fourHallFill, lineFill } from "./spacesSharedFunctions.js"
import { makeRoom } from "./room.js";
import flatGenerator from "./flatGenerator.js"

const w = Math.floor(Math.random() * 150) + 51;
const l = Math.floor(Math.random() * 150) + 51;
const defaultSpace = {
    TL:{x:-w/2,y:-l/2},
    BR:{x:w/2,y:l/2}
}

export function innerCircleLayout(filePath = "test", spaceToFill = defaultSpace, hallWidth = 10) {
    fs.writeFileSync(filePath + `.obj`, "mtllib room.mtl\n");
    fs.writeFileSync(filePath + `.mtl`, "\n");

    let emptySpace = [];
    let filledSpace = [];
    
    let vOffset = 0;
    
    emptySpace.push(spaceToFill);

    //Hallways (Top, Left, Right, Bottom, Entry Hall)
    // vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x / 3 -hallWidth,y:spaceToFill.TL.y / 3 -hallWidth},BR:{x:spaceToFill.BR.x / 3 +hallWidth,y:spaceToFill.TL.y / 3},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x,y:spaceToFill.TL.y / 3 -hallWidth},BR:{x:spaceToFill.BR.x,y:spaceToFill.TL.y / 3},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x / 3 -hallWidth,y:spaceToFill.TL.y / 3},BR:{x:spaceToFill.TL.x / 3,y:spaceToFill.BR.y / 3},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.BR.x / 3,y:spaceToFill.TL.y / 3},BR:{x:spaceToFill.BR.x / 3 +hallWidth,y:spaceToFill.BR.y / 3},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    // vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x / 3 -hallWidth,y:spaceToFill.BR.y / 3},BR:{x:spaceToFill.BR.x / 3 +hallWidth,y:spaceToFill.BR.y / 3 +hallWidth},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x,y:spaceToFill.BR.y / 3},BR:{x:spaceToFill.BR.x,y:spaceToFill.BR.y / 3 +hallWidth},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 -hallWidth/2,y:spaceToFill.BR.y / 3 +hallWidth},BR:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 +hallWidth/2,y:spaceToFill.BR.y},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
   
    emptySpace.length = 0;
    //center
    emptySpace.push({TL:{x:spaceToFill.TL.x / 3,y:spaceToFill.TL.y / 3},BR:{x:spaceToFill.BR.x / 3,y:spaceToFill.BR.y / 3},isRoom:false});

    //add sides back in (Top, Mid-Left, Mid-Right, Bot-Left, Bot-Right)
    emptySpace.push({TL:{x:spaceToFill.TL.x,y:spaceToFill.TL.y},BR:{x:spaceToFill.BR.x,y:spaceToFill.TL.y / 3 -hallWidth},isRoom:false});
    emptySpace.push({TL:{x:spaceToFill.TL.x,y:spaceToFill.TL.y / 3},BR:{x:spaceToFill.TL.x / 3 -hallWidth,y:spaceToFill.BR.y / 3},isRoom:false});
    emptySpace.push({TL:{x:spaceToFill.BR.x / 3 +hallWidth,y:spaceToFill.TL.y / 3},BR:{x:spaceToFill.BR.x,y:spaceToFill.BR.y / 3},isRoom:false});
    emptySpace.push({TL:{x:spaceToFill.TL.x,y:spaceToFill.BR.y / 3 +hallWidth},BR:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 -hallWidth/2,y:spaceToFill.BR.y},isRoom:false});
    emptySpace.push({TL:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 +hallWidth/2,y:spaceToFill.BR.y / 3 +hallWidth},BR:{x:spaceToFill.BR.x,y:spaceToFill.BR.y},isRoom:false});

    // vOffset = visualizeEmpty(emptySpace, filePath, vOffset, 30)

    for (let i = 0; i < emptySpace.length; i++) {
        let halls = checkForHalls(filledSpace, emptySpace[i]);
        let hallCount = halls[0] + halls[1] + halls[2] + halls[3];
        console.log(hallCount)
        switch (hallCount) {
            case 0:
                vOffset = basicFill(filePath, [emptySpace[i]], filledSpace, vOffset);
                break;
            case 1:
            case 2:
                vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset);
                break;
            case 3:
                vOffset = threeHallFill(filePath, [emptySpace[i]], filledSpace, vOffset, halls);
                break;
            case 4:
                vOffset = fourHallFill(filePath, [emptySpace[i]], filledSpace, vOffset);
                break;
            default:
                console.log("Error! Abnormal number of adjacent halls.")
        }
    }

    //Generate Outer Wall
    vOffset = makeRoom(
        spaceToFill.BR.x - spaceToFill.TL.x, spaceToFill.BR.y - spaceToFill.TL.y, 2,
        [0,0,5,0], "./" + filePath,
        (spaceToFill.BR.x + spaceToFill.TL.x) / 2, (spaceToFill.BR.y + spaceToFill.TL.y) / 2, 0, vOffset
    );

    //Generate Outside Of Building
    vOffset = flatGenerator(spaceToFill.BR.x - spaceToFill.TL.x + 30, spaceToFill.BR.y - spaceToFill.TL.y + 30,
        "./" + filePath, {},
        (spaceToFill.BR.x + spaceToFill.TL.x) / 2, (spaceToFill.BR.y + spaceToFill.TL.y) / 2, 0, vOffset
    );

    generateLabels(filledSpace, filePath);
}
