import Event from "./Event.js"
import { workerData, parentPort } from "worker_threads"
import assets from "../assets/index.js"
import CrowdSimApp from "./CrowdSimApp.js"



var toRun = 0; //TODO change to workerData
let objValue = assets.objs;
let locationValue = assets.locations;
let locations = {
    mainEntrance: [],
    checkIn: [],
    cRoom: [],
    techPlace: [],
    nursePlace: [],
    ctRoom: [],
    residentStart: [],
    triageNursePlace: [],
    bDesk: []
};
let app = new CrowdSimApp();

app.bootMesh(objValue[toRun]);


locationValue[toRun].forEach(l => {
    if (l.annotationName == "Main Entrance") {
        locations.mainEntrance.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "Check In") {
        locations.checkIn.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "C Room") {
        locations.cRoom.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "Tech Place") {
        locations.techPlace.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "Nurse Place") {
        locations.nursePlace.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName.match(/CT [1-9][0-9]*/) != null) {
        locations.ctRoom.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "Resident Start") {
        locations.residentStart.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "Triage Nurse Place") {
        locations.triageNursePlace.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "B Desk") {
        locations.bDesk.push([l.position.x, l.position.y, l.position.z]);
    } else {
        console.log("Invalid Room: " + l.annotationName)
    }
})

let E1,E2,E3,E4,E5,E6,E7,E8,E9,E10,E11,E12,E13,E14,E15,E16,E17,E18,E19;

//(1) Patient is checked in:
    //MAIN ENTRANCE -> CHECK IN
E1 = new Event(app, [], [E2], locations, "mainEntrance", "checkIn")

//(2) PR:1, Patient is led to a C Room by a Nurse:
    //CHECK IN -> CLOSEST C ROOM
E2 = new Event(app, [E1], [E3,E4,E14,E15], locations, "checkIn", "cRoom")

//(3) PR:2, Tech in Patient's room goes to the TechPlace:
    //CHOSEN C ROOM -> TECHPLACE
E3 = new Event(app, [E2], [E5], locations, "cRoom", "techPlace")

//(4) PR:2, Nurse in Patient's room goes to the NursePlace:
    //CHOSEN C ROOM -> NURSEPLACE
E4 = new Event(app, [E2], [], locations, "cRoom", "nursePlace")

//(5) PR:3, Tech returns to Patient's C Room:
    //TECHPLACE -> CHOSEN C ROOM
E5 = new Event(app, [E3], [E6], locations, "techPlace", "cRoom")

//(6) PR:5, Tech takes Patient to a CT Room:
    //CHOSEN C ROOM -> CLOSEST CT ROOM
E6 = new Event(app, [E5], [E7,E17], locations, "cRoom", "ctRoom")

//(7) PR:6, Tech2 goes to TechPlace:
    //CHOSEN CT ROOM -> TECHPLACE
E7 = new Event(app, [E6], [E8], locations, "ctRoom", "techPlace")

//(8) PR:7, Tech2 returns to CT Room:
    //TECHPLACE -> CHOSEN CT ROOM
E8 = new Event(app, [E7], [E9], locations, "techPlace", "ctRoom")

//(9) PR:8, Tech2 takes Patient to C Room:
    //CHOSEN CT ROOM -> PREV. CHOSEN C ROOM
E9 = new Event(app, [E8], [E10,E11,E12], locations, "ctRoom", "cRoom")

//(10) PR:[9,19], Resident returns to ResidentStart:
    //CHOSEN C ROOM -> RESIDENTSTART
E10 = new Event(app, [E9, E19], [], locations, "cRoom", "residentStart")

//(11) PR:[9,19], Tech2 returns to TechPlace:
    //CHOSEN C ROOM -> TECHPLACE
E11 = new Event(app, [E9, E19], [], locations, "cRoom", "techPlace")

//(12) PR:[9,19], Nurse goes to Patient's C Room:
    //NURSEPLACE -> CHOSEN C ROOM
E12 = new Event(app, [E9, E19], [E13], locations, "nursePlace", "cRoom")

//(13) PR:12, Nurse takes Patient to Main Entrance (SIM DONE):
    //CHOSEN C ROOM -> MAIN ENTRANCE
E13 = new Event(app, [E12], [], locations, "cRoom", "mainEntrance")

//(14) PR:2, Nurse2 in Patient's room goes to the TriageNursePlace:
    //CHOSEN C ROOM -> TRIAGENURSEPLACE
E14 = new Event(app, [E2], [], locations, "cRoom", "triageNursePlace")

//(15) PR:2, Resident goes to Patient's C Room:
    //RESIDENTSTART -> CHOSEN C ROOM
E15 = new Event(app, [E2], [E16], locations, "residentStart", "cRoom")

//(16) PR:15, Resident returns to ResidentStart:
    //CHOSEN C ROOM -> RESIDENTSTART
E16 = new Event(app, [E15], [E17], locations, "cRoom", "residentStart")

//(17) PR:[6,16], Resident goes to B Desk (talk to Attending):
    //RESIDENTSTART -> B DESK
E17 = new Event(app, [E6, E16], [E18], locations, "residentStart", "bDesk")

//(18) PR:17, Resident returns to ResidentStart:
    //B DESK -> RESIDENTSTART
E18 = new Event(app, [E17], [E19], locations, "bDesk", "residentStart")

//(19) PR:18, Resident goes to C1 (patient might not be there):
    //RESIDENTSTART -> CHOSEN C ROOM
E19 = new Event(app, [E18], [E10,E11,E12], locations, "residentStart", "cRoom")

let EventList = [E1,E2,E3,E4,E5,E6,E7,E8,E9,E10,E11,E12,E13,E14,E15,E16,E17,E18,E19]
let distArr = [];


//Complete all events
let keepGoing;
do {
    keepGoing = false;
    EventList.forEach(e => {
        if(e.prereqsComplete() && !e.complete) {
            e.runEvent();
        } else if (!e.complete) {
            keepGoing = true;
        }
    })
} while (keepGoing);



//Starting from E1, explore next Event(s).  If we reach a leaf, push the total distance cost onto an array.
function recursiveEventResolution(event, totalDistance) {
    totalDistance += event.runEvent();
    if (event.nextEventList.length > 0) {
        event.nextEventList.forEach(e => {
            recursiveEventResolution(e, totalDistance)
        })
    } else {
        distArr.push(totalDistance);
    }
}

recursiveEventResolution(E1, 0);

console.log(distArr)


// parentPort.postMessage({
//     layoutNum: toRun + 1,
//     distance: Math.max(distArr)
// })
