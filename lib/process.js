"use strict"

const cproc = require("child_process")
const EventEmitter = require("events")
const extend = require("extend")

function createReplier(ctx, ts) {
  return (reply) => {
    ctx.handle.send(extend({}, reply, { TK_ID: ts }))
  }
}

function applyHandlers() {
  this.handle.on("close", (code, signal) => {
    this.emit("terminate", code, signal, this.handle)
  })

  // Raw message receiver
  this.handle.on("message", (msg) => {
    const ts = msg.TK_ID

    if (!ts) {
      // Discard.
      return
    }

    const cleanMsg = extend({}, msg)

    delete cleanMsg.TK_ID

    // Emits the message without ID, provides replier callback
    this.emit("message", cleanMsg, createReplier(this, ts))
  })

  this.handle.on("error", (err) => {
    this.emit("error", err)
    this.emit("terminate", err.code, err.signal, this.handle)
  })
}

const ProcessMixin = Base => class extends Base {
  send(message) {
    const ts = Date.now()

    if (!this.handle.connected) {
      return Promise.reject(new Error("Handle is not connected"))
    }

    return new Promise((resolve, reject) => {
      const cb = (reply) => {
        if (reply.TK_ID === ts) {
          this.handle.removeListener("message", cb)
          const cleanReply = extend({}, reply)

          delete cleanReply.TK_ID
          return resolve(reply)
        }
      }

      this.handle.on("message", cb)

      message.TK_ID = ts

      this.handle.send(message, (err) => {
        if (err) {
          return reject(err)
        }
      })
    })
  }
}

class Process extends ProcessMixin(EventEmitter) {
  initHandle() {
    this.handle = cproc.fork(this._path, this._args)
    applyHandlers.call(this)
  }

  constructor(modPath, args) {
    super()

    this._path = modPath
    this._args = args
    this.initHandle()
  }

  shutdown(timeout) {
    return this.send({ TK_SHUTDOWN: timeout || 10000 })
  }
}

class ChildProcess extends ProcessMixin(EventEmitter) {
  initHandle() {
    this.handle = process
    applyHandlers.call(this)
  }

  constructor(work) {
    super()

    this.initHandle()

    this.on("message", (msg) => {
      if (msg.TK_SHUTDOWN) {
        this.emit("shutdown", {
          timeout: msg.TK_SHUTDOWN
        }, createReplier(this, msg.TK_ID))
      }
    })
  }
}

module.exports = {
  Process,
  ChildProcess
}
