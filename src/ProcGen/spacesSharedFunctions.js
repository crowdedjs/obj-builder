import flatGenerator from "./flatGenerator.js"
import {makeRoom} from "./room.js"
import fs from 'fs';
import readline from 'readline';
import PerlinNoise from '../../node_modules/@mohayonao/perlin-noise/index.js'

/**
 * Fills all given empty spaces with rooms.
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 * @param {Float} width The width of the space to fill
 * @param {Float} length The length of the space to fill
 */
function fillHelper(filePath, emptySpace, filledSpace, vOffset, width, length, doorSize, count) {
    while (emptySpace.length != 0) {    
        let newSpace = {
            TL:{x:emptySpace[0].TL.x, y:emptySpace[0].TL.y},
            BR:{x:emptySpace[0].TL.x + width, y:emptySpace[0].TL.y + length},
            isRoom:true
        };

        vOffset = allocate(filePath, newSpace, doorSize, 0, emptySpace, filledSpace, vOffset, count);

        // if (newSpace.TL.x - newSpace.BR.x < 0 && newSpace.TL.y - newSpace.BR.y < 0) {
        //     vOffset = allocate(filePath, newSpace, doorSize, 0, emptySpace, filledSpace, vOffset);
        // } else {
        //     console.log("Error")
        //     emptySpace.splice(0, 1)
        // }
    }
    return vOffset;
}

/**
 * Calculates the maximum number of rooms that can fit evenly in a space
 * @param {Float} dimension The length or width of the space to fill
 */
function fillProcessing(dimension, maxRoomSize) {
    let count = 1;
    while (dimension / count > maxRoomSize)
        count++
    return count > 1 ? dimension / (count - 1) : dimension;
}

/**
 * Evenly fills a space with square rooms
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 */
export function basicFill(filePath, emptySpace, filledSpace, vOffset, doorSize, maxRoomSize = 10, count) {
    let width = fillProcessing(emptySpace[0].BR.x - emptySpace[0].TL.x, maxRoomSize);
    let length = fillProcessing(emptySpace[0].BR.y - emptySpace[0].TL.y, maxRoomSize);

    return fillHelper(filePath, emptySpace, filledSpace, vOffset, width, length, doorSize, count);
}

/**
 * Fills a space with rooms in a line
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 */
export function lineFill(filePath, emptySpace, filledSpace, vOffset, doorSize, maxRoomSize = 10, count) {
    let width, length;

    if (emptySpace[0].BR.x - emptySpace[0].TL.x > emptySpace[0].BR.y - emptySpace[0].TL.y) {
        length = emptySpace[0].BR.y - emptySpace[0].TL.y;
        width = fillProcessing(emptySpace[0].BR.x - emptySpace[0].TL.x, maxRoomSize);
    } else {
        width = emptySpace[0].BR.x - emptySpace[0].TL.x;
        length = fillProcessing(emptySpace[0].BR.y - emptySpace[0].TL.y, maxRoomSize);
    }

    return fillHelper(filePath, emptySpace, filledSpace, vOffset, width, length, doorSize, count);
}


/**
 * Fills a space with rooms in a line
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 */
export function zoneFill(filePath, emptySpace, filledSpace, vOffset, maxRoomSize = 10, count, doorCode) {
    let width, length;

    if (emptySpace[0].BR.x - emptySpace[0].TL.x > emptySpace[0].BR.y - emptySpace[0].TL.y) {
        length = emptySpace[0].BR.y - emptySpace[0].TL.y;
        width = fillProcessing(emptySpace[0].BR.x - emptySpace[0].TL.x, maxRoomSize);
    } else {
        width = emptySpace[0].BR.x - emptySpace[0].TL.x;
        length = fillProcessing(emptySpace[0].BR.y - emptySpace[0].TL.y, maxRoomSize);
    }


    while (emptySpace.length != 0) {    
        let filled = {
            TL:{x:emptySpace[0].TL.x, y:emptySpace[0].TL.y},
            BR:{x:emptySpace[0].TL.x + width, y:emptySpace[0].TL.y + length},
            isRoom:true
        };

        let alignedEdges = checkValidPartition(emptySpace[0], filled);
        cutSpace(emptySpace[0], filled, alignedEdges, emptySpace);
    
        vOffset = makeRoom(
            width, length, 2,
            doorCode, "./" + filePath,
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset, count
        );

        filledSpace.push(filled);
        removeOverlappingEmptySpace(filled, emptySpace);

    }
    return vOffset;

}










