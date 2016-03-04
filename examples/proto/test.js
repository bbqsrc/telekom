"use strict"

const Process = require("../../lib/process").Process

const procs = []

console.log("Test begins!")

for (let i = 0; i < 400; ++i) {
  const p = new Process("./examples/proto/test_worker.js")

  p.on("error", () => {}) // Swallow errors here.

  p.send({ hello: i })
  .then(msg => {
    console.log(`Process ${i} replied:`, msg)

    procs[i].shutdown()
  })
  .catch((err) => {
    console.error(`Process ${i} had error:`, err.message)
  })

  procs.push(p)
}

console.log("Test ends!")
