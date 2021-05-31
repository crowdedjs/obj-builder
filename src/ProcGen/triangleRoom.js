import flatGenerator from "./flatGenerator.js"
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
export function triangleRoom(centerDist, rotations, wingWidth, filePath, wOffset = 0, lOffset = 0, hOffset = 0, vOffset = 0) {

    vOffset = flatGenerator(centerDist*2.3, centerDist*2.3,
        "./" + filePath, {},
        wOffset, lOffset, hOffset, vOffset
    );

    let points = [];
    let calculatedRotations = [];
    let addRot = rotations[0]+rotations[1]+rotations[2];

    for (let i = 0; i < rotations.length; i++) {
        let rotation = (rotations[i] + rotations[(i+1) % 3])/2;
        if (i == 2)
            rotation += Math.PI;

        points.push(rotate(rotations[i]+addRot, -wingWidth, centerDist))
        points.push(rotate(rotations[i]+addRot, wingWidth, centerDist))
        calculatedRotations.push(rotation);
    }

    // points.forEach(point => {
    //     vOffset = visualizePoint(point, filePath, vOffset)
    // });
    
    for (let i = 1; i < rotations.length*2; i+=2) {
        let grouping = "g " + calculatedRotations[Math.floor(i/2)] + '\n';
        fs.appendFileSync(filePath + '.obj', grouping);

        let wallLength = Math.sqrt(Math.pow(points[(i+1)%6].x - points[i].x, 2) + Math.pow(points[(i+1)%6].z - points[i].z, 2));
        let centerOffset = Math.sqrt(Math.abs(Math.pow(centerDist, 2) - Math.pow(wallLength/2, 2))) + 40/Math.log2(centerDist);

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

function visualizePoint(point, filePath, vOffset) {
    vOffset = wallGenerator(
        3,3,15,filePath,{},point.x,point.z,0,vOffset
    );
    return vOffset;
}
