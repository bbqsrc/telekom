"use strict"

const ChildProcess = require("../../lib/process").ChildProcess

const wait = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}

const proc = new ChildProcess(function*(m) {
  console.log(`${process.pid} doing some work.`)

  yield wait(3000)

  return { got: m }
})

/*
proc.on("message", (m, reply) => {
  console.log(`${process.pid} doing some work.`)
  reply({ got: m })
})

proc.on("shutdown", (m, reply) => {
  reply({ msg: "I'll die now kthxbai" })
  process.exit(0)
})
*/
