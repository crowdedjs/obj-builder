import is from "is_js";
import PNG from 'pngjs';
import fs from 'fs';
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
function flatGenerator(width, height, generateTexture) {
  if (!is.all.finite([width, height]) || arguments.length != 2) throw new "Invalid arguments."
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


// https://stackoverflow.com/a/32260288/10047920
  var png = new PNG.PNG({
    width: 100,
    height: 100,
    filterType: -1
  });

  for (var y = 0; y < png.height; y++) {
    for (var x = 0; x < png.width; x++) {
      var idx = (png.width * y + x) << 2;
      png.data[idx] = 255;
      png.data[idx + 1] = 218;
      png.data[idx + 2] = 185;
      png.data[idx + 3] = 128;
    }
  }

  png.pack().pipe(fs.createWriteStream('newOut.png'));



  if (generateTexture) {

  }
  return clean(toReturn);
  //return toReturn;
}

export default flatGenerator;