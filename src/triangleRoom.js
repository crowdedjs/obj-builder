import flatGenerator from "./flatGenerator.js"
import {makeWalls} from "./outerWalls.js"
import fs from 'fs';
import wallGenerator from "./wallGenerator.js";


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
export function triangleRoom(centerDist, rotations, wingWidth, hallWidth, filePath, wOffset = 0, lOffset = 0, hOffset = 0, vOffset = 0) {

    vOffset = flatGenerator(centerDist*4, centerDist*4,
        "./" + filePath, {},
        wOffset, lOffset, hOffset, vOffset
    );

    let points = [];
    let calculatedRotations = [];

    for (let i = 0; i < rotations.length; i++) {
        let rotation = (rotations[i] + rotations[(i+1) % 3])/2;
        if (i == 2)
            rotation += Math.PI;

        points.push(rotate(rotation, -wingWidth, centerDist))
        points.push(rotate(rotation, wingWidth, centerDist))
        calculatedRotations.push(rotation);
    }

    for (let i = 0; i < rotations.length*2; i+=2) {
        let grouping = "g " + calculatedRotations[i/2] + '\n';
        fs.appendFileSync(filePath + '.obj', grouping);

        let distA = Math.sqrt(Math.pow(points[(i+3)%6].x - points[i].x, 2) + Math.pow(points[(i+3)%6].z - points[i].z, 2))
        let distB = Math.sqrt(Math.pow(points[(i+5)%6].x - points[i].x, 2) + Math.pow(points[(i+5)%6].z - points[i].z, 2))

        let wallLength = distA < distB ? distA : distB;
        let centerOffset = Math.sqrt(Math.pow(centerDist, 2) - Math.pow(wallLength/2, 2)) + 40/Math.log2(centerDist);

        vOffset = wallGenerator(
            wallLength+centerDist/10, 2, 4, 
            "./" + filePath, {},
            0, -centerOffset, 2, vOffset
        );
    }

    return vOffset;
}


function rotate(rotation, wingWidth, centerDist) {
    let temp = {x:wingWidth/2, y:0, z:centerDist}
    let point = {x:0, y:0, z:0}

    point.x = Math.cos(rotation) * temp.x + Math.sin(rotation) * temp.z;
    point.z = -Math.sin(rotation) * temp.x + Math.cos(rotation) * temp.z;

    return point;
}
