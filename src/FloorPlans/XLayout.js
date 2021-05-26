import fs from "fs";
import { allocate, basicFill, lineFill, generateLabels, visualizeEmpty, checkForHalls, threeHallFill, fourHallFill } from "../spacesSharedFunctions.js"
import flatGenerator from "../flatGenerator.js";
import { makeWalls } from "../outerWalls.js";

const w = Math.floor(Math.random() * 150) + 51;
const vertL = Math.floor(Math.random() * 150) + 51;
const horizL = Math.floor(Math.random() * 150) + 51;


export function XLayout(filePath = "test", w = 40, vertL = Math.floor(Math.random() * 150) + 51, horizL = Math.floor(Math.random() * 150) + 51, hallWidth = 6, doorSize = 3) {
    fs.writeFileSync(filePath + `.obj`, "mtllib room.mtl\n");
    fs.writeFileSync(filePath + `.mtl`, "\n");

    let emptySpace = [];
    let filledSpace = [];
    
    let vOffset = 0;

    //Hallways
    emptySpace.push({TL:{x:-hallWidth/2,y:-vertL/2},BR:{x:hallWidth/2,y:vertL/2},isRoom:false});
    vOffset = allocate(filePath, {TL:{x:-hallWidth/2,y:-vertL/2},BR:{x:hallWidth/2,y:vertL/2},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    emptySpace.length = 0;
    
    emptySpace.push({TL:{x:-horizL/2,y:-hallWidth/2},BR:{x:horizL/2,y:hallWidth/2},isRoom:false});
    vOffset = allocate(filePath, {TL:{x:-horizL/2,y:-hallWidth/2},BR:{x:horizL/2,y:hallWidth/2},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    emptySpace.length = 0;
        
    //add sides back in
    emptySpace.push({TL:{x:-w/2, y:-vertL/2},BR:{x:-hallWidth/2,y:-w/2},isRoom:false});
    emptySpace.push({TL:{x:hallWidth/2, y:-vertL/2},BR:{x:w/2,y:-w/2},isRoom:false});
    emptySpace.push({TL:{x:-horizL/2, y:-w/2},BR:{x:-hallWidth/2,y:-hallWidth/2},isRoom:false});
    emptySpace.push({TL:{x:hallWidth/2, y:-w/2},BR:{x:horizL/2,y:-hallWidth/2},isRoom:false});
    emptySpace.push({TL:{x:-horizL/2, y:hallWidth/2},BR:{x:-hallWidth/2,y:w/2},isRoom:false});
    emptySpace.push({TL:{x:hallWidth/2, y:hallWidth/2},BR:{x:horizL/2,y:w/2},isRoom:false});
    emptySpace.push({TL:{x:-w/2, y:w/2},BR:{x:-hallWidth/2,y:vertL/2},isRoom:false});
    emptySpace.push({TL:{x:hallWidth/2, y:w/2},BR:{x:w/2,y:vertL/2},isRoom:false});

    
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

    //Generate Outer Wall
    vOffset = makeWalls(
        (horizL-w)/2, (vertL-w)/2, doorSize,
        [[],[(vertL-w)/2],[(horizL-w)/2],[]],
        hallWidth, "./" + filePath,
        -(horizL-w)/4 - w/2, -(vertL-w)/4 - w/2, 0, vOffset
    );
    vOffset = makeWalls(
        (horizL-w)/2, (vertL-w)/2, doorSize,
        [[],[],[(horizL-w)/2],[(vertL-w)/2]],
        hallWidth, "./" + filePath,
        (horizL-w)/4 + w/2, -(vertL-w)/4 - w/2, 0, vOffset
    );
    vOffset = makeWalls(
        (horizL-w)/2, (vertL-w)/2, doorSize,
        [[(horizL-w)/2],[],[],[(vertL-w)/2]],
        hallWidth, "./" + filePath,
        (horizL-w)/4 + w/2, (vertL-w)/4 + w/2, 0, vOffset
    );
    vOffset = makeWalls(
        (horizL-w)/2, (vertL-w)/2, doorSize,
        [[(horizL-w)/2],[(vertL-w)/2],[],[]],
        hallWidth, "./" + filePath,
        -(horizL-w)/4 - w/2, (vertL-w)/4 + w/2, 0, vOffset
    );

    vOffset = makeWalls(
        w, vertL, doorSize,
        [[(w-hallWidth)/2,(w-hallWidth)/2],[],[(w-hallWidth)/2,(w-hallWidth)/2],[]],
        hallWidth, "./" + filePath,
        0, 0, 0, vOffset
    );
    vOffset = makeWalls(
        horizL, w, doorSize,
        [[],[(w-hallWidth)/2,(w-hallWidth)/2],[],[(w-hallWidth)/2,(w-hallWidth)/2]],
        hallWidth, "./" + filePath,
        0, 0, 0, vOffset
    );

    //Generate Outside Of Building
    vOffset = flatGenerator(horizL + 30, vertL + 30,
        "./" + filePath, {},
        0, 0, 0, vOffset
    );

    generateLabels(filledSpace, filePath);
}
