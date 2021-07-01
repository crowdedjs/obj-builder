import fs from "fs";
import { allocate, basicFill, lineFill, generateLabels, checkForHalls, threeHallFill, fourHallFill, adjustVertices } from "../ProcGen/spacesSharedFunctions.js"
import { makeWalls } from "../ProcGen/outerWalls.js";
import { triangleRoom } from "../ProcGen/triangleRoom.js";


const wingLengths = [50, 100, 100];

export function YLayout(filePath = "test", hallWidth = 6, rotations = [0, Math.PI * 2 / 3, Math.PI * 4 / 3], doorSize = 3) {
    fs.writeFileSync(filePath + `.obj`, "mtllib room.mtl\n");
    fs.writeFileSync(filePath + `.mtl`, "\n");

    let emptySpace = [];
    let filledSpace = [];
    
    let vOffset = 0;
    let wingWidth = 30 + hallWidth;
    let centerDist = 30;

    emptySpace.length = 0;

    emptySpace.push([{TL:{x:-wingWidth/2,y:-wingLengths[0] - centerDist},BR:{x:wingWidth/2,y: - centerDist},isRoom:false}]);
    emptySpace.push([{TL:{x:-wingWidth/2,y:-wingLengths[1] - centerDist},BR:{x:wingWidth/2,y: - centerDist},isRoom:false}]);
    emptySpace.push([{TL:{x:-wingWidth/2,y:-wingLengths[2] - centerDist},BR:{x:wingWidth/2,y: - centerDist},isRoom:false}]);

    
    //For each empty space, test the number of hall connections.  Use this to decide how to fill the space.

    for (let i = 0; i < emptySpace.length; i++) {
        let grouping = "g " + rotations[i] + '\n';
        fs.appendFileSync(filePath + '.obj', grouping);

        //hall through the middle
        vOffset = allocate(filePath, {TL:{x:-hallWidth/2,y:emptySpace[i][0].TL.y},BR:{x:hallWidth/2,y: emptySpace[i][0].BR.y},isRoom:false}, 3, 0, emptySpace[i], filledSpace, vOffset);

        //outer wall
        vOffset = makeWalls(
            wingWidth, wingLengths[i], doorSize,
            [[wingWidth/2 - hallWidth/2, wingWidth/2 - hallWidth/2],
            [wingLengths[i]],[],[wingLengths[i]]],
            hallWidth, "./" + filePath,
            0, -wingLengths[i] / 2 - centerDist, 0, vOffset
        );


        for (let j = 0; j < emptySpace[i].length; j++){
            let halls = checkForHalls(filledSpace, emptySpace[i][j]);
            let hallCount = halls[0] + halls[1] + halls[2] + halls[3];
            switch (hallCount) {
                case 0:
                    vOffset = basicFill(filePath, [emptySpace[i][j]], filledSpace, vOffset, doorSize);
                    break;
                case 1:
                case 2:
                    vOffset = lineFill(filePath, [emptySpace[i][j]], filledSpace, vOffset, doorSize);
                    break;
                case 3:
                    vOffset = threeHallFill(filePath, [emptySpace[i][j]], filledSpace, vOffset, halls, doorSize);
                    break;
                case 4:
                    vOffset = fourHallFill(filePath, [emptySpace[i][j]], filledSpace, vOffset, doorSize);
                    break;
                default:
                    console.log("Error! Abnormal number of adjacent halls.")
            }
        }
    }


    vOffset = triangleRoom(centerDist, rotations, wingWidth, filePath, 0, 0, 0, vOffset)

    adjustVertices(filePath)

 

    generateLabels(filledSpace, filePath);
}
