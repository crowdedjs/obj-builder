import flatGenerator from "./flatGenerator.js"
import wallGenerator from "./wallGenerator.js"
import fs from 'fs';


var baseName = "../runs/room/room";
var vOffset = 0;

fs.writeFileSync(`${baseName}.obj`, "\n");
fs.writeFileSync(`${baseName}.mtl`, "\n");

var width = 10;
var length = 30;
var wallHeight = 3;
var wallWidth = 1;

vOffset = flatGenerator(width, length, baseName, {}, 0, 0, vOffset);
vOffset = wallGenerator(wallWidth, wallHeight, length+1, baseName, {}, width/2, wallHeight/2, 0, vOffset);
vOffset = wallGenerator(wallWidth, wallHeight, length+1, baseName, {}, -width/2, wallHeight/2, 0, vOffset);
vOffset = wallGenerator(width+1, wallHeight, wallWidth, baseName, {}, 0, wallHeight/2, length/2, vOffset);
vOffset = wallGenerator(width+1, wallHeight, wallWidth, baseName, {}, 0, wallHeight/2, -length/2, vOffset);

export {flatGenerator};
export {wallGenerator};