import flatGenerator from "./flatGenerator.js"
import wallGenerator from "./wallGenerator.js"
import fs from 'fs';
import is from "is_js";


const wallWidth = 1;
const baseName = "../runs/room/room";

fs.writeFileSync(`${baseName}.obj`, "mtllib room.mtl\n");
fs.writeFileSync(`${baseName}.mtl`, "\n");

// makeRoom(randInt(31) + 10, randInt(31) + 10, 2, [randInt(2), randInt(2), randInt(2), randInt(2)]);
makeRoom(20, 20, 2, [true, false, false, false], 10, 10, 10);

function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * 
 * @param {double} width The width of the room
 * @param {double} length The length of the room
 * @param {double} wallHeight The height of the walls
 * @param {*} doorLocs Length 4 bool array (top, right, bottom, left). True means door on the wall.
 */
function makeRoom(width, length, wallHeight, doorLocs, wOffset = 0, lOffset = 0, hOffset = 0, vOffset = 0) {
    if (!is.all.finite([width, length, wallHeight]) || width < 10 || length < 10 || doorLocs.length != 4 || arguments.length < 4 || arguments.length > 8) throw new "Invalid arguments."


    vOffset = flatGenerator(width, length, baseName, {}, wOffset, lOffset, hOffset, vOffset);
    
    if (doorLocs[0])
        vOffset = wallWithDoorT(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset);
    else
        vOffset = wallGenerator(width+1, wallHeight, wallWidth, baseName, {}, wOffset, wallHeight/2 + lOffset, -length/2 + hOffset, vOffset);
    if (doorLocs[1])
        vOffset = wallWithDoorR(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset);
    else
        vOffset = wallGenerator(wallWidth, wallHeight, length+1, baseName, {}, width/2 + wOffset, wallHeight/2 + lOffset, hOffset, vOffset);
    if (doorLocs[2])
        vOffset = wallWithDoorB(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset);
    else
        vOffset = wallGenerator(width+1, wallHeight, wallWidth, baseName, {}, wOffset, wallHeight/2 + lOffset, length/2 + hOffset, vOffset);
    if (doorLocs[3])
        vOffset = wallWithDoorL(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset);
    else
        vOffset = wallGenerator(wallWidth, wallHeight, length+1, baseName, {}, -width/2 + wOffset, wallHeight/2 + lOffset, hOffset, vOffset);
}

function wallWithDoorT(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset) {
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, width/4+1 + wOffset, wallHeight/2 + lOffset, -length/2 + hOffset, vOffset);
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, -width/4-1 + wOffset, wallHeight/2 + lOffset, -length/2 + hOffset, vOffset);
    return vOffset;
}

function wallWithDoorR(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset) {
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, width/2 + wOffset, wallHeight/2 + lOffset, -length/4-1 + hOffset, vOffset);
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, width/2 + wOffset, wallHeight/2 + lOffset, length/4+1 + hOffset, vOffset);
    return vOffset;
}

function wallWithDoorB(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset) {
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, width/4+1 + wOffset, wallHeight/2 + lOffset, length/2 + hOffset, vOffset);
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, -width/4-1 + wOffset, wallHeight/2 + lOffset, length/2 + hOffset, vOffset);
    return vOffset;
}

function wallWithDoorL(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset) {
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, -width/2 + wOffset, wallHeight/2 + lOffset, -length/4-1 + hOffset, vOffset);
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, -width/2 + wOffset, wallHeight/2 + lOffset, length/4+1 + hOffset, vOffset);
    return vOffset;
}
export {flatGenerator};
export {wallGenerator};