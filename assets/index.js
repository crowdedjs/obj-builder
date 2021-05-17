import arrivalHospital from "./arrivals/arrivalsOne.js"

import L1 from "./locations/_1locations.js"
import L2 from "./locations/_2locations.js"
import L3 from "./locations/_3locations.js"
import L4 from "./locations/_4locations.js"
import L5 from "./locations/_5locations.js"
import L6 from "./locations/_6locations.js"
import L7 from "./locations/_7locations.js"
import L8 from "./locations/_8locations.js"
import L9 from "./locations/_9locations.js"
import L10 from "./locations/_10locations.js"
import L11 from "./locations/_11locations.js"
import L12 from "./locations/_12locations.js"
import L13 from "./locations/_13locations.js"
import L14 from "./locations/_14locations.js"
import L15 from "./locations/_15locations.js"
import L16 from "./locations/_16locations.js"
import L17 from "./locations/_17locations.js"
import L18 from "./locations/_18locations.js"
import L19 from "./locations/_19locations.js"
import L20 from "./locations/_20locations.js"

import O1 from "./objs/_1layout.js"
import O2 from "./objs/_2layout.js"
import O3 from "./objs/_3layout.js"
import O4 from "./objs/_4layout.js"
import O5 from "./objs/_5layout.js"
import O6 from "./objs/_6layout.js"
import O7 from "./objs/_7layout.js"
import O8 from "./objs/_8layout.js"
import O9 from "./objs/_9layout.js"
import O10 from "./objs/_10layout.js"
import O11 from "./objs/_11layout.js"
import O12 from "./objs/_12layout.js"
import O13 from "./objs/_13layout.js"
import O14 from "./objs/_14layout.js"
import O15 from "./objs/_15layout.js"
import O16 from "./objs/_16layout.js"
import O17 from "./objs/_17layout.js"
import O18 from "./objs/_18layout.js"
import O19 from "./objs/_19layout.js"
import O20 from "./objs/_20layout.js"

import bestLayout from "./objs/best.js"
import bestLocs from "./locations/bestGen100Loc.js"

export default {
    arrivals: [arrivalHospital],
    locations: [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20],
    objs: [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20],
    best: [bestLayout, bestLocs]
}
