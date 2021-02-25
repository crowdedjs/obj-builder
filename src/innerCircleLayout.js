import fs from "fs";
import { allocate, generateLabels, visualizeEmpty, checkForHalls, threeHallFill, fourHallFill, lineFill, arrivalOnePerRoom } from "./spacesSharedFunctions.js"
import { makeRoom } from "./room.js";
import { makeWalls } from "./outerWalls.js";
import flatGenerator from "./flatGenerator.js"


export function innerCircleLayout(filePath = "test", hallWidth = 4, doorSize = 3, w = 100, l = 100, midRatio = 1/3, maxRoomSize = 15) {
    fs.writeFileSync(filePath + `.obj`, "\n");
    // fs.writeFileSync(filePath + `.obj`, "mtllib room.mtl\n");
    // fs.writeFileSync(filePath + `.mtl`, "\n");

    const spaceToFill = {
        TL:{x:-w/2,y:-l/2},
        BR:{x:w/2,y:l/2}
    }

    let emptySpace = [];
    let filledSpace = [];
    
    let vOffset = 0;
    
    emptySpace.push(spaceToFill);

    //Hallways (Top, Left, Right, Bottom, Entry Hall)
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x,y:spaceToFill.TL.y * midRatio -hallWidth},BR:{x:spaceToFill.BR.x,y:spaceToFill.TL.y * midRatio},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x * midRatio -hallWidth,y:spaceToFill.TL.y * midRatio},BR:{x:spaceToFill.TL.x * midRatio,y:spaceToFill.BR.y * midRatio},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.BR.x * midRatio,y:spaceToFill.TL.y * midRatio},BR:{x:spaceToFill.BR.x * midRatio +hallWidth,y:spaceToFill.BR.y * midRatio},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:spaceToFill.TL.x,y:spaceToFill.BR.y * midRatio},BR:{x:spaceToFill.BR.x,y:spaceToFill.BR.y * midRatio +hallWidth},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
    vOffset = allocate(filePath, {TL:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 -hallWidth/2,y:spaceToFill.BR.y * midRatio +hallWidth},BR:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 +hallWidth/2,y:spaceToFill.BR.y},isRoom:false}, 3, 0, emptySpace, filledSpace, vOffset);
   
    emptySpace.length = 0;

    //center
    emptySpace.push({TL:{x:spaceToFill.TL.x * midRatio,y:spaceToFill.TL.y * midRatio},BR:{x:spaceToFill.BR.x * midRatio,y:spaceToFill.BR.y * midRatio},isRoom:false});

    //add sides back in (Top, Mid-Left, Mid-Right, Bot-Left, Bot-Right)
    emptySpace.push({TL:{x:spaceToFill.TL.x,y:spaceToFill.TL.y},BR:{x:spaceToFill.BR.x,y:spaceToFill.TL.y * midRatio -hallWidth},isRoom:false});
    emptySpace.push({TL:{x:spaceToFill.TL.x,y:spaceToFill.TL.y * midRatio},BR:{x:spaceToFill.TL.x * midRatio -hallWidth,y:spaceToFill.BR.y * midRatio},isRoom:false});
    emptySpace.push({TL:{x:spaceToFill.BR.x * midRatio +hallWidth,y:spaceToFill.TL.y * midRatio},BR:{x:spaceToFill.BR.x,y:spaceToFill.BR.y * midRatio},isRoom:false});
    emptySpace.push({TL:{x:spaceToFill.TL.x,y:spaceToFill.BR.y * midRatio +hallWidth},BR:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 -hallWidth/2,y:spaceToFill.BR.y},isRoom:false});
    emptySpace.push({TL:{x:(spaceToFill.BR.x+spaceToFill.TL.x) / 2 +hallWidth/2,y:spaceToFill.BR.y * midRatio +hallWidth},BR:{x:spaceToFill.BR.x,y:spaceToFill.BR.y},isRoom:false});

    // vOffset = visualizeEmpty(emptySpace, filePath, vOffset, 30)

    for (let i = 0; i < emptySpace.length; i++) {
        let halls = checkForHalls(filledSpace, emptySpace[i]);
        let hallCount = halls[0] + halls[1] + halls[2] + halls[3];
        switch (hallCount) {
            case 0:
                vOffset = basicFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, maxRoomSize);
                break;
            case 1:
            case 2:
                vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, maxRoomSize);
                break;
            case 3:
                vOffset = threeHallFill(filePath, [emptySpace[i]], filledSpace, vOffset, halls, doorSize, maxRoomSize);
                break;
            case 4:
                vOffset = fourHallFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, maxRoomSize);
                break;
            default:
                console.log("Error! Abnormal number of adjacent halls.")
        }
    }


    let width = spaceToFill.BR.x - spaceToFill.TL.x;
    let length = spaceToFill.BR.y - spaceToFill.TL.y;
    
    // Generate Outer Wall
    vOffset = makeWalls(
        width, length, doorSize,
        [[width],[length],[width/2 - hallWidth/2, width/2 - hallWidth/2],[length]],
        hallWidth, "./" + filePath,
        (spaceToFill.BR.x + spaceToFill.TL.x) / 2, (spaceToFill.BR.y + spaceToFill.TL.y) / 2, 0, vOffset
    );

    // Generate Outside Of Building
    vOffset = flatGenerator(width + 30, length + 30,
        "./" + filePath, {},
        (spaceToFill.BR.x + spaceToFill.TL.x) / 2, (spaceToFill.BR.y + spaceToFill.TL.y) / 2, 0, vOffset
    );

    generateLabels(filledSpace, filePath, "room");
    arrivalOnePerRoom(filledSpace, filePath, "room")
}
