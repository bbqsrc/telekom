"use strict"

const expect = require("chai").expect

require("co-mocha")

const range = require("../../lib/helpers").range

describe("Helper", function() {
  describe("range", function() {
    it("should support 1 argument as finish starting at 0", function() {
      const o = []

      for (const i of range(10).entries()) {
        o.push(i)
      }

      expect(o[0]).to.equal(0)
      expect(o[9]).to.equal(9)
    })

    it("should support 2 arguments as start to finish", function() {
      const o = []

      for (const i of range(50, 60).entries()) {
        o.push(i)
      }

      expect(o[0]).to.equal(50)
      expect(o[9]).to.equal(59)
    })

    it("should support 3 arguments of start, finish and step", function() {
      const o = []

      for (const i of range(0, 50, 5).entries()) {
        o.push(i)
      }

      expect(o[0]).to.equal(0)
      expect(o[9]).to.equal(45)
    })

    it("should support negative ranges", function() {
      const o = []

      for (const i of range(10, 0, -1).entries()) {
        o.push(i)
      }

      expect(o[0]).to.equal(10)
      expect(o[9]).to.equal(1)
    })

    it("should not accept a step of 0", function() {
      expect(() => range(0, 10, 0)).to.throw(TypeError)
    })

    it("should support #toArray method", function() {
      const r = range(0, 10, 2).toArray()

      expect(r[0]).to.equal(0)
      expect(r[4]).to.equal(8)
    })

    it("should have length property", function() {
      expect(range(0, 10, 2)).to.have.lengthOf(5)
      expect(range(1, 11, 2)).to.have.lengthOf(5)
      expect(range(0, 10, 3)).to.have.lengthOf(4)
      expect(range(1, 11, 3)).to.have.lengthOf(4)
      expect(range(0, 11, 3)).to.have.lengthOf(4)
      expect(range(1, 12, 3)).to.have.lengthOf(4)
    })
  })
})
