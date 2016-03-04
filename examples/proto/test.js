"use strict"

const Process = require("./lib/process").Process

const p = new Process("./test_worker.js")

p.send({ test: 42 })
.then(msg => {
  console.log("reply:", msg)
  p.shutdown().then(msg => {
    console.log(msg)
  })
})
.catch(err => console.log(err))

p.once("terminate", function(errno, message, handle) {
  console.log("Terminated PID:", handle.pid)
})

console.log("I ran!")