/**
 * Fills a space that has halls on three sides with rooms
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 * @param {*} halls An array of length four with booleans corresponding to which sides of the space have halls. TRBL.
 */
export function threeHallFill(filePath, emptySpace, filledSpace, vOffset, halls, doorSize, maxRoomSize = 10, count) {
    let splitValue;

    if (emptySpace[0].BR.x - emptySpace[0].TL.x > emptySpace[0].BR.y - emptySpace[0].TL.y) {
        splitValue = (emptySpace[0].BR.y - emptySpace[0].TL.y) / 2;
        if (!halls[0] || !halls[2]) {
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:(emptySpace[0].TL.x + emptySpace[0].BR.x) / 2,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:(emptySpace[0].TL.x + emptySpace[0].BR.x) / 2,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else if (!halls[3]) {
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y - splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else {
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y - splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        }
    } else {
        splitValue = (emptySpace[0].BR.x - emptySpace[0].TL.x) / 2;
        if (!halls[1] || !halls[3]) {
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:(emptySpace[0].TL.y + emptySpace[0].BR.y) / 2},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:(emptySpace[0].TL.y + emptySpace[0].BR.y) / 2},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else if (!halls[2]) {
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].TL.y + splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else {
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y - splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y - splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].BR.y - splitValue},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        }
    }

    for (let i = 1; i < emptySpace.length; i++) {
        vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, maxRoomSize, count)
    }

    return vOffset;
}

/**
 * Fills a space that has halls on all sides with rooms.
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 */
export function fourHallFill(filePath, emptySpace, filledSpace, vOffset, doorSize, maxRoomSize = 10, count) {
    let splitValue;

    if (emptySpace[0].BR.x - emptySpace[0].TL.x >= (emptySpace[0].BR.y - emptySpace[0].TL.y) * 2) {
        splitValue = (emptySpace[0].BR.y - emptySpace[0].TL.y) / 2;
        emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].BR.y},isRoom:false})
        emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y - splitValue},isRoom:false})
        emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y},isRoom:false})
        emptySpace.push({TL:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
    } else if ((emptySpace[0].BR.x - emptySpace[0].TL.x) * 2 <= emptySpace[0].BR.y - emptySpace[0].TL.y) {
        splitValue = (emptySpace[0].BR.x - emptySpace[0].TL.x) / 2;
        emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].TL.y + splitValue},isRoom:false})
        emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y - splitValue},isRoom:false})
        emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y - splitValue},isRoom:false})
        emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].BR.y - splitValue},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
    } else {
        splitValue = (emptySpace[0].BR.x - emptySpace[0].TL.x) / 2;
        emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y},isRoom:false})
        emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
    }

    for (let i = 1; i < emptySpace.length; i++) {
        vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset, doorSize, maxRoomSize, count)
    }

    return vOffset;
}

/**
 * Allocates some empty space to be filled and generates a room in that space
 * @param {String} filePath The base path to the files we write to
 * @param {Space} filled The space that will be filled
 * @param {Integer} doorSize The size of the doors for the room to be generated
 * @param {Integer} index The target index in the empty space array
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 */
export function allocate(filePath, filled, doorSize, index, emptySpace, filledSpace, vOffset, count) {
    let hallEdges = checkForHalls(filledSpace, filled);
    let alignedEdges = checkValidPartition(emptySpace[index], filled);
    cutSpace(emptySpace[index], filled, alignedEdges, emptySpace);

    if (filled.isRoom && hallEdges) {
        vOffset = makeRoom(
            filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y, 2,
            hallEdges.map(x => x * doorSize), "./" + filePath,
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset, count
        );
    } else if (filled.isRoom) {
        vOffset = makeRoom(
            filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y, 2,
            [0,0,0,0], "./" + filePath,
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset, count
        );
    } else {
        vOffset = flatGenerator(filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y,
            "./" + filePath, {},
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset, count
        );
    }
    filledSpace.push(filled);
    removeOverlappingEmptySpace(filled, emptySpace);
    return vOffset;
}

