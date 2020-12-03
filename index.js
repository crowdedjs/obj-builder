import flatGenerator from "./src/flatGenerator.js"
import fs from "fs";
//console.log(flatGenerator(10, 20,{}))
flatGenerator(10, 20,"./runs/base", {});

export {flatGenerator};