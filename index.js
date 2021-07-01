import PerlinNoise from './node_modules/@mohayonao/perlin-noise/index.js'
import {improvedERLayout} from "./src/FloorPlans/improvedERLayout.js"


let w = 100;
let l = 100;
let maxRoomSize = 8;
let centerOpeningSize = 14;
let noiseVal = 0.543121271443701;
let i = 1;
let pn = new PerlinNoise()


improvedERLayout("src/FloorPlans/improvedER/", w, l, maxRoomSize, centerOpeningSize, noiseVal, i)
