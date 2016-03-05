"use strict"

const os = require("os")

const Process = require("./process").Process
const relpath = require("./helpers").relpath

class Pool {
  constructor(worker, args, processes) {
    this.worker = relpath(worker)
    this.procs = []

    const c = processes || os.cpus().length

    for (let i = 0; i < c; ++i) {
      this.procs.push(new Process(worker, args))
    }

    this._next = -1
  }

  get nextAvailable() {
    const next = (this._next + 1) % this.procs.length

    this._next = next

    return this.procs[next]
  }

  send(msg) {
    return this.nextAvailable.send(msg)
  }

  * iterator(list) {
    for (const item of list) {
      yield this.send(item)
    }
  }

  map(list) {
    return list.map(item => this.send(item))
  }

  * reduce(list, callback, start) {
    const res = yield this.map(list)

    return res.reduce(callback, start || null)
  }

  shutdown() {
    return this.procs.map(p => p.shutdown())
  }
}

module.exports = {
  Pool
}
