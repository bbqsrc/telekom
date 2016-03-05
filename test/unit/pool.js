"use strict"

const Pool = require("../../lib/pool").Pool
const path = require("path")
const os = require("os")

const expect = require("chai").expect

require("co-mocha")

const times2Fn = path.resolve(__dirname, "../support/times2_worker.js")

describe("Pool", function() {
  let pool

  beforeEach(() => {
    pool = new Pool(times2Fn)
  })

  afterEach(() => {
    pool.shutdown()
    pool = null
  })

  it(`should map results of N*2 10000 times over ${os.cpus().length} processes`, function* () {
    const data = []

    for (let i = 1; i <= 10000; ++i) {
      data.push(i)
    }
    const res = yield pool.map(data)

    expect(res.length).to.equal(10000)
    expect(res[9999]).to.equal(20000)
    expect(res[0]).to.equal(2)
  })

  it("should reduce to values", function* () {
    const data = []

    for (let i = 1; i <= 10000; ++i) {
      data.push(i)
    }

    const res = yield pool.reduce(data, (cur, next) => {
      return cur + next
    }, 0)

    expect(res).to.equal(data.reduce((cur, next) => cur + (next * 2), 0))
  })

  it("should support iterator", function* () {
    const o = []

    for (const val of pool.iterator([1, 2, 3, 4])) {
      o.push(yield val)
    }

    expect(o.length).to.equal(4)
  })
})
