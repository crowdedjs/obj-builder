import fs from "fs";
import { allocate, basicFill, lineFill, generateLabels, visualizeEmpty, checkForHalls, threeHallFill, fourHallFill } from "./spacesSharedFunctions.js"
import { makeRoom } from "./room.js";
import flatGenerator from "./flatGenerator.js";
import { makeWalls } from "./outerWalls.js";

const w = Math.floor(Math.random() * 150) + 51;
const l = Math.floor(Math.random() * 150) + 51;
const defaultSpace = {
    TL:{x:-w/2,y:-l/2},
    BR:{x:w/2,y:l/2}
}

export function HLayout(filePath = "test", spaceToFill = defaultSpace, hallWidth = 6, doorSize = 3) {
    fs.writeFileSync(filePath + `.obj`, "mtllib room.mtl\n");
    fs.writeFileSync(filePath + `.mtl`, "\n");

    let emptySpace = [];
    let filledSpace = [];
    
    let vOffset = 0;
    emptySpace.push(spaceToFill);
    
    //Hallways
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x / 3 -hallWidth,y:spaceToFill.TL.y / 3 -hallWidth},BR:{x:spaceToFill.BR.x / 3 +hallWidth,y:spaceToFill.BR.y / 3 +hallWidth},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);    
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x / 3 -hallWidth,y:spaceToFill.TL.y},BR:{x:spaceToFill.TL.x / 3,y:spaceToFill.BR.y},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.BR.x / 3,y:spaceToFill.TL.y},BR:{x:spaceToFill.BR.x / 3 +hallWidth,y:spaceToFill.BR.y},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    
    
    emptySpace.length = 0;

    let innerSpace = {TL:{x:spaceToFill.TL.x / 3,y:spaceToFill.TL.y / 3},BR:{x:spaceToFill.BR.x / 3,y:spaceToFill.BR.y / 3},isRoom:false};
    
    //add sides back in
    emptySpace.push({TL:{x:spaceToFill.TL.x,y:spaceToFill.TL.y},BR:{x:spaceToFill.TL.x / 3 -hallWidth,y:spaceToFill.BR.y},isRoom:false});
    emptySpace.push({TL:{x:innerSpace.TL.x,y:spaceToFill.TL.y},BR:{x:innerSpace.BR.x,y:spaceToFill.TL.y / 3 -hallWidth},isRoom:false});
    emptySpace.push({TL:{x:innerSpace.TL.x,y:spaceToFill.BR.y / 3 +hallWidth},BR:{x:innerSpace.BR.x,y:spaceToFill.BR.y},isRoom:false});
    emptySpace.push({TL:{x:spaceToFill.BR.x / 3 +hallWidth,y:spaceToFill.TL.y},BR:{x:spaceToFill.BR.x,y:spaceToFill.BR.y},isRoom:false});
    
    //For each empty space, test the number of hall connections.  Use this to decide how to fill the space.

    for (let i = 0; i < emptySpace.length; i++) {
        let halls = checkForHalls(filledSpace, emptySpace[i]);
        let hallCount = halls[0] + halls[1] + halls[2] + halls[3];
        switch (hallCount) {
            case 0:
                vOffset = basicFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize);
                break;
            case 1:
            case 2:
                vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize);
                break;
            case 3:
                vOffset = threeHallFill(filePath, [emptySpace[i]], filledSpace, vOffset, halls, doorSize);
                break;
            case 4:
                vOffset = fourHallFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize);
                break;
            default:
                console.log("Error! Abnormal number of adjacent halls.")
        }
    }

    let width = spaceToFill.BR.x - spaceToFill.TL.x;
    let length = spaceToFill.BR.y - spaceToFill.TL.y;
    //Generate Outer Wall
    vOffset = makeWalls(
        width, length, doorSize,
        [[width/3 - hallWidth, width/3, width/3 - hallWidth],
        [length],[width/3 - hallWidth, width/3, width/3 - hallWidth],[length]],
        hallWidth, "./" + filePath,
        (spaceToFill.BR.x + spaceToFill.TL.x) / 2, (spaceToFill.BR.y + spaceToFill.TL.y) / 2, 0, vOffset
    );

    //Generate Outside Of Building
    vOffset = flatGenerator(width + 30, length + 30,
        "./" + filePath, {},
        (spaceToFill.BR.x + spaceToFill.TL.x) / 2, (spaceToFill.BR.y + spaceToFill.TL.y) / 2, 0, vOffset
    );

    generateLabels(filledSpace, filePath);
}
