import flatGenerator from "./flatGenerator.js"
import wallGenerator from "./ProcGen/wallGenerator.js"
import is from "is_js";


const wallWidth = 2;


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
export function makeWalls(width, length, wallHeight, doorLocs, doorSize, baseName, wOffset = 0, lOffset = 0, hOffset = 0, vOffset = 0, count) {
    // if (!is.all.finite([width, length, wallHeight]) || width < 8 || length < 8 || doorLocs.length != 4  || Math.max(doorLocs) >= (width - 2) || Math.max(doorLocs) >= (length - 2) || arguments.length < 5 || arguments.length > 9) {
    if (!is.all.finite([width, length, wallHeight]) || doorLocs.length != 4  || Math.max(doorLocs) >= (width - 2) || Math.max(doorLocs) >= (length - 2) || arguments.length < 5 || arguments.length > 11) {
        console.log(width, length)
        throw new "Invalid arguments."
    }

    // fs.writeFileSync(`${baseName}.obj`, "mtllib room.mtl\n");
    // fs.writeFileSync(`${baseName}.mtl`, "\n");


    for (let i = 0; i < doorLocs.length; i++) {
        let lengthCovered = 0;
        doorLocs[i].forEach(wallSeg => { //LTRB
            switch (i) {
                case 0:
                    vOffset = wallGenerator(wallSeg, wallWidth, wallHeight, baseName, {}, -width/2 + wallSeg/2 + lengthCovered + wOffset, -length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
                    break;
                case 1:
                    vOffset = wallGenerator(wallWidth, wallSeg, wallHeight, baseName, {}, width/2 + wOffset, -length/2 + wallSeg/2 + lengthCovered + lOffset, wallHeight/2 + hOffset, vOffset, count);
                    break;
                case 2:
                    vOffset = wallGenerator(wallSeg, wallWidth, wallHeight, baseName, {}, -width/2 + wallSeg/2 + lengthCovered + wOffset, length/2 + lOffset, wallHeight/2 + hOffset, vOffset, count);
                    break;
                case 3:
                    vOffset = wallGenerator(wallWidth, wallSeg, wallHeight, baseName, {}, -width/2 + wOffset, -length/2 + wallSeg/2 + lengthCovered + lOffset, wallHeight/2 + hOffset, vOffset, count);
                    break;
            }
            lengthCovered += wallSeg + doorSize;
        })
    }

    return vOffset;
}