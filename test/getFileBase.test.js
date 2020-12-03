import getFileBase from "../src/getFileBase.js"

import chai from "chai";
import chaiString from "chai-string";

chai.use(chaiString);
const expect = chai.expect;

describe("Get File Base", function () {
  it("Returns the original path if there is no containing folder", function () {
    let result = getFileBase("base");
    expect(result).to.equal("base");
  });

  it("returns the file path if there are forward slashes", function () {
    let result = getFileBase("folder/base");
    expect(result).to.equal("base");
  });

  it("Returns the file path if there are back slashes", function () {
    let result = getFileBase("folder\\base");
    expect(result).to.equal("base");
  });

  it("Returns the file path if there are both forward and back slashes", function () {
    let result = getFileBase("parent/folder\\base");
    expect(result).to.equal("base");
  });

  it("Doesn't accept bad arguments", function () {
    expect(()=>getFileBase()).to.throw;
  });



})

