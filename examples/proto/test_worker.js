"use strict"

const ChildProcess = require("../../lib/process").ChildProcess

const proc = new ChildProcess((m, reply) => {
  console.log(`${process.pid} doing some work.`)
  reply({ got: m })
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
