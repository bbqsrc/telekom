"use strict"

class Register {
  constructor() {
    this._map = new Map()
  }

  insert(name, fd) {
    const self = this

    if (this._map.has(name)) {
      return false
    }

    // Clean up self on termination
    fd.on("terminate", () => self._map.delete(name))

    this._map.put(name, fd)
    return true
  }

  resolve(name) {
    return this._map.get(name)
  }
}

module.exports = {
  Register
}
