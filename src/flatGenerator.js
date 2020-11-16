import is from "is_js";
/**
 * Remove leading and trailing white space on every line of the obj file. 
 * @param {string-like} objString The obj string to be cleaned.
 */
function clean(objString){
  return objString.trim().split("\n").map(s=>s.trim()).join("\n");
}

/**
 * Create a flat surface with the given width and height. The upper-right point will be at (width/2, height/2)
 * @param {number-like} width The width of the obj
 * @param {number-like} height The height of the obj
 */
function flatGenerator(width, height){
  if(!is.all.finite([width,height]) || arguments.length != 2) throw new "Invalid arguments."
 let toReturn =  
 `
 v ${width/2} 0 -${height/2}
 v ${width/2} 0 ${height/2}
 v -${width/2} 0 -${height/2}
 v -${width/2} 0 ${height/2}
 vn 0 1 0
 f 1//1 3//1 4//1 2//1
 `;
 return clean(toReturn);
}

export default flatGenerator;