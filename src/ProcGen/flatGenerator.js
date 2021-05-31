import is from "is_js";
import fs from 'fs';
import getFileBase from './getFileBase.js'


/**
 * Remove leading and trailing white space on every line of the obj file. 
 * @param {string-like} objString The obj string to be cleaned.
 */
function clean(objString) {
  return objString.trim().split("/\r?\n/").map(s => s.trim()).join("\n");
}



/**
 * Create a flat surface with the given width and length. The upper-right point will be at (width/2, length/2)
 * @param {number-like} width The width of the obj
 * @param {number-like} length The length of the obj
 */
function flatGenerator(width, length, baseName, textureOptions, wOffset = 0, lOffset = 0, hOffset = 0, vOffset = 0, count) {
  if (!is.all.finite([width, length, wOffset, lOffset, hOffset]) || !is.all.positive([width,length]) || !is.string(baseName) || arguments.length < 4 || arguments.length > 9) {
    console.log(width,length)
    throw new "Invalid arguments."
  }

  let fileBase = getFileBase(baseName);
  //let folderBase = getFolderBase(baseName);

  //First generate the wavefront obj file
  let obj =
    `
o object${vOffset}
v ${-(width / 2) + wOffset} ${hOffset} ${-(length / 2) + lOffset}
v ${-(width / 2) + wOffset} ${hOffset} ${length / 2 + lOffset}
v ${width / 2 + wOffset} ${hOffset} ${length / 2 + lOffset}
v ${width / 2 + wOffset} ${hOffset} ${-(length / 2) + lOffset}
vt 0 0
vt 0 1
vt 1 1 
vt 1 0
vn 0 1 0
usemtl texture${vOffset}
s off
f ${1 + vOffset}/${1 + vOffset}/${1 + vOffset} ${2 + vOffset}/${2 + vOffset}/${1 + vOffset} ${3 + vOffset}/${3 + vOffset}/${1 + vOffset} ${4 + vOffset}/${4 + vOffset}/${1 + vOffset}
    \n`;

    fs.appendFileSync(`${baseName}/objs/_${count}layout.obj`, obj);
    fs.appendFileSync(`${baseName}/objs/_${count}layout.js`, obj);

  //Second generate the mtl file

  let mtl = `
  newmtl texture${vOffset}
  Ka 0 0 0
  Kd 1 1 1
  map_Ka ${fileBase}${vOffset}.jpg
  map_Kd ${fileBase}${vOffset}.jpg
  `;

  // fs.appendFileSync(`${baseName}.mtl`, mtl);





  //Now generate the texture
  //We do this by creating a html canvas-like object
  //Drawing to the canvas
  //Then saving the result as a png file


  // let dpu = textureDefaults.dotsPerUnit
  // let texWidth = width * dpu;
  // let texLength = length * dpu;

  // const canvas = Canvas.createCanvas(texWidth, texLength);
  // const ctx = canvas.getContext('2d');
  // ctx.fillStyle = 'white';
  // ctx.fillRect(0, 0, texWidth, texLength);

  // ctx.save();
  // ctx.scale(dpu, dpu);
  // ctx.translate(width / 2, length / 2);

  // for (let i = Math.ceil(width / 2); i > -Math.ceil(width / 2); i--) {
  //   ctx.strokeStyle = "black";
  //   if (i == 0)
  //     ctx.strokeStyle = "green"

  //   ctx.lineWidth = textureDefaults.minorWidth / dpu;
  //   if (i % textureDefaults.major == 0)
  //     ctx.lineWidth = textureDefaults.majorWidth / dpu;
  //   ctx.beginPath();
  //   ctx.moveTo(i, length / 2);
  //   ctx.lineTo(i, -length / 2);
  //   ctx.stroke();
  // }
  // for (let i = Math.ceil(length / 2); i > -Math.ceil(length / 2); i--) {
  //   ctx.strokeStyle = "black";
  //   if (i == 0)
  //     ctx.strokeStyle = "red"
  //   ctx.lineWidth = textureDefaults.minorWidth / dpu;
  //   if (i % textureDefaults.major == 0)
  //     ctx.lineWidth = textureDefaults.majorWidth / dpu;

  //   ctx.beginPath();
  //   ctx.moveTo(width / 2, i);
  //   ctx.lineTo(-width / 2, i);
  //   ctx.stroke();
  // }

  // ctx.restore();


  // const jpgBuffer = canvas.toBuffer('image/jpeg');

  // fs.writeFileSync(`./${baseName}${vOffset}.jpg`, jpgBuffer);

  //returns the offset adjusted for the 4 added vertices
  return vOffset + 4;

}

export default flatGenerator;