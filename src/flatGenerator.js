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
 * Create a flat surface with the given width and height. The upper-right point will be at (width/2, height/2)
 * @param {number-like} width The width of the obj
 * @param {number-like} height The height of the obj
 */
function flatGenerator(width, height, baseName, textureOptions, wOffset = 0, hOffset = 0, vOffset = 0) {
  if (!is.all.finite([width, height]) || !is.all.positive([width,height]) || !is.string(baseName) || arguments.length < 4 || arguments.length > 7) throw new "Invalid arguments."

  let fileBase = getFileBase(baseName);
  //let folderBase = getFolderBase(baseName);

  //First generate the wavefront obj file
  let obj =
    `  
 v ${-(width / 2) + wOffset} 0 ${-(height / 2) + hOffset}
 v ${-(width / 2) + wOffset} 0 ${height / 2}
 v ${width / 2} 0 ${height / 2}
 v ${width / 2} 0 ${-(height / 2) + hOffset}
 vt 0 0
 vt 0 1
 vt 1 1 
 vt 1 0
 vn 0 1 0
 usemtl texture${vOffset}
 f ${1 + vOffset}/${1 + vOffset}/${1 + vOffset} ${2 + vOffset}/${2 + vOffset}/${1 + vOffset} ${3 + vOffset}/${3 + vOffset}/${1 + vOffset} ${4 + vOffset}/${4 + vOffset}/${1 + vOffset}
 `;

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
  let texWidth = width * dpu;
  let texHeight = height * dpu;

  const canvas = Canvas.createCanvas(texWidth, texHeight);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, texWidth, texHeight);

  ctx.save();
  ctx.scale(dpu, dpu);
  ctx.translate(width / 2, height / 2);

  for (let i = Math.ceil(width / 2); i > -Math.ceil(width / 2); i--) {
    ctx.strokeStyle = "black";
    if (i == 0)
      ctx.strokeStyle = "green"

    ctx.lineWidth = textureDefaults.minorWidth / dpu;
    if (i % textureDefaults.major == 0)
      ctx.lineWidth = textureDefaults.majorWidth / dpu;
    ctx.beginPath();
    ctx.moveTo(i, height / 2);
    ctx.lineTo(i, -height / 2);
    ctx.stroke();
  }
  for (let i = Math.ceil(height / 2); i > -Math.ceil(height / 2); i--) {
    ctx.strokeStyle = "black";
    if (i == 0)
      ctx.strokeStyle = "red"
    ctx.lineWidth = textureDefaults.minorWidth / dpu;
    if (i % textureDefaults.major == 0)
      ctx.lineWidth = textureDefaults.majorWidth / dpu;

    ctx.beginPath();
    ctx.moveTo(width / 2, i);
    ctx.lineTo(-width / 2, i);
    ctx.stroke();
  }

  ctx.restore();


  const jpgBuffer = canvas.toBuffer('image/jpeg');

  fs.writeFileSync(`./${baseName}${vOffset}.jpg`, jpgBuffer);

  //returns the offset adjusted for the 4 added vertices
  return vOffset + 4;

}

export default flatGenerator;