import flatGenerator from "../src/flatGenerator.js"

import chai from "chai";
import chaiString from "chai-string";

chai.use(chaiString);
const expect = chai.expect;

describe("Flat Generator", function () {
  it("Creates a flat obj", function () {
    let width = 10;
    let height = 20;
    let result = flatGenerator(width, height, {});
    expect(result).to.equalIgnoreSpaces(
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
      `.trim());
  });

  it("Doesn't accept too few arguments", function () {
    let width = 10;
    let height = 20;
    expect(()=>flatGenerator(width)).to.throw();
    expect(()=>flatGenerator(width, height)).to.throw();
  });

  it("Doesn't accept too many arguments", function () {
    let width = 10;
    let height = 20;
    expect(()=>flatGenerator(width, height, width, width)).to.throw();
  });

  it("Doesn't accept bad width arguments", function () {
    let width = "abcd";
    let height = 20;
    expect(()=>flatGenerator(width, height)).to.throw();
    expect(()=>flatGenerator(0/0, height)).to.throw();
    expect(()=>flatGenerator(Number.POSITIVE_INFINITY, height)).to.throw();
  });

  it("Doesn't accept bad height arguments", function () {
    let width = 10;
    let height = "xyz";
    expect(()=>flatGenerator(width, height)).to.throw();
  });



})

