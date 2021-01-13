import fs from "fs";
import { allocate, basicFill, generateLabels, visualizeEmpty } from "./spacesSharedFunctions.js"

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
        
    
    for (let i = 0; i < emptySpace.length; i++) {
        vOffset = basicFill(filePath, [emptySpace[i]], filledSpace, vOffset);
    }

    generateLabels(filledSpace, filePath);
}

