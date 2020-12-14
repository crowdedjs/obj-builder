import flatGenerator from "./src/flatGenerator.js"
import wallGenerator from "./src/wallGenerator.js"
// import fs from "fs";
//console.log(flatGenerator(10, 20,{}))
// flatGenerator(10, 20, "./runs/base", {});
wallGenerator(5, 5, 5, "./runs/base", {}, 10, 10, 10);

// export {flatGenerator};
export {wallGenerator};