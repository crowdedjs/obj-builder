import flatGenerator from "./flatGenerator.js"
import wallGenerator from "./wallGenerator.js"
import is from "is_js";


const wallWidth = 1;


// makeRoom(20, 20, 2, [true, false, false, false], 10, 10, 10);

export function makeRandRoom(baseName) {
    return makeRoom(randInt(31) + 10, randInt(31) + 10, 2, [randDoor(4), randDoor(4), randDoor(4), randDoor(4)], baseName, randInt(21) - 10, randInt(21) - 10, randInt(21) - 10);
}

function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randDoor(max) {
    return randInt(2) ? 0 : randInt(max) + 2;
}

/**
 * 
 * @param {double} width The width of the room
 * @param {double} length The length of the room
 * @param {double} wallHeight The height of the walls
 * @param {array} doorLocs Length 4 int array (top, right, bottom, left). Nonzero means door on the wall, x units wide.
 * @param {string} baseName Name of the file we are saving to
 * @param {double} wOffset The offset on the width axis
 * @param {double} lOffset The offset on the length axis
 * @param {double} hOffset The offset on the height axis
 * @param {int} vOffset The offset for the previous vertices for obj file.  First room should always be 0.
 */
export function makeRoom(width, length, wallHeight, doorLocs, baseName, wOffset = 0, lOffset = 0, hOffset = 0, vOffset = 0, count = 0) {
    // if (!is.all.finite([width, length, wallHeight]) || width < 8 || length < 8 || doorLocs.length != 4  || Math.max(doorLocs) >= (width - 2) || Math.max(doorLocs) >= (length - 2) || arguments.length < 5 || arguments.length > 9) {
    if (!is.all.finite([width, length, wallHeight]) || doorLocs.length != 4  || Math.max(doorLocs) >= (width - 2) || Math.max(doorLocs) >= (length - 2) || arguments.length < 5 || arguments.length > 10) {
        console.log(width, length)
        throw new "Invalid arguments."
    }

    // fs.writeFileSync(`${baseName}.obj`, "mtllib room.mtl\n");
    // fs.writeFileSync(`${baseName}.mtl`, "\n");

    vOffset = flatGenerator(width, length, baseName, {}, wOffset, lOffset, hOffset, vOffset, count);
    
    if (doorLocs[0])
        vOffset = wallWithDoorT(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorLocs[0], count);
    else
        vOffset = wallGenerator(width-wallWidth, wallWidth, wallHeight, baseName, {}, wOffset, -length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    if (doorLocs[1])
        vOffset = wallWithDoorR(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorLocs[1], count);
    else
        vOffset = wallGenerator(wallWidth, length+1, wallHeight, baseName, {}, width/2 + wOffset, lOffset, wallHeight/2 + hOffset, vOffset, count);
    if (doorLocs[2])
        vOffset = wallWithDoorB(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorLocs[2], count);
    else
        vOffset = wallGenerator(width-wallWidth, wallWidth, wallHeight, baseName, {}, wOffset, length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    if (doorLocs[3])
        vOffset = wallWithDoorL(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorLocs[3], count);
    else
        vOffset = wallGenerator(wallWidth, length+1, wallHeight, baseName, {}, -width/2 + wOffset, lOffset, wallHeight/2 + hOffset, vOffset, count);

    return vOffset;
}

function wallWithDoorT(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorSize, count) {
    let segLen = (width-doorSize)/2 - wallWidth/2;
    vOffset = wallGenerator(segLen, wallWidth, wallHeight, baseName, {}, (segLen + doorSize)/2 + wOffset, -length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    vOffset = wallGenerator(segLen, wallWidth, wallHeight, baseName, {}, -(segLen + doorSize)/2 + wOffset, -length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    return vOffset;
}

function wallWithDoorR(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorSize, count) {
    let segLen = (length-doorSize)/2 + wallWidth/2;
    vOffset = wallGenerator(wallWidth, segLen, wallHeight, baseName, {}, width/2 + wOffset, -(segLen + doorSize)/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    vOffset = wallGenerator(wallWidth, segLen, wallHeight, baseName, {}, width/2 + wOffset, (segLen + doorSize)/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    return vOffset;
}

function wallWithDoorB(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorSize, count) {
    let segLen = (width-doorSize)/2 - wallWidth/2;
    vOffset = wallGenerator(segLen, wallWidth, wallHeight, baseName, {}, (segLen + doorSize)/2 + wOffset, length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    vOffset = wallGenerator(segLen, wallWidth, wallHeight, baseName, {}, -(segLen + doorSize)/2 + wOffset, length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    return vOffset;
}

function wallWithDoorL(width, length, wallHeight, wOffset, lOffset, hOffset, vOffset, baseName, doorSize, count) {
    let segLen = (length-doorSize)/2 + wallWidth/2;
    vOffset = wallGenerator(wallWidth, segLen, wallHeight, baseName, {}, -width/2 + wOffset, -(segLen + doorSize)/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    vOffset = wallGenerator(wallWidth, segLen, wallHeight, baseName, {}, -width/2 + wOffset, (segLen + doorSize)/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
    return vOffset;
}