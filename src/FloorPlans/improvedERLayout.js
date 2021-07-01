import fs from "fs";
import Zone from "./zone.js"
import { makeWalls } from "../ProcGen/outerWalls.js";
import flatGenerator from "../ProcGen/flatGenerator.js";
import { zoneFill, generateZoneLabels } from "../ProcGen/spacesSharedFunctions.js"
import PerlinNoise from '../../node_modules/@mohayonao/perlin-noise/index.js'
//IMPORTANT: The perlin noise used in this project is reseeded every time it is made.
    //This can be changed by editing the "rand" variable to be static.


let zoneLocCount;

export function improvedERLayout(filePath = "test", w = 140, l = 140, maxRoomSize = 10, centerOpeningSize = 10, noiseVal = 0.5, count = "") {
    fs.writeFileSync(filePath + `objs/_${count}layout` + `.obj`, "\n");
    fs.writeFileSync(filePath + `objs/_${count}layout` + `.js`, "export default\n`");
    
    const HW = 4;
    const RSW = (w - HW * 5) / 6;
    const RSL = (l - HW * 6) / 7;
    const LEFT = -w / 2;
    const TOP = -l / 2;
    
    
    let Z1  = new Zone( 1, [LEFT + 1 * RSW + 0.5 * HW, TOP + 0.5 * RSL + 0 * HW, 0], 2)
    let Z2  = new Zone( 2, [0,                         TOP + 0.5 * RSL + 0 * HW, 0], 2)
    let Z3  = new Zone( 3, [LEFT + 5 * RSW + 4.5 * HW, TOP + 0.5 * RSL + 0 * HW, 0], 2)
    let Z4  = new Zone( 4, [LEFT + 0.5 * RSW + 0 * HW, TOP + 2 * RSL + 1.5 * HW, 0], 1)
    let Z5  = new Zone( 5, [LEFT + 1.5 * RSW + 1 * HW, TOP + 2 * RSL + 1.5 * HW, 0], 1)
    let Z6  = new Zone( 6, [0,                         TOP + 1.5 * RSL + 1 * HW, 0], 2)
    let Z7  = new Zone( 7, [LEFT + 4.5 * RSW + 4 * HW, TOP + 2 * RSL + 1.5 * HW, 0], 3)
    let Z8  = new Zone( 8, [LEFT + 5.5 * RSW + 5 * HW, TOP + 2 * RSL + 1.5 * HW, 0], 3)
    let Z9  = new Zone( 9, [LEFT + 0.5 * RSW + 0 * HW, TOP + 4 * RSL + 3.5 * HW, 0], 1)
    let Z10 = new Zone(10, [LEFT + 1.5 * RSW + 1 * HW, TOP + 4 * RSL + 3.5 * HW, 0], 1)
    let Z11 = new Zone(11, [0,                         TOP + 4.5 * RSL + 4 * HW, 0], 2)
    let Z12 = new Zone(12, [LEFT + 4.5 * RSW + 4 * HW, TOP + 4 * RSL + 3.5 * HW, 0], 3)
    let Z13 = new Zone(13, [LEFT + 5.5 * RSW + 5 * HW, TOP + 4 * RSL + 3.5 * HW, 0], 3)
    let Z14 = new Zone(14, [LEFT + 4.5 * RSW + 4 * HW, TOP + 6 * RSL + 5.5 * HW, 0], 3)
    let Z15 = new Zone(15, [LEFT + 5.5 * RSW + 5 * HW, TOP + 6 * RSL + 5.5 * HW, 0], 3)
    
    //excludes Z9, which is set to be an "A" zone
    let zones = [Z1, Z2, Z3, Z4, Z5, Z6, Z7, Z8, Z10, Z11, Z12, Z13, Z14, Z15]

    Z1.updateAdjacencies([Z2, Z4, Z5])
    Z2.updateAdjacencies([Z1, Z3, Z6])
    Z3.updateAdjacencies([Z2, Z7, Z8])
    Z4.updateAdjacencies([Z1, Z5, Z9])
    Z5.updateAdjacencies([Z1, Z4, Z6, Z10])
    Z6.updateAdjacencies([Z2, Z5, Z7])
    Z7.updateAdjacencies([Z3, Z6, Z8, Z12])
    Z8.updateAdjacencies([Z3, Z7, Z13])
    Z9.updateAdjacencies([Z4, Z10])
    Z10.updateAdjacencies([Z5, Z9, Z11])
    Z11.updateAdjacencies([Z10, Z12])
    Z12.updateAdjacencies([Z7, Z11, Z13])
    Z13.updateAdjacencies([Z8, Z12, Z15])
    Z14.updateAdjacencies([Z12, Z15])
    Z15.updateAdjacencies([Z13, Z14])

    let toSplice = []
    let zoneTypes = [
        { type: "C", num: 4 },
        { type: "E", num: 4 },
        { type: "Trauma", num: 2 },
        { type: "CT", num: 1 },
        { type: "XRay", num: 1 },
        { type: "Triage", num: 1 },
        { type: "Fast Track", num: 1 },
    ]
    zoneLocCount = [
        { type: "C", count: 1 },
        { type: "E", count: 1 },
        { type: "Trauma", count: 1 },
        { type: "CT", count: 1 },
        { type: "XRay", count: 1 },
        { type: "Triage", count: 1 },
        { type: "Fast Track", count: 1 },
        { type: "A", count: 1 },
    ]
    let ourZones = [];


    Z9.assignType("A")

    let iterCount = 0;
    do {
        if (zoneTypes.length > 0) {
            let pn = new PerlinNoise();
            let rand = Math.floor(pn.noise(noiseVal + iterCount / 13) * zones.length)
            iterCount++;
            recursiveZoning(zones[rand], zoneTypes[0].num, [], [zones[rand].id])
            if (ourZones.length == zoneTypes[0].num) {
                ourZones.forEach(z => { z.assignType(zoneTypes[0].type) })
                zoneTypes.splice(0, 1);
                ourZones = []
            }
            zones.forEach((z, i) => { if (z.zoneType !== undefined) { toSplice.push(i) } })
            while (toSplice.length > 0) {
                zones.splice(toSplice.pop(), 1)
            }
        } else {
            break;
        }
    } while (zones.length > 0)


    let vOffset = makeWalls(
        w, l, 3,
        [[w], [l], [w / 2 - 5, w / 2 - 5], [l * 0.855 - 5, l * 0.145 - 5]],
        10, filePath,
        0, 0, 0, 0, count
    );

    vOffset = flatGenerator(w + 30, l + 30,
        filePath, {},
        0, 0, 0, vOffset, count
    );

    //walls for the central area
    let innerX = RSW * 2 + HW
    let innerY = RSL * 2 + HW
    vOffset = makeWalls(
        innerX, innerY, 1,
        [[(innerX - centerOpeningSize)/2, (innerX - centerOpeningSize)/2], [(innerY - centerOpeningSize)/2, (innerY - centerOpeningSize)/2], [innerX], [(innerY - centerOpeningSize)/2, (innerY - centerOpeningSize)/2]],
        centerOpeningSize, filePath,
        0, -(RSL + HW) / 2, 0, vOffset, count
    );

    zones = [Z1, Z2, Z3, Z4, Z5, Z6, Z7, Z8, Z9, Z10, Z11, Z12, Z13, Z14, Z15]
    fs.writeFileSync(filePath + "locations/_" + count + "locations.js", "export default [\n");
    zones.forEach(z => {
        vOffset = fillZone(filePath, z, RSW, RSL, maxRoomSize, count, vOffset)
    });

    //Waiting Room
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "Waiting Room",\n\t\t"annotationName": "Waiting Room",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 1 * RSW + 0.5 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 6 * RSL + 5.5 * HW}\n\t\t}\n\t},\n`)
    //TriageNursePlace
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "TriageNursePlace",\n\t\t"annotationName": "TriageNursePlace",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 3 * RSW + 2.5 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 5.5 * RSL + 5 * HW}\n\t\t}\n\t},\n`)
    //Greeter Nurse Wait
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "Greeter Nurse Wait",\n\t\t"annotationName": "Greeter Nurse Wait",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 3 * RSW + 3 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 6.5 * RSL + 6 * HW}\n\t\t}\n\t},\n`)
    //Check In
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "Check In",\n\t\t"annotationName": "Check In",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 3 * RSW + 2.5 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 6 * RSL + 5 * HW}\n\t\t}\n\t},\n`)
    //Main Entrance
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "Main Entrance",\n\t\t"annotationName": "Main Entrance",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 3 * RSW + 2.5 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 7 * RSL + 6 * HW}\n\t\t}\n\t},\n`)
    //Ambulance Entrance
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "Ambulance Entrance",\n\t\t"annotationName": "Ambulance Entrance",\n\t\t"position": {\n\t\t\t"x": ${LEFT},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 6 * RSL + 5.5 * HW}\n\t\t}\n\t},\n`)


    //Tech Start
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "Tech Start",\n\t\t"annotationName": "Tech Start",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 2.5 * RSW + 2 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 2.5 * RSL + 2 * HW}\n\t\t}\n\t},\n`)
    //Resident Start
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "Resident Start",\n\t\t"annotationName": "Resident Start",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 3.5 * RSW + 3 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 2.5 * RSL + 2 * HW}\n\t\t}\n\t},\n`)
    //TechPlace
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "TechPlace",\n\t\t"annotationName": "TechPlace",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 2.5 * RSW + 2 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 3.5 * RSL + 3 * HW}\n\t\t}\n\t},\n`)
    //NursePlace
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "NursePlace",\n\t\t"annotationName": "NursePlace",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 3.5 * RSW + 3 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 3.5 * RSL + 3 * HW}\n\t\t}\n\t},\n`)
    //B Desk
    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", `\t{\n\t\t"name": "B Desk",\n\t\t"annotationName": "B Desk",\n\t\t"position": {\n\t\t\t"x": ${LEFT + 3 * RSW + 2.5 * HW},\n\t\t\t"y": 0,\n\t\t\t"z": ${TOP + 3 * RSL + 2.5 * HW}\n\t\t}\n\t},\n`)



    fs.appendFileSync(filePath + "locations/_" + count + "locations.js", "]");
    fs.appendFileSync(filePath + `objs/_${count}layout.js`, "\n`");



    function recursiveZoning(zone, goal, zoneTracker, visitedIDs) {
        if (ourZones.length != goal) {
            if (!zoneTracker.some(z => z.id == zone.id)) {
                zoneTracker.push(zone)
            }
            if (zoneTracker.length == goal) {
                ourZones = zoneTracker;
                return;
            }
            zone.adjacentZones.forEach(az => {
                if (!visitedIDs.some(id => id == az.id) && zones.indexOf(az) != -1) {
                    recursiveZoning(az, goal, zoneTracker, visitedIDs.concat([az.id]))
                }
            })
        } else {
            return;
        }
    }
}



