import fs from "fs";
import { allocate, generateLabels, visualizeEmpty } from "./spacesSharedFunctions.js"

const w = Math.floor(Math.random() * 150) + 51;
const l = Math.floor(Math.random() * 150) + 51;
const defaultSpace = {
    TL:{x:-w/2,y:-l/2},
    BR:{x:w/2,y:l/2}
}

export function fillSpaceWithRooms(filePath = "test", spaceToFill = defaultSpace) {
    fs.writeFileSync(filePath + `.obj`, "mtllib room.mtl\n");
    fs.writeFileSync(filePath + `.mtl`, "\n");

    let emptySpace = [];
    let filledSpace = [];
    
    let vOffset = 0;
    
    emptySpace.push(spaceToFill);
        
    
    while (emptySpace.length != 0) {
        //find index of the empty space with the lowest TL.y value.
        let minIdx = -1;
        let minVal = [Infinity, Infinity];
    
        for (let i = 0; i < emptySpace.length; i++) {
            if (emptySpace[i].TL.y < minVal[0]) {
                if (emptySpace[i].TL.x < minVal[1]) {
                    minIdx = i;
                    minVal = [emptySpace[i].TL.y, emptySpace[i].TL.x];
                }
            }
        };
    
        let widVal, lenVal;
    
        if (emptySpace[minIdx].BR.x - emptySpace[minIdx].TL.x > 30)
            // widVal = Math.floor(Math.random() * 10) + 11;
            widVal = 20;
        else if (emptySpace[minIdx].BR.x - emptySpace[minIdx].TL.x > 20)
            widVal = (emptySpace[minIdx].BR.x - emptySpace[minIdx].TL.x) / 2;
        else
            widVal = emptySpace[minIdx].BR.x - emptySpace[minIdx].TL.x;
    
        if (emptySpace[minIdx].BR.y - emptySpace[minIdx].TL.y > 30)
            // lenVal = Math.floor(Math.random() * 10) + 11;
            lenVal = 20;
        else if (emptySpace[minIdx].BR.y - emptySpace[minIdx].TL.y > 20)
            lenVal = (emptySpace[minIdx].BR.y - emptySpace[minIdx].TL.y) / 2;
        else
            lenVal = emptySpace[minIdx].BR.y - emptySpace[minIdx].TL.y;
        
        
        let newSpace = {
            TL:{x:emptySpace[minIdx].TL.x, y:emptySpace[minIdx].TL.y},
            BR:{x:emptySpace[minIdx].TL.x + widVal, y:emptySpace[minIdx].TL.y + lenVal},
        };
        
        if (newSpace.TL.x - newSpace.BR.x < 0 && newSpace.TL.y - newSpace.BR.y < 0) {
            vOffset = allocate(filePath, newSpace, 3, true, minIdx, emptySpace, filledSpace, vOffset);
        }
    }

    generateLabels(filledSpace, filePath);
}