/**
 * Checks around the space that will be filled to see if any halls are adjacent to it
 * @param {Array} filledSpace An array of spaces that have already been filled 
 * @param {Space} filled The space that will be filled
 */
export function checkForHalls(filledSpace, filled) {
    let T = false, R = false, B = false, L = false;

    let leeway = 0.1;
    filledSpace.forEach(space => {
        if (between(space.BR.y, filled.TL.y - leeway, filled.TL.y + leeway) && !space.isRoom)
            T = true;
        if (between(space.TL.x, filled.BR.x - leeway, filled.BR.x + leeway) && !space.isRoom)
            R = true;
        if (between(space.TL.y, filled.BR.y - leeway, filled.BR.y + leeway) && !space.isRoom)
            B = true;
        if (between(space.BR.x, filled.TL.x - leeway, filled.TL.x + leeway) && !space.isRoom)
            L = true;
    });
    
    if (!T && !R && !B && !L) {
        return false;
    } else {
        return [T,R,B,L];
    }
}

/**
 * Checks to see if a value is between a minimum and maximum range
 * @param {Float} val The value to be tested
 * @param {Float} min The minimum value of the range
 * @param {Float} max The maximum value of the range
 */
function between(val, min, max) {
    return val >= min && val <= max;
}

/**
 * Returns an array describing which edges are the same in the empty and filled space,
 * or false if it is an invalid partition.
 * @param {Space} empty A portion of empty space
 * @param {Space} filled The space that will be filled
 */
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

