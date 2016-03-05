"use strict"

const Reflect = require("harmony-reflect")

class Range {
  constructor(/* start, stop, step */) {
    let start = 0,
        step = 1,
        stop = arguments[0]

    if (arguments.length === 0) {
      throw new TypeError("expected at least 1 argument, got 0")
    }

    if (arguments.length >= 2) {
      start = arguments[0]
      stop = arguments[1]
    }

    if (arguments.length >= 3) {
      step = arguments[2]
    }

    if (step === 0) {
      throw new TypeError("step argument must not be zero")
    }

    Object.defineProperties(this, {
      start: { value: start },
      stop: { value: stop },
      step: { value: step }
    })
  }

  get length() {
    return Math.ceil((this.stop - this.start) / this.step)
  }

  [Symbol.iterator]() {
    return this.entries()
  }

  * entries() {
    const step = this.step
    const start = this.start
    const stop = this.stop

    if (step < 0) {
      for (let i = start; i > stop; i += step) {
        yield i
      }
    } else {
      for (let i = start; i < stop; i += step) {
        yield i
      }
    }
  }

  index(i) {
    const len = this.length

    if (i >= len || i <= ~len) {
      throw new RangeError(`index ${i} out of range`)
    }

    if (i < 0) {
      return this.start + (this.step * (len + i))
    }

    return this.start + (this.step * i)
  }

  toArray() {
    return Array.from(this)
  }

  inspect() {
    return this.toString()
  }

  toString() {
    return `range(${this.start}, ${this.stop}, ${this.step})`
  }
}

Object.assign(Range.prototype, {
  map: Array.prototype.map,
  reduce: Array.prototype.reduce,
  reduceRight: Array.prototype.reduceRight,
  slice: Array.prototype.slice,
  indexOf: Array.prototype.indexOf
})

function range(/* start, stop, step */) {
  const r = new (Range.bind(null, ...arguments))
  const len = r.length

  const proxy = new Proxy(r, {
    get(target, name, receiver) {
      if (typeof name === "number") {
        return target.index(name)
      }

      const num = parseInt(name, 10)

      if (!Number.isNaN(num)) {
        return target.index(num)
      }

      return Reflect.get(target, name, receiver)
    },

    has(target, name) {
      const num = parseInt(name, 10)

      if (!Number.isNaN(num)) {
        // If name is a string BUT num is an integer,
        // hack for Array prototypes.
        if (typeof name === "string") {
          return num >= 0 && num < len
        }

        if (num >= r.stop || num < r.start) {
          return false
        }

        const diff = r.start % r.step
        const res = ((num % r.step) - diff) === 0

        return res
      }

      return Reflect.has.apply(this, arguments)
    }
  })

  return proxy
}

module.exports = {
  range
}
