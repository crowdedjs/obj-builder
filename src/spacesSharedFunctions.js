import flatGenerator from "./flatGenerator.js"
import {makeRoom} from "./room.js"
import fs from 'fs';


export function allocate(filePath, filled, doorSize, isRoom, index, emptySpace, filledSpace, vOffset) {
    let alignedEdges = checkValidPartition(emptySpace[index], filled);
    cutSpace(emptySpace[index], filled, alignedEdges, emptySpace);

    if (isRoom) {
        vOffset = makeRoom(
            filled.BR.x - filled.TL.x, filled.BR.y - filled.TL.y, 2,
            [doorSize, doorSize, doorSize, doorSize], "./" + filePath,
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
        if (overlaps(filled, space)) {
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

export function visualizeEmpty(emptySpace, vOffset, hOffset) {
    emptySpace.forEach(space => {
        vOffset = flatGenerator(space.BR.x - space.TL.x, space.BR.y - space.TL.y,
            "./" + filePath, {},
            (space.BR.x + space.TL.x) / 2, (space.BR.y + space.TL.y) / 2, hOffset, vOffset
        );
        hOffset += 10;
    });
    return vOffset;
}


export default {allocate, visualizeEmpty};