import flatGenerator from "./src/flatGenerator.js"
import wallGenerator from "./src/wallGenerator.js"
import {makeRoom} from "./src/room.js"
import {makeRandRoom} from "./src/room.js"
import fs from "fs";
import { fileURLToPath } from "url";
// import { is } from "is_js";

// let vOffset = makeRoom(20, 20, 2, [1.5, 0, 0, 0], "./runs/room/room");
// flatGenerator(50, 50, "./runs/room/room", {}, 0, 0, 0, vOffset);
// makeRandRoom("./runs/room/room");

fs.writeFileSync(`test.obj`, "mtllib room.mtl\n");
fs.writeFileSync(`test.mtl`, "\n");

let widthBound = Math.floor(Math.random() * 150) + 51;
let lengthBound = Math.floor(Math.random() * 150) + 51;
let emptySpace = [];
let filledSpace = [];

let vOffset = 0;

emptySpace.push({
    TL:{x:-widthBound/2,y:-lengthBound/2},
    BR:{x:widthBound/2,y:lengthBound/2}
});

while (emptySpace.length != 0) {
    //find index of the empty space with the lowest TL.y value.
    let minIdx = -1;
    let minVal = Infinity;

    for (let i = 0; i < emptySpace.length; i++) {
        if (emptySpace[i].TL.y < minVal) {
            minIdx = i;
            minVal = emptySpace[i].TL.y;
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
        allocate(newSpace, 3, true, minIdx);
    }
}

function allocate(filled, doorSize, isRoom, index) {
    let overlapFound = false;

    let alignedEdges = checkValidPartition(emptySpace[index], filled);
    if (alignedEdges != false) {
        cutSpace(emptySpace[index], filled, alignedEdges);
        overlapFound = alignedEdges;
    }

    // if (overlapFound != false && isRoom) {
    if (isRoom) {
        // overlapFound.map(door => door * doorSize), "./test",
        vOffset = makeRoom(
            filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y, 2,
            [doorSize, doorSize, doorSize, doorSize], "./test",
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset
        );
        filledSpace.push(filled);
        removeOverlappingEmptySpace();
    } else {
        vOffset = flatGenerator(filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y,
            "./test", {},
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset
        );
    }
}

function checkValidPartition(empty, filled) {
    let alignedEdges = [false, false, false, false];
    
    if (empty.TL.y == filled.TL.y)
    alignedEdges[0] = true;
    if (empty.BR.x == filled.BR.x)
    alignedEdges[1] = true;
    if (empty.BR.y == filled.BR.y)
    alignedEdges[2] = true;
    if (empty.TL.x == filled.TL.x)
    alignedEdges[3] = true;
    
    if (!alignedEdges.some((edge) => {return edge})) {
        return false;
    } else {
        return alignedEdges;
    }
}

function cutSpace(empty, filled, alignedEdges) {
    if (!alignedEdges[0]) { 
        let newSpace = {TL:{x:0,y:0},BR:{x:0,y:0}};
        deepCloneSpace(newSpace, empty);
        newSpace.BR.y = filled.TL.y;
        emptySpace.push(newSpace);
    }
    if (!alignedEdges[1]) {
        let newSpace = {TL:{x:0,y:0},BR:{x:0,y:0}};
        deepCloneSpace(newSpace, empty);
        newSpace.TL.x = filled.BR.x;
        emptySpace.push(newSpace);
    }
    if (!alignedEdges[2]) {
        let newSpace = {TL:{x:0,y:0},BR:{x:0,y:0}};
        deepCloneSpace(newSpace, empty);
        newSpace.TL.y = filled.BR.y;
        emptySpace.push(newSpace);
    }
    if (!alignedEdges[3]) {
        let newSpace = {TL:{x:0,y:0},BR:{x:0,y:0}};
        deepCloneSpace(newSpace, empty);
        newSpace.BR.x = filled.TL.x;
        emptySpace.push(newSpace);
    }
    
}

function removeOverlappingEmptySpace() {
    let toRemove = {};
    filledSpace.forEach(filled => {
        emptySpace.forEach(space => {
            if (overlaps(filled, space)) {
                toRemove[[space.BR.x, space.TL.x, space.BR.y, space.TL.y]] = true;
            }
        });
    });

    console.log(emptySpace)
    
    
    emptySpace = emptySpace.filter(space => !toRemove.hasOwnProperty([space.BR.x, space.TL.x, space.BR.y, space.TL.y]))
    console.log(emptySpace)
}

function overlaps(space1, space2) {
    if (space1.TL.x >= space2.BR.x || space2.TL.x >= space1.BR.x) {
        return false;
    } else if (space1.TL.y >= space2.BR.y || space2.TL.y >= space1.BR.y) {
        return false;
    }

    console.log(space1)
    console.log(space2)

    return true;
}

function deepCloneSpace(target, source) {
    target.TL.x = source.TL.x;
    target.BR.x = source.BR.x;
    target.TL.y = source.TL.y;
    target.BR.y = source.BR.y;
}
