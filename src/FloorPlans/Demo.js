import fs from "fs";
import { allocate, basicFill, lineFill, generateLabels, visualizeEmpty, checkForHalls, threeHallFill, fourHallFill } from "../spacesSharedFunctions.js"
import flatGenerator from "../flatGenerator.js";
import { makeWalls } from "../outerWalls.js";

export function demo(filePath = "test", hallWidth = 6, hallLength = 30, doorSize = 3) {
    fs.writeFileSync(filePath + `.obj`, "mtllib room.mtl\n");
    fs.writeFileSync(filePath + `.mtl`, "\n");

    let emptySpace = [];
    let filledSpace = [];
    
    let vOffset = 0;

    //Hallways
    emptySpace.push({TL:{x:-hallWidth/2,y:-hallLength/2},BR:{x:hallWidth/2,y:hallLength/2},isRoom:false});
    vOffset = allocate(filePath, {TL:{x:-hallWidth/2,y:-hallLength/2},BR:{x:hallWidth/2,y:hallLength/2},isRoom:false}, doorSize, 0, emptySpace, filledSpace, vOffset);
    emptySpace.length = 0;
    
    emptySpace.push({TL:{x:-(hallLength+hallWidth)/2,y:hallLength/2},BR:{x:(hallLength+hallWidth)/2,y:hallLength/2+hallWidth},isRoom:false});
    vOffset = allocate(filePath, {TL:{x:-(hallLength+hallWidth)/2,y:15 + hallLength/2},BR:{x:(hallLength+hallWidth)/2,y:15 + hallLength/2 + hallWidth},isRoom:false}, doorSize, 0, emptySpace, filledSpace, vOffset);
    emptySpace.length = 0;


    //add sides back in
    emptySpace.push({TL:{x:-(hallLength+hallWidth)/2, y:-15-hallLength/2},BR:{x:(hallLength+hallWidth)/2, y:-hallLength/2},isRoom:false});
    emptySpace.push({TL:{x:-(hallLength+hallWidth)/2, y:-hallLength/2},BR:{x:-hallWidth/2, y:hallLength/2},isRoom:false});
    emptySpace.push({TL:{x:hallWidth/2, y:-hallLength/2},BR:{x:(hallLength+hallWidth)/2, y:hallLength/2},isRoom:false});
    emptySpace.push({TL:{x:-(hallLength+hallWidth)/2, y:hallLength/2},BR:{x:(hallLength+hallWidth)/2, y:15 + hallLength/2},isRoom:false});

    vOffset = allocate(filePath, {TL:{x:-(hallLength+hallWidth)/2, y:hallLength/2},BR:{x:(hallLength+hallWidth)/2, y:15 + hallLength/2},isRoom:true}, doorSize, 3, emptySpace, filledSpace, vOffset)
    vOffset = allocate(filePath, {TL:{x:-(hallLength+hallWidth)/2, y:-15-hallLength/2},BR:{x:(hallLength+hallWidth)/2, y:-hallLength/2},isRoom:true}, doorSize, 0, emptySpace, filledSpace, vOffset)

    
    //For each empty space, test the number of hall connections.  Use this to decide how to fill the space.

    for (let i = 0; i < emptySpace.length; i++) {
        let halls = checkForHalls(filledSpace, emptySpace[i]);
        let hallCount = halls[0] + halls[1] + halls[2] + halls[3];
        switch (hallCount) {
            case 0:
                vOffset = basicFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, 10);
                break;
            case 1:
            case 2:
                vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, 10);
                break;
            case 3:
                vOffset = threeHallFill(filePath, [emptySpace[i]], filledSpace, vOffset, halls, doorSize, 10);
                break;
            case 4:
                vOffset = fourHallFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, 10);
                break;
            default:
                console.log("Error! Abnormal number of adjacent halls.")
        }
    }

    let width = hallLength + hallWidth;
    let length = 2*hallLength;

    //Generate Outer Wall
    vOffset = makeWalls(
        width, length, doorSize,
        [[width],[length],[(width-doorSize)/2, (width-doorSize)/2],[length]],
        doorSize, "./" + filePath,
        0, 0, 0, vOffset
    );

    // //Generate Outside Of Building
    vOffset = flatGenerator(width + 15, length + 15,
        "./" + filePath, {},
        0, 0, 0, vOffset
    );

    generateLabels(filledSpace, filePath);
}
