import flatGenerator from "./flatGenerator.js"
import {makeRoom} from "./room.js"
import fs from 'fs';

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

function fillProcessing(dimension) {
    let count = 1;
    while (dimension / count > 15)
        count++
    return dimension / (count - 1);
}

export function basicFill(filePath, emptySpace, filledSpace, vOffset) {
    let width = fillProcessing(emptySpace[0].BR.x - emptySpace[0].TL.x);
    let length = fillProcessing(emptySpace[0].BR.y - emptySpace[0].TL.y);

    return fillHelper(filePath, emptySpace, filledSpace, vOffset, width, length);
}

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

export function threeHallFill(filePath, emptySpace, filledSpace, vOffset, halls) {
    let splitValue;

    console.log(halls)

    if (emptySpace[0].BR.x - emptySpace[0].TL.x > emptySpace[0].BR.y - emptySpace[0].TL.y) {
        splitValue = (emptySpace[0].BR.y - emptySpace[0].TL.y) / 2;
        if (!halls[0] || !halls[2]) {
            console.log("Location 1")
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:(emptySpace[0].TL.x + emptySpace[0].BR.x) / 2,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:(emptySpace[0].TL.x + emptySpace[0].BR.x) / 2,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else if (!halls[3]) {
            console.log("Location 2")
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y - splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else {
            console.log("Location 3")
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y - splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        }
    } else {
        splitValue = (emptySpace[0].BR.x - emptySpace[0].TL.x) / 2;
        if (!halls[1] || !halls[3]) {
            console.log("Location 4")
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:(emptySpace[0].TL.y + emptySpace[0].BR.y) / 2},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:(emptySpace[0].TL.y + emptySpace[0].BR.y) / 2},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else if (!halls[2]) {
            console.log("Location 5")
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].TL.y + splitValue},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x - splitValue,y:emptySpace[0].BR.y},isRoom:false})
            emptySpace.push({TL:{x:emptySpace[0].TL.x + splitValue,y:emptySpace[0].TL.y + splitValue},BR:{x:emptySpace[0].BR.x,y:emptySpace[0].BR.y},isRoom:false})
        } else {
            console.log("Location 6")
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

export function checkForHalls(filledSpace, filled) {
    let T = false, R = false, B = false, L = false;
    
    filledSpace.forEach(space => {
        if (space.BR.y == filled.TL.y && !space.isRoom)
            T = true;
        if (space.TL.x == filled.BR.x && !space.isRoom)
            R = true;
        if (space.TL.y == filled.BR.y && !space.isRoom)
            B = true;
        if (space.BR.x == filled.TL.x && !space.isRoom)
            L = true;
    });
    
    if (!T && !R && !B && !L) {
        return false;
    } else {
        return [T,R,B,L];
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

function overlaps(space1, space2) {
    if (space1.TL.x >= space2.BR.x || space2.TL.x >= space1.BR.x) {
        return false;
    } else if (space1.TL.y >= space2.BR.y || space2.TL.y >= space1.BR.y) {
        return false;
    }

    return true;
}

function deepCloneSpace(target, source) {
    target.TL.x = source.TL.x;
    target.BR.x = source.BR.x;
    target.TL.y = source.TL.y;
    target.BR.y = source.BR.y;
    target.isRoom = source.isRoom;
}

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

export function visualizeEmpty(emptySpace, filePath, vOffset, hOffset) {
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