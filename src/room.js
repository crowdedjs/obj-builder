import flatGenerator from "./flatGenerator.js"
import wallGenerator from "./wallGenerator.js"
import fs from 'fs';
import is from "is_js";


const wallWidth = 1;
const baseName = "../runs/room/room";

fs.writeFileSync(`${baseName}.obj`, "mtllib room.mtl\n");
fs.writeFileSync(`${baseName}.mtl`, "\n");

makeRoom(randInt(31) + 10, randInt(31) + 10, 2, [randInt(2), randInt(2), randInt(2), randInt(2)]);
// makeRoom(20, 20, 2, [true, false, false, false]);

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


    vOffset = flatGenerator(width, length, baseName, {}, 0, 0, vOffset);
    
    if (doorLocs[0])
        wallWithDoorT(width, length, wallHeight);
    else
        vOffset = wallGenerator(width+1, wallHeight, wallWidth, baseName, {}, 0, wallHeight/2, -length/2, vOffset);
    if (doorLocs[1])
        wallWithDoorR(width, length, wallHeight);
    else
        vOffset = wallGenerator(wallWidth, wallHeight, length+1, baseName, {}, width/2, wallHeight/2, 0, vOffset);
    if (doorLocs[2])
        wallWithDoorB(width, length, wallHeight);
    else
        vOffset = wallGenerator(width+1, wallHeight, wallWidth, baseName, {}, 0, wallHeight/2, length/2, vOffset);
    if (doorLocs[3])
        wallWithDoorL(width, length, wallHeight);
    else
        vOffset = wallGenerator(wallWidth, wallHeight, length+1, baseName, {}, -width/2, wallHeight/2, 0, vOffset);
}

function wallWithDoorT(width, length, wallHeight) {
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, width/4+1, wallHeight/2, -length/2, vOffset);
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, -width/4-1, wallHeight/2, -length/2, vOffset);
}

function wallWithDoorR(width, length, wallHeight) {
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, width/2, wallHeight/2, -length/4-1, vOffset);
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, width/2, wallHeight/2, length/4+1, vOffset);
}

function wallWithDoorB(width, length, wallHeight) {
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, width/4+1, wallHeight/2, length/2, vOffset);
    vOffset = wallGenerator(width/2-1, wallHeight, wallWidth, baseName, {}, -width/4-1, wallHeight/2, length/2, vOffset);
}

function wallWithDoorL(width, length, wallHeight) {
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, -width/2, wallHeight/2, -length/4-1, vOffset);
    vOffset = wallGenerator(wallWidth, wallHeight, length/2-1, baseName, {}, -width/2, wallHeight/2, length/4+1, vOffset);
}
export {flatGenerator};
export {wallGenerator};