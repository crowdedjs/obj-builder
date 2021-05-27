import fs from "fs";
import Zone from "../zone.js"


export function improvedERLayout(filePath = "test", w = 100, l = 100, maxRoomSize = 10, count = "") {
    // fs.writeFileSync(filePath + `objs/_${count}layout.obj`, "\n");
    // fs.writeFileSync(filePath + `objs/_${count}layout.js`, "export default\n`");
    
    const RSW = (w - 15)/6;
    const RSL = (l - 18)/7;
    const LEFT = -w/2;
    const TOP = -l/2;
    const HW = 3;
    

    let Z1  = new Zone(1, [LEFT + 1*RSW + 0.5*HW, TOP + 0.5*RSL + 0*HW, 0], 2)
    let Z2  = new Zone(2, [0                    , TOP + 0.5*RSL + 0*HW, 0], 2)
    let Z3  = new Zone(3, [LEFT + 5*RSW + 4.5*HW, TOP + 0.5*RSL + 0*HW, 0], 2)
    let Z4  = new Zone(4, [LEFT + 0.5*RSW + 0*HW, TOP + 2*RSL + 1.5*HW, 0], 1)
    let Z5  = new Zone(5, [LEFT + 1.5*RSW + 1*HW, TOP + 2*RSL + 1.5*HW, 0], 1)
    let Z6  = new Zone(6, [0                    , TOP + 1.5*RSL + 1*HW, 0], 2)
    let Z7  = new Zone(7, [LEFT + 4.5*RSW + 4*HW, TOP + 2*RSL + 1.5*HW, 0], 3)
    let Z8  = new Zone(8, [LEFT + 5.5*RSW + 5*HW, TOP + 2*RSL + 1.5*HW, 0], 3)
    let Z9  = new Zone(9, [LEFT + 0.5*RSW + 0*HW, TOP + 4*RSL + 3.5*HW, 0], 1)
    let Z10 = new Zone(10, [LEFT + 1.5*RSW + 1*HW, TOP + 4*RSL + 3.5*HW, 0], 1)
    let Z11 = new Zone(11, [0                    , TOP + 4.5*RSL + 4*HW, 0], 2)
    let Z12 = new Zone(12, [LEFT + 4.5*RSW + 4*HW, TOP + 4*RSL + 3.5*HW, 0], 3)
    let Z13 = new Zone(13, [LEFT + 5.5*RSW + 5*HW, TOP + 4*RSL + 3.5*HW, 0], 3)
    let Z14 = new Zone(14, [LEFT + 4.5*RSW + 4*HW, TOP + 6*RSL + 5.5*HW, 0], 3)
    let Z15 = new Zone(15, [LEFT + 5.5*RSW + 5*HW, TOP + 6*RSL + 5.5*HW, 0], 3)

    let zones = [Z1, Z2, Z3, Z4, Z5, Z6, Z7, Z8, Z9, Z10, Z11, Z12, Z13, Z14, Z15]

    Z1.updateAdjacencies([Z2,Z4,Z5])
    Z2.updateAdjacencies([Z1,Z3,Z6])
    Z3.updateAdjacencies([Z2,Z7,Z8])
    Z4.updateAdjacencies([Z1,Z5,Z9])
    Z5.updateAdjacencies([Z1,Z4,Z6,Z10])
    Z6.updateAdjacencies([Z2,Z5,Z7])
    Z7.updateAdjacencies([Z3,Z6,Z8,Z12])
    Z8.updateAdjacencies([Z3,Z7,Z13])
    Z9.updateAdjacencies([Z4,Z10])
    Z10.updateAdjacencies([Z5,Z9,Z11])
    Z11.updateAdjacencies([Z10,Z12])
    Z12.updateAdjacencies([Z7,Z11,Z13])
    Z13.updateAdjacencies([Z8,Z12,Z15])
    Z14.updateAdjacencies([Z12,Z15])
    Z15.updateAdjacencies([Z13,Z14])

    //Decide on two zones to become Triage and Fast Track
    let entryZones = [Z9, Z10, Z11, Z14]
    let randnum = Math.floor(Math.random()*4)
    entryZones[randnum].assignType("Triage")
    entryZones.splice(randnum, 1)
    randnum = Math.floor(Math.random()*3)
    entryZones[randnum].assignType("Fast Track")
    entryZones.splice(randnum, 1)

    let toSplice = []
    zones.forEach((z, i) => { if (z.zoneType !== undefined) { toSplice.push(i) } })
    zones.splice(toSplice.pop(),1)
    zones.splice(toSplice.pop(),1)


    let zoneTypes = [
        {type: "C", num: 5},
        {type: "E", num: 4},
        {type: "Trauma", num: 2},
        {type: "CT", num: 1},
        {type: "XRay", num: 1},
    ]
    let ourZones = [];

    do {
        if (zoneTypes.length > 0) {
            recursiveZoning(zones[Math.floor(Math.random()*zones.length)], zoneTypes[0].num, [])
            console.log("\nzones: " + zones.length)
            console.log("ourzones: " + ourZones.length)
            console.log(zoneTypes[0])
            if (ourZones.length == zoneTypes[0].num) {
                ourZones.forEach(z => { z.assignType(zoneTypes[0].type) })
                zoneTypes.splice(0, 1);
                ourZones = []
            }
            zones.forEach((z, i) => { z.updateVisited(false); if (z.zoneType !== undefined) { toSplice.push(i) } })
            while (toSplice.length > 0) {
                zones.splice(toSplice.pop(),1)
            }
        } else {
            break;
        }
    } while (zones.length > 0)


    zones = [Z1, Z2, Z3, Z4, Z5, Z6, Z7, Z8, Z9, Z10, Z11, Z12, Z13, Z14, Z15]
    zones.forEach(z => {
        //TODO design fillZone
        fillZone(filePath, z, RSW, RSL, maxRoomSize, count)
    });


    function recursiveZoning(zone, goal, zoneTracker) {
        if (goal == 1) {
            ourZones.push(zone)
            return;
        }

        zone.updateVisited(true)
        
        if (zoneTracker.length == goal) {
            if (ourZones.length != goal) {
                ourZones = zoneTracker;
            }
            return;
        }

        zoneTracker.push(zone)
        
        zone.adjacentZones.forEach(az => {
            // if (!az.visited && az.zoneType === undefined) {
            if (!az.visited && zones.indexOf(az) != -1) {
                recursiveZoning(az, goal, zoneTracker)
            }
        })
    }
}
