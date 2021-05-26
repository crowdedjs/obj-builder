import fs from "fs";
import Zone from "../zone.js"


export function improvedERLayout(filePath = "test", w = 100, l = 100, maxRoomSize = 10, labelVal = 1, count = "") {
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

    let zoneTypes = [
        {type: "C", num: 5},
        {type: "E", num: 4},
        {type: "Trauma", num: 2},
        {type: "CT", num: 1},
        {type: "XRay", num: 1},
    ]


    do {
        console.log(zoneTypes.length)
        for (let i = 0; i < zones.length; i++) {
            if (zones[i].zoneType === undefined) {
                let ourZones = recursiveZoning(zones[i], [], zoneTypes[0].num)
                if (ourZones !== undefined) {
                    zoneTypes.splice(0, 1);
                    ourZones.forEach(z => { z.assignType(zoneTypes[0]) })
                }
                zones.forEach(z => { z.updateVisited(false) })
            } else {
                zones.splice(i, 1)
                break;
            }
        }
    } while (zones.length > 0)

    console.log(`${Z1.id} - ${Z1.zoneType}`)
    console.log(`${Z2.id} - ${Z2.zoneType}`)
    console.log(`${Z3.id} - ${Z3.zoneType}`)
    console.log(`${Z4.id} - ${Z4.zoneType}`)
    console.log(`${Z5.id} - ${Z5.zoneType}`)
    console.log(`${Z6.id} - ${Z6.zoneType}`)
    console.log(`${Z7.id} - ${Z7.zoneType}`)
    console.log(`${Z8.id} - ${Z8.zoneType}`)
    console.log(`${Z9.id} - ${Z9.zoneType}`)
    console.log(`${Z10.id} - ${Z10.zoneType}`)
    console.log(`${Z11.id} - ${Z11.zoneType}`)
    console.log(`${Z12.id} - ${Z12.zoneType}`)
    console.log(`${Z13.id} - ${Z13.zoneType}`)
    console.log(`${Z14.id} - ${Z14.zoneType}`)
    console.log(`${Z15.id} - ${Z15.zoneType}`)

}


function recursiveZoning(zone, adjacentFreeZones, goal) {
    zone.updateVisited(true)
    adjacentFreeZones.push(zone)

    if (adjacentFreeZones.length == goal) {
        return adjacentFreeZones;
    }

    zone.adjacentZones.forEach(az => {
        if (!az.visited) {
            recursiveZoning(az, adjacentFreeZones)
        }
    })
}