import flatGenerator from "./flatGenerator.js"
import {makeRoom} from "./room.js"
import fs from 'fs';

/**
 * Fills all given empty spaces with rooms.
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 * @param {Float} width The width of the space to fill
 * @param {Float} length The length of the space to fill
 */
function fillHelper(filePath, emptySpace, filledSpace, vOffset, width, length) {
    while (emptySpace.length != 0) {
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
    
        let newSpace = {
            TL:{x:emptySpace[minIdx].TL.x, y:emptySpace[minIdx].TL.y},
            BR:{x:emptySpace[minIdx].TL.x + width, y:emptySpace[minIdx].TL.y + length},
            isRoom:true
        };

        
        if (newSpace.TL.x - newSpace.BR.x < 0 && newSpace.TL.y - newSpace.BR.y < 0) {
            vOffset = allocate(filePath, newSpace, 3, minIdx, emptySpace, filledSpace, vOffset);
        } else {
            console.log("Error")
            emptySpace.splice(minIdx, 1)
        }
    }
    return vOffset;
}

/**
 * Calculates the maximum number of rooms that can fit evenly in a space
 * @param {Float} dimension The length or width of the space to fill
 */
function fillProcessing(dimension) {
    let count = 1;
    while (dimension / count > 15)
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
export function basicFill(filePath, emptySpace, filledSpace, vOffset) {
    let width = fillProcessing(emptySpace[0].BR.x - emptySpace[0].TL.x);
    let length = fillProcessing(emptySpace[0].BR.y - emptySpace[0].TL.y);

    return fillHelper(filePath, emptySpace, filledSpace, vOffset, width, length);
}

/**
 * Fills a space with rooms in a line
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 */
export function lineFill(filePath, emptySpace, filledSpace, vOffset) {
    let width, length;

    if (emptySpace[0].BR.x - emptySpace[0].TL.x > emptySpace[0].BR.y - emptySpace[0].TL.y) {
        length = emptySpace[0].BR.y - emptySpace[0].TL.y;
        width = fillProcessing(emptySpace[0].BR.x - emptySpace[0].TL.x);
    } else {
        width = emptySpace[0].BR.x - emptySpace[0].TL.x;
        length = fillProcessing(emptySpace[0].BR.y - emptySpace[0].TL.y);
    }

    return fillHelper(filePath, emptySpace, filledSpace, vOffset, width, length);
}

/**
 * Fills a space that has halls on three sides with rooms
 * @param {String} filePath The base path to the files we write to
 * @param {Array} emptySpace An array of spaces that have yet to be filled
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {Integer} vOffset An integer that aids in the creation of vertices for objects
 * @param {*} halls An array of length four with booleans corresponding to which sides of the space have halls. TRBL.
 */
export function threeHallFill(filePath, emptySpace, filledSpace, vOffset, halls) {
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
        vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset)
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
export function fourHallFill(filePath, emptySpace, filledSpace, vOffset) {
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
        vOffset = lineFill(filePath, [emptySpace[i]], filledSpace, vOffset)
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
export function allocate(filePath, filled, doorSize, index, emptySpace, filledSpace, vOffset) {
    let hallEdges = checkForHalls(filledSpace, filled);
    let alignedEdges = checkValidPartition(emptySpace[index], filled);
    cutSpace(emptySpace[index], filled, alignedEdges, emptySpace);

    if (filled.isRoom && hallEdges) {
        vOffset = makeRoom(
            filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y, 2,
            hallEdges.map(x => x * doorSize), "./" + filePath,
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset
        );
    } else if (filled.isRoom) {
        vOffset = makeRoom(
            filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y, 2,
            [0,0,0,0], "./" + filePath,
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset
        );
    } else {
        vOffset = flatGenerator(filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y,
            "./" + filePath, {},
            (filled.BR.x + filled.TL.x) / 2, (filled.BR.y + filled.TL.y) / 2, 0, vOffset
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

/**
 * Creates labels for each room
 * @param {Array} filledSpace An array of spaces that have already been filled
 * @param {String} filePath The base path to the files we write to
 */
export function generateLabels(filledSpace, filePath) {
    let nameCount = 1;
    fs.writeFileSync(filePath + "Labels.json", "[\n");
    filledSpace.forEach(space => {
        let name = "room " + nameCount++;
        let annotationName = name;
        let position = {x:0,y:0,z:0};
        position.x = (space.TL.x + space.BR.x) / 2;
        position.y = (space.TL.y + space.BR.y) / 2;
        //may need to change position.z
        position.z = 0;
        if (filledSpace.length >= nameCount) {
            fs.appendFileSync(filePath + "Labels.json", `\t{\n\t\t"name": "${name}",\n\t\t"annotationName": "${annotationName}",\n\t\t"position": {\n\t\t\t"x": ${position.x},\n\t\t\t"y": ${position.y},\n\t\t\t"z": ${position.z}\n\t\t}\n\t},\n`)
        } else {
            fs.appendFileSync(filePath + "Labels.json", `\t{\n\t\t"name": "${name}",\n\t\t"annotationName": "${annotationName}",\n\t\t"position": {\n\t\t\t"x": ${position.x},\n\t\t\t"y": ${position.y},\n\t\t\t"z": ${position.z}\n\t\t}\n\t}\n`)
        }
    });
    fs.appendFileSync(filePath + "Labels.json", "]");
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


export default {allocate, visualizeEmpty};