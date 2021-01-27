import { fillSpaceWithRooms } from "./src/fillSpaceWithRooms.js";
import { innerCircleLayout } from "./src/innerCircleLayout.js";
import flatGenerator from "./src/flatGenerator.js"
import wallGenerator from "./src/wallGenerator.js"
import { HLayout } from "./src/HLayout.js";
import { YLayout } from "./src/YLayout.js";
import { makeRoom } from "./src/room.js";


let hallWidth = 3;
let w = 100;
let l = 100;
let midRatio = 3/4;

// fillSpaceWithRooms("./runs/BasicFilledSpace");
innerCircleLayout("./runs/InnerCircle", hallWidth, w, l, midRatio);
// HLayout("./runs/HLayout");
// YLayout("./runs/YLayout");
