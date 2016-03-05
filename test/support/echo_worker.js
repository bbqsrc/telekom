"use strict"

const ChildProcess = require("../../lib/process").ChildProcess

const wait = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}

const proc = new ChildProcess(function*(m) {
  return { args: this.args, echo: m }
})

proc.on("shutdown", function*(m) {
  this.terminate() // Next tick!
  return { echo: m }
})

proc.on("error", (err) => {
  console.error(err.stack)
})