/**
 * "Cuts out," or removes, a space from a portion of empty space
 * @param {Space} empty A portion of empty space
 * @param {Space} filled The space that will be filled
 * @param {Array} alignedEdges A length four boolean array describing which edges of the filled space match the empty space
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 */
function cutSpace(empty, filled, alignedEdges, emptySpace) {
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

/**
 * Removes spaces in the empty array that overlap with a given filled space
 * @param {Space} filled The space that will be filled
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 */
function removeOverlappingEmptySpace(filled, emptySpace) {
    let toRemove = {};
    emptySpace.forEach(space => {
        if (overlaps(filled, space) || space.BR.x - space.TL.x < 1 || space.BR.y - space.TL.y < 1) {
            toRemove[[space.BR.x, space.TL.x, space.BR.y, space.TL.y]] = true;
        }
    });
    
    let temp = emptySpace.filter(space => !toRemove.hasOwnProperty([space.BR.x, space.TL.x, space.BR.y, space.TL.y]))
    emptySpace.length = 0;
    temp.forEach(space => {
        emptySpace.push(space);
    })
}

/**
 * Returns true if two spaces have any overlap, false otherwise
 * @param {Space} space1 The first space in the comparison
 * @param {Space} space2 The second space in the comparison
 */
function overlaps(space1, space2) {
    if (space1.TL.x >= space2.BR.x || space2.TL.x >= space1.BR.x) {
        return false;
    } else if (space1.TL.y >= space2.BR.y || space2.TL.y >= space1.BR.y) {
        return false;
    }

    return true;
}

/**
 * A function to copy a source space into a target space
 * @param {Space} target The space to be overwritten
 * @param {Space} source The space to be copied
 */
function deepCloneSpace(target, source) {
    target.TL.x = source.TL.x;
    target.BR.x = source.BR.x;
    target.TL.y = source.TL.y;
    target.BR.y = source.BR.y;
    target.isRoom = source.isRoom;
}

export function generateZoneLabels(filledSpace, filePath, labelVal, nameCount) {
    filledSpace.forEach(space => {
        let name = labelVal + " " + nameCount;
        let annotationName = name;
        if (labelVal == "E" || labelVal == "C" || labelVal == "A") {
            annotationName = labelVal + " Room"
        }
        let position = {x:0,y:0,z:0};
        position.x = (space.TL.x + space.BR.x) / 2;
        position.y = 0;
        position.z = (space.TL.y + space.BR.y) / 2;
        fs.appendFileSync(filePath + "locations.js", `\t{\n\t\t"name": "${name}",\n\t\t"annotationName": "${annotationName}",\n\t\t"position": {\n\t\t\t"x": ${position.x},\n\t\t\t"y": ${position.y},\n\t\t\t"z": ${position.z}\n\t\t}\n\t},\n`)
        nameCount++;
    });
    return nameCount;
}

/**
 * Creates labels for each room
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {String} filePath The base path to the files we write to
 */
export function generateLabels(filledSpace, filePath, labelVal) {
    let pn = new PerlinNoise();
    //offset should have same number of vals as requiredLabels
    let offset = [
        0.3589498927475854, 0.6731241996778812, 0.8609188242458334,
        0.9204826579435137, 0.15580535791249406, 0.3545864876277909,
        0.1876592832533981, 0.4802537341091899, 0.45769937168685537,
        0.9440184060829737, 0.2976507230240073, 0.9611906065795968        
    ]
    let requiredLabels = [
        {name:"TriageNursePlace", annotationName:"Triage Nurse Place"},
        {name:"Fast Track 1", annotationName:"Fast Track"},
        {name:"Greeter Nurse Wait", annotationName:"Greeter"},
        {name:"Check In", annotationName:"Check In"},
        {name:"NursePlace", annotationName:"Nurse Place"},
        {name:"B Desk", annotationName:"B Desk"},
        {name:"TechPlace", annotationName:"Tech Place"},
        {name:"Resident Start", annotationName:"Resident Start"},
        {name:"Tech Start", annotationName:"Tech Start"},
        {name:"CT 1", annotationName:"CT 1"},
        {name:"CT 2", annotationName:"CT 2"},
        {name:"C", annotationName:"C Room"},
        {name:"E 1", annotationName:"E Room"},
    ];

    let myRooms = [];
    for (let i = 0; i < requiredLabels.length; i++) {
        let newRoom = {
            room:requiredLabels[i],
            value:pn.noise(offset[i] + labelVal)
        }
            
        myRooms.push(newRoom);
    }
    myRooms = myRooms.sort((a,b) => a.value < b.value ? a : b)


    //now we need to assign rooms labels.  Go through the myRooms array,
    //returning to the beginning when you hit the end
    //Each space in filledSpace gets a name.
    let roomCount = 0;
    let cRoomIter = 1;
    fs.writeFileSync(filePath + "locations.js", "export default [\n");
    filledSpace.forEach(space => {
        let name, annotationName;
        if (space.name !== undefined) {
            name = space.name;
            annotationName = space.name;
        } else {
            annotationName = myRooms[roomCount % myRooms.length].room.annotationName;
            if (annotationName == "C Room")
                name = "C " + cRoomIter++;
            else
                name = myRooms[roomCount % myRooms.length].room.name;
        }
        let position = {x:0,y:0,z:0};
        position.x = (space.TL.x + space.BR.x) / 2;
        position.y = 0;
        position.z = (space.TL.y + space.BR.y) / 2;
        if (filledSpace.length == roomCount + 1) {
            fs.appendFileSync(filePath + "locations.js", `\t{\n\t\t"name": "${name}",\n\t\t"annotationName": "${annotationName}",\n\t\t"position": {\n\t\t\t"x": ${position.x},\n\t\t\t"y": ${position.y},\n\t\t\t"z": ${position.z}\n\t\t}\n\t}\n`)
        } else {
            fs.appendFileSync(filePath + "locations.js", `\t{\n\t\t"name": "${name}",\n\t\t"annotationName": "${annotationName}",\n\t\t"position": {\n\t\t\t"x": ${position.x},\n\t\t\t"y": ${position.y},\n\t\t\t"z": ${position.z}\n\t\t}\n\t},\n`)
        }
        roomCount++;
    });
    fs.appendFileSync(filePath + "locations.js", "]");
}

/**
 * Creates labels for each room
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {String} filePath The base path to the files we write to
 */
export function generateLabelsOld(filledSpace, filePath, labelBase = "room") {
    let nameCount = 1;
    fs.writeFileSync(filePath + "locations.js", "export default [\n");
    filledSpace.forEach(space => {
        let name;
        if (space.name !== undefined) {
            name = space.name;
        } else {
            name = labelBase + " " + nameCount;
        }
        let annotationName = name;
        let position = {x:0,y:0,z:0};
        position.x = (space.TL.x + space.BR.x) / 2;
        position.y = 0;
        position.z = (space.TL.y + space.BR.y) / 2;
        if (filledSpace.length == nameCount) {
            fs.appendFileSync(filePath + "locations.js", `\t{\n\t\t"name": "${name}",\n\t\t"annotationName": "${annotationName}",\n\t\t"position": {\n\t\t\t"x": ${position.x},\n\t\t\t"y": ${position.y},\n\t\t\t"z": ${position.z}\n\t\t}\n\t}\n`)
        } else {
            fs.appendFileSync(filePath + "locations.js", `\t{\n\t\t"name": "${name}",\n\t\t"annotationName": "${annotationName}",\n\t\t"position": {\n\t\t\t"x": ${position.x},\n\t\t\t"y": ${position.y},\n\t\t\t"z": ${position.z}\n\t\t}\n\t},\n`)
        }
        nameCount++;
    });
    fs.appendFileSync(filePath + "locations.js", "]");
}

/**
 * Creates an arrival json where one person arrives in each room.
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {String} filePath The base path to the files we write to
 */
export function arrivalOnePerRoom(filledSpace, filePath, labelBase = "room") {
    fs.writeFileSync(filePath + "arrivals.js", "export default [\n");
    for (let i = 1; i < filledSpace.length; i++) {
        let name = "EscapePerson";
        let type = name;
        let arrivalLocation = labelBase + " " + i;
        let arrivalTick = 10;
        let id = i - 1;
        
        if (i < filledSpace.length) {
            fs.appendFileSync(filePath + "arrivals.js", `\t{\n\t\t"name": "${name}",\n\t\t"type": "${type}",\n\t\t"arrivalLocation": "${arrivalLocation}",\n\t\t"arrivalTick": ${arrivalTick},\n\t\t"id": ${id}\n\t},\n`)
        } else {
            fs.appendFileSync(filePath + "arrivals.js", `\t{\n\t\t"name": "${name}",\n\t\t"type": "${type}",\n\t\t"arrivalLocation": "${arrivalLocation}",\n\t\t"arrivalTick": ${arrivalTick},\n\t\t"id": ${id}\n\t}\n`)
        }
    }
    fs.appendFileSync(filePath + "arrivals.js", "]");
}

/**
 * A debugging function to aid in visualizing an array of spaces.
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {String} filePath The base path to the files we write to
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 */
export function visualizeEmpty(emptySpace, filePath, vOffset) {
    let hOffset = 30;
    emptySpace.forEach(space => {
        vOffset = flatGenerator(Math.abs(space.BR.x - space.TL.x), Math.abs(space.BR.y - space.TL.y),
            "./" + filePath, {},
            (space.BR.x + space.TL.x) / 2, (space.BR.y + space.TL.y) / 2, hOffset, vOffset
        );
        hOffset += 10;
    });
    return vOffset;
}


/**
 * A function to apply rotation to a group of objects
 * @param {String} filePath The base path to the files we write to
 */
export async function adjustVertices(filePath) {
    const fileStream = fs.createReadStream(filePath + '.obj')

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    let fileContent = "";
    let adjustment = 0;

    for await (const line of rl) {
        if (line.includes("g")) {
            adjustment = Number(line.slice(2, line.length))
        } else if (line.includes('v ') && adjustment != 0) {
            //NOTE: This only pivots around the Y-Axis at the moment.
            let vals = line.split(' '), x, y, z;
            x = Math.cos(adjustment) * vals[1] + Math.sin(adjustment) * vals[3];
            y = vals[2];
            z = -Math.sin(adjustment) * vals[1] + Math.cos(adjustment) * vals[3];

            fileContent += `v ${x} ${y} ${z}\n`
        } else {
            fileContent += line + "\n";
        }
    }

    fs.writeFileSync(filePath + '.obj', fileContent)
}


export default {allocate, visualizeEmpty};