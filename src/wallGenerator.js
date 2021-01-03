import is from "is_js";
import Canvas from 'canvas';
import fs from 'fs';
import textureDefaults from './textureDefaults.js'
import getFileBase from './getFileBase.js'


/**
 * Remove leading and trailing white space on every line of the obj file. 
 * @param {string-like} objString The obj string to be cleaned.
 */
function clean(objString) {
  return objString.trim().split("/\r?\n/").map(s => s.trim()).join("\n");
}



/**
 * Create a box object with the given width, length, and height. The upper-right point will be at (width/2, height/2)
 * @param {number-like} width The width of the obj
 * @param {number-like} height The height of the obj
 */
function wallGenerator(width, length, height, baseName, textureOptions, wOffset = 0, lOffset = 0, hOffset = 0, vOffset = 0) {
  if (!is.all.finite([width, length, height, wOffset, lOffset, hOffset]) || !is.all.positive([width, length, height]) || !is.string(baseName) || arguments.length < 5 || arguments.length > 9) throw new "Invalid arguments."

  let fileBase = getFileBase(baseName);
  //let folderBase = getFolderBase(baseName);

  //First generate the wavefront obj file
  let obj =
    `
o object${vOffset}
v ${(width / 2) + wOffset} ${(height / 2) + hOffset} ${(length / 2) + lOffset}
v ${(width / 2) + wOffset} ${(height / 2) + hOffset} ${-(length / 2) + lOffset}
v ${(width / 2) + wOffset} ${-(height / 2) + hOffset} ${(length / 2) + lOffset}
v ${(width / 2) + wOffset} ${-(height / 2) + hOffset} ${-(length / 2) + lOffset}
v ${-(width / 2) + wOffset} ${(height / 2) + hOffset} ${(length / 2) + lOffset}
v ${-(width / 2) + wOffset} ${(height / 2) + hOffset} ${-(length / 2) + lOffset}
v ${-(width / 2) + wOffset} ${-(height / 2) + hOffset} ${(length / 2) + lOffset}
v ${-(width / 2) + wOffset} ${-(height / 2) + hOffset} ${-(length / 2) + lOffset}
vt 1 1
vt 1 0
vt 0 1
vt 0 0
vt 0 1
vt 1 1
vt 0 0
vt 0 1
vn 0 1 0
usemtl texture${vOffset}
s off
f ${2 + vOffset}/${2 + vOffset}/${1 + vOffset} ${1 + vOffset}/${1 + vOffset}/${1 + vOffset} ${5 + vOffset}/${5 + vOffset}/${1 + vOffset} ${6 + vOffset}/${6 + vOffset}/${1 + vOffset}
f ${3 + vOffset}/${3 + vOffset}/${1 + vOffset} ${4 + vOffset}/${4 + vOffset}/${1 + vOffset} ${8 + vOffset}/${8 + vOffset}/${1 + vOffset} ${7 + vOffset}/${7 + vOffset}/${1 + vOffset}
f ${6 + vOffset}/${6 + vOffset}/${1 + vOffset} ${5 + vOffset}/${5 + vOffset}/${1 + vOffset} ${7 + vOffset}/${7 + vOffset}/${1 + vOffset} ${8 + vOffset}/${8 + vOffset}/${1 + vOffset}
f ${1 + vOffset}/${1 + vOffset}/${1 + vOffset} ${2 + vOffset}/${2 + vOffset}/${1 + vOffset} ${4 + vOffset}/${4 + vOffset}/${1 + vOffset} ${3 + vOffset}/${3 + vOffset}/${1 + vOffset}
f ${1 + vOffset}/${1 + vOffset}/${1 + vOffset} ${3 + vOffset}/${3 + vOffset}/${1 + vOffset} ${7 + vOffset}/${7 + vOffset}/${1 + vOffset} ${5 + vOffset}/${5 + vOffset}/${1 + vOffset}
f ${4 + vOffset}/${4 + vOffset}/${1 + vOffset} ${2 + vOffset}/${2 + vOffset}/${1 + vOffset} ${6 + vOffset}/${6 + vOffset}/${1 + vOffset} ${8 + vOffset}/${8 + vOffset}/${1 + vOffset}
 \n`;
 
  fs.appendFileSync(`${baseName}.obj`, obj);

  //Second generate the mtl file

  let mtl = `
  newmtl texture${vOffset}
  Ka 0 0 0
  Kd 1 1 1
  map_Ka ${fileBase}${vOffset}.jpg
  map_Kd ${fileBase}${vOffset}.jpg
  `;

  fs.appendFileSync(`${baseName}.mtl`, mtl);





  //Now generate the texture
  //We do this by creating a html canvas-like object
  //Drawing to the canvas
  //Then saving the result as a png file


  let dpu = textureDefaults.dotsPerUnit
  let maxDim = Math.max(width, length, height);
  let dimensions = maxDim * dpu;

  const canvas = Canvas.createCanvas(dimensions, dimensions);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, dimensions, dimensions);

  ctx.save();
  ctx.scale(dpu, dpu);
  ctx.translate(maxDim / 2, maxDim / 2);

  for (let i = Math.ceil(maxDim / 2); i > -Math.ceil(maxDim / 2); i--) {
    ctx.strokeStyle = "black";
    if (i == 0)
      ctx.strokeStyle = "green"

    ctx.lineWidth = textureDefaults.minorWidth / dpu;
    if (i % textureDefaults.major == 0)
      ctx.lineWidth = textureDefaults.majorWidth / dpu;
    ctx.beginPath();
    ctx.moveTo(i, maxDim / 2);
    ctx.lineTo(i, -maxDim / 2);
    ctx.stroke();
  }
  for (let i = Math.ceil(maxDim / 2); i > -Math.ceil(maxDim / 2); i--) {
    ctx.strokeStyle = "black";
    if (i == 0)
      ctx.strokeStyle = "red"
    ctx.lineWidth = textureDefaults.minorWidth / dpu;
    if (i % textureDefaults.major == 0)
      ctx.lineWidth = textureDefaults.majorWidth / dpu;

    ctx.beginPath();
    ctx.moveTo(maxDim / 2, i);
    ctx.lineTo(-maxDim / 2, i);
    ctx.stroke();
  }

  ctx.restore();


  const jpgBuffer = canvas.toBuffer('image/jpeg');

  // fs.writeFileSync(`./${baseName}${vOffset}.jpg`, jpgBuffer);

  //returns the offset adjusted for the 8 added vertices
  return vOffset + 8;

}

export default wallGenerator;