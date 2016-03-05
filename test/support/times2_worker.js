"use strict"

const ChildProcess = require("../../lib/process").ChildProcess

const proc = new ChildProcess(value => {
  return value * 2
})

proc.on("error", (err) => {
  console.error(err.stack)
})
