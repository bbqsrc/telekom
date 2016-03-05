"use strict"

const Process = require("../../lib/process").Process

const expect = require("chai").expect
const wait = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}

require("co-mocha")

const workerFn = "../support/echo_worker.js"
const times2Fn = "../support/times2_worker.js"

describe("Process", function() {
  let proc = null

  afterEach(function() {
    if (proc) {
      proc.shutdown()
      proc = null
    }
  })

  it("can be initialised", function() {
    proc = new Process(workerFn)

    expect(proc).to.exist
  })

  it("should reply to messages", function*() {
    proc = new Process(workerFn)

    const res = yield proc.send({ test: 42 })

    expect(res.echo).to.exist
    expect(res.echo.test).to.equal(42)
  })

  it("should ignore messages without TK_ID", function*(done) {
    proc = new Process(workerFn)
    proc.handle.send({ no: "id" })

    proc.on("message", (msg) => {
      if (msg.no) {
        done(new Error(`${msg} should not have existed!`))
      }
    })

    yield wait(100)

    done()
  })

  it("should accept arguments at initialisation", function*() {
    proc = new Process(workerFn, [42, "catface"])

    const res = yield proc.send({})

    expect(res.args[0]).to.equal(42)
    expect(res.args[1]).to.equal("catface")
  })

  it("should shutdown when asked nicely", function*() {
    proc = new Process(workerFn)
    const res = yield proc.shutdown()

    expect(res.echo.timeout).to.equal(10000)

    yield wait(200)
    expect(proc.handle.connected).to.be.false

    proc = null
  })

  it("should allow sending unbraced messages", function*() {
    proc = new Process(workerFn)

    const res = yield proc.send(42)

    expect(res.echo).to.equal(42)
  })

  it("should handle multiple workers", function*() {
    const procs = []

    try {
      for (let i = 0; i < 4; i++) {
        procs.push(new Process(times2Fn))
      }

      const work = procs.map((p, i) => {
        return p.send(i + 1)
      })

      const res = (yield work).reduce((cur, next) => {
        return cur + next
      }, 0)

      expect(res).to.equal(2 + 4 + 6 + 8)
    } finally {
      procs.forEach(p => p.shutdown())
    }
  })
})
