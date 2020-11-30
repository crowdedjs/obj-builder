import is from "is_js";
import Canvas from 'canvas';
import fs from 'fs';
import textureDefaults from './textureDefaults.js'


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
function flatGenerator(width, height, textureOptions) {
  if (!is.all.finite([width, height]) || arguments.length != 3) throw new "Invalid arguments."
  let toReturn =
    `  
 v -${width / 2} 0 -${height / 2}
 v -${width / 2} 0 ${height / 2}
 v ${width / 2} 0 ${height / 2}
 v ${width / 2} 0 -${height / 2}
 vt 0 0
 vt 0 1
 vt 1 1 
 vt 1 0
 vn 0 1 0
 f 1/1/1 2/2/1 3/3/1 4/4/1
 `;

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


  const pngBuf = canvas.toBuffer('image/png');

  fs.writeFileSync('./test.png', pngBuf);


  return clean(toReturn);

}

export default flatGenerator;