"use strict"

const ChildProcess = require("./lib/process").ChildProcess

const proc = new ChildProcess()

console.log("Worker started")

proc.on("message", (m, reply) => {
  console.log("Got message:", m)
  reply({ got: "it!", but: "it hates me" })
})

proc.on("shutdown", (m, reply) => {
  console.log("Been asked to shutdown:", m)
  reply({msg: "I'll die now kthxbai"})
  process.exit(0)
})
