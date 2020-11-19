import flatGenerator from "./src/flatGenerator.js"
import fs from "fs";
console.log(flatGenerator(10, 20))
fs.writeFileSync("./index.obj", flatGenerator(10, 20));

export {flatGenerator};