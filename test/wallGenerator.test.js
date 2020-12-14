import wallGenerator from "../src/wallGenerator.js"

import chai from "chai";
import chaiString from "chai-string";

chai.use(chaiString);
const expect = chai.expect;

describe("Wall Generator", function () {
  it("Creates a wall obj", function () {
    let width = 10;
    let length = 20;
    let height = 30;
    let result = wallGenerator(width, length, height, {});
    expect(result).to.equalIgnoreSpaces(
      `
      v -${width / 2} -${length / 2} -${height / 2}
      v -${width / 2} -${length / 2} ${height / 2}
      v -${width / 2} ${length / 2} -${height / 2}
      v -${width / 2} ${length / 2} ${height / 2}
      v ${width / 2} -${length / 2} -${height / 2}
      v ${width / 2} -${length / 2} ${height / 2}
      v ${width / 2} ${length / 2} -${height / 2}
      v ${width / 2} ${length / 2} ${height / 2}
      vt 0 0
      vt 0 1
      vt 1 1 
      vt 1 0
      vn 0 1 0
      usemtl texture
      f 2/2/1 1/1/1 5/5/1 6/6/1
      f 3/3/1 4/4/1 8/8/1 7/7/1
      f 6/6/1 5/5/1 7/7/1 8/8/1
      f 1/1/1 2/2/1 4/4/1 3/3/1
      f 1/1/1 3/3/1 7/7/1 5/5/1
      f 4/4/1 2/2/1 6/6/1 8/8/1
      `.trim());
  });

  it("Doesn't accept too few arguments", function () {
    let width = 10;
    let length = 20;
    expect(()=>flatGenerator(width)).to.throw();
    expect(()=>flatGenerator(width, length)).to.throw();
  });

  it("Doesn't accept too many arguments", function () {
    let width = 10;
    let length = 20;
    let height = 30;
    expect(()=>flatGenerator(width, length, height, width)).to.throw();
  });

  it("Doesn't accept bad width arguments", function () {
    let width = "abcd";
    let length = 20;
    let height = 30;
    expect(()=>flatGenerator(width, length, height)).to.throw();
    expect(()=>flatGenerator(0/0, length, height)).to.throw();
    expect(()=>flatGenerator(Number.POSITIVE_INFINITY, length, height)).to.throw();
  });
  
  it("Doesn't accept bad length arguments", function () {
    let width = 10;
    let length = "xyz";
    let height = 30;
    expect(()=>flatGenerator(width, length, height)).to.throw();
    expect(()=>flatGenerator(width, 0/0, height)).to.throw();
    expect(()=>flatGenerator(width, Number.POSITIVE_INFINITY, height)).to.throw();
  });
  
  it("Doesn't accept bad height arguments", function () {
    let width = 10;
    let length = 20;
    let height = "xyz";
    expect(()=>flatGenerator(width, length, height)).to.throw();
    expect(()=>flatGenerator(width, length, 0/0)).to.throw();
    expect(()=>flatGenerator(width, length, Number.POSITIVE_INFINITY)).to.throw();
  });
})

