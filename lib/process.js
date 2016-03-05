"use strict"

const cproc = require("child_process")
const EventEmitter = require("events")
const extend = require("extend")
const co = require("co")

function isGeneratorFunction(obj) {
  return obj && obj.constructor && "GeneratorFunction" === obj.constructor.name
}

function isObject(obj) {
  return obj != null && typeof obj === "object"
}

function sanitise(obj) {
  if (obj.TK_VALUE) {
    return obj.TK_VALUE
  }

  const o = extend({}, obj)

  delete o.TK_ID
  return o
}

function createReply(msg, ts) {
  const m = isObject(msg) ? msg : { TK_VALUE: msg }
  
  return extend({}, m, { TK_ID: ts })
}

const ProcessMixin = Base => class extends Base {
  initHandle() {
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

      this.emit("message", msg)
    })

    this.handle.on("error", (err) => {
      this.emit("error", err)
      this.emit("terminate", err.code, err.signal, this.handle)
    })
  }

  send(message) {
    const ts = Date.now()

    if (!this.handle.connected) {
      return Promise.reject(new Error("Handle is not connected"))
    }

    return new Promise((resolve, reject) => {
      const cb = (msg) => {
        if (msg.TK_ID === ts) {
          this.handle.removeListener("message", cb)

          if (msg.TK_ERROR) {
            return reject(msg.TK_ERROR)
          }

          if (msg.TK_VALUE) {
            return resolve(msg.TK_VALUE)
          }

          return resolve(sanitise(msg))
        }
      }

      this.handle.on("message", cb)

      let msg = message

      if (typeof msg !== "object") {
        msg = { TK_VALUE: message }
      }
      msg.TK_ID = ts

      this.handle.send(msg, (err) => {
        if (err) {
          return reject(err)
        }
      })
    })
  }
}

class Process extends ProcessMixin(EventEmitter) {
  initHandle() {
    this.handle = cproc.fork(this._path, [this._args])
    super.initHandle()
  }

  constructor(modPath, args) {
    super()

    this._path = modPath
    this._args = JSON.stringify({ args }, null, 0)
    this.initHandle()
  }

  shutdown(timeout) {
    return this.send({ TK_SHUTDOWN: timeout || 10000 })
  }

  terminate() {
    this.handle.terminate()
  }
}

class ChildProcess extends ProcessMixin(EventEmitter) {
  initHandle() {
    this.handle = process
    super.initHandle()
  }

  constructor(work) {
    super()

    this._wrappedEvents = new Map()
    this.initHandle()

    this.on("rawMessage", (msg) => {
      if (msg.TK_SHUTDOWN) {
        if (this.listenerCount("shutdown") === 0) {
          this.terminate()
          return
        }

        this.emit("shutdown", {
          TK_ID: msg.TK_ID,
          timeout: msg.TK_SHUTDOWN
        })
      }
    })

    if (work != null) {
      if (typeof work === "function" || isGeneratorFunction(work)) {
        this.on("message", work)
      } else if (typeof work === "object") {
        for (const evt of Object.keys(work)) {
          this.on(evt, work[evt])
        }
      }
    }
  }

  catchReply(action, callback) {
    const self = this

    return (msg) => {
      // Catch shutdown messages
      if (action !== "shutdown" && msg.TK_SHUTDOWN) {
        return
      }

      const ts = msg.TK_ID

      // Emits the message without ID, provides replier callback
      co.wrap(callback).call(self, sanitise(msg)).then(res => {
        self.handle.send(createReply(res, ts))
      }).catch(err => {
        self.handle.send(createReply({ TK_ERROR: err }, ts))
      })
    }
  }

  on(event, handler) {
    // Special case for internal message handling
    if (event === "rawMessage") {
      super.on("message", handler)
      return
    }

    let wrapper = handler

    if (event === "message" || event === "shutdown") {
      wrapper = this.catchReply(event, handler)
      this._wrappedEvents.set(handler, wrapper)
    }

    super.on(event, wrapper)
  }

  removeListener(event, handler) {
    if (event === "rawMessage") {
      super.removeListener("message", handler)
      return
    }

    if ((event === "message" || event === "shutdown") &&
        this._wrappedEvents.has(handler)) {
      super.removeListener(event, this._wrappedEvents.get(handler))
      this._wrappedEvents.delete(handler)
    } else {
      super.removeListener(event, handler)
    }
  }

  get args() {
    if (!this._args) {
      if (process.argv[2]) {
        this._args = JSON.parse(process.argv[2]).args
      } else {
        this._args = []
      }
    }

    return this._args
  }

  terminate() {
    setImmediate(() => this.handle.exit(0))
  }
}

module.exports = {
  Process,
  ChildProcess
}
