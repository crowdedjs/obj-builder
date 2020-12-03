function getFileBase(path){
  if(!path.includes("/") && !path.includes("\\"))
    return path; // There is nothing to remove
  let indexForward = path.lastIndexOf("/");
  let indexBack = path.lastIndexOf("\\");
  let index = Math.max(indexForward, indexBack);
  return path.substr(index+1);
}

export default getFileBase;