"use strict"

const co = require("co")
const Process = require("../../lib/process").Process

const procs = []

for (let i = 0; i < 4; i++) {
  procs.push(new Process("./examples/proto/test_multi_worker.js"))
}

const promises = procs.map((p, i) => p.send({v: i + 1}))

co(function*() {
  console.log(yield promises)
})