function fillZone(filePath, zone, RSW, RSL, maxRoomSize, count, vOffset) {
    fs.appendFileSync(filePath + `objs/_${count}layout.obj`, "\n");

    let sideA, sideB;
    let filledSpace = [];

    if (zone.zoneType == "A" || zone.zoneType == "Trauma" || zone.zoneType == "XRay" || zone.zoneType == "CT") {
        maxRoomSize += 4
    }

    if (zone.doorwaySide == 1) { //R
        sideA = RSL * 2 + 3;
        sideB = RSW;
        vOffset = zoneFill(filePath + "",
            [{ TL: { x: zone.spatialOffset[0] - sideB / 2, y: zone.spatialOffset[1] - sideA / 2 },
               BR: { x: zone.spatialOffset[0] + sideB / 2, y: zone.spatialOffset[1] + sideA / 2 } }],
            filledSpace, vOffset, maxRoomSize, count, [0,3,0,0])
    } else if (zone.doorwaySide == 2) { //B
        sideA = RSL;
        sideB = RSW * 2 + 3;
        vOffset = zoneFill(filePath + "",
            [{ TL: { x: zone.spatialOffset[0] - sideB / 2, y: zone.spatialOffset[1] - sideA / 2 },
               BR: { x: zone.spatialOffset[0] + sideB / 2, y: zone.spatialOffset[1] + sideA / 2 } }],
            filledSpace, vOffset, maxRoomSize, count, [0,0,3,0])
    } else { //L
        sideA = RSL * 2 + 3;
        sideB = RSW;
        vOffset = zoneFill(filePath + "",
            [{ TL: { x: zone.spatialOffset[0] - sideB / 2, y: zone.spatialOffset[1] - sideA / 2 },
               BR: { x: zone.spatialOffset[0] + sideB / 2, y: zone.spatialOffset[1] + sideA / 2 } }],
            filledSpace, vOffset, maxRoomSize, count, [0,0,0,3])
    }

    let nameCount = zoneLocCount.find(z => { if (z.type == zone.zoneType) { return z.count } } )
    let numLabeled = generateZoneLabels(filledSpace, filePath + `locations/_${count}`, zone.zoneType, nameCount.count)
    zoneLocCount.find(z => { if (z.type == zone.zoneType) { z.count = numLabeled } } )
    return vOffset;
}
