import Event from "./Event.js"
import assets from "../../assets/index.js"
import CrowdSimApp from "./CrowdSimApp.js"


let testInfo = assets.desTestInfo;
let locations = {
    start: [],
    end: []
};
let app = new CrowdSimApp();

app.bootMesh(testInfo[0]);


testInfo[1].forEach(l => {
    if (l.annotationName == "start") {
        locations.start.push([l.position.x, l.position.y, l.position.z]);
    } else if (l.annotationName == "end") {
        locations.end.push([l.position.x, l.position.y, l.position.z])
    }
})
// console.log(locations)


let E1 = new Event(app, "E1", locations, "start", "end")

// console.log("--------------------------------------")
// console.log(E1.startKey + " -> " + E1.destinationKey)
// console.log("--------------------------------------")


// console.log(E1.runEvent())
// console.log(locations)
