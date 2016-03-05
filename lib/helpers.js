"use strict"

const path = require("path")

function getStack() {
  const orig = Error.prepareStackTrace

  Error.prepareStackTrace = (_, stack) => stack
  const err = new Error()

  Error.captureStackTrace(err, getStack)
  const stack = err.stack

  Error.prepareStackTrace = orig
  return stack
}

function relpath(other) {
  if (path.isAbsolute(other)) {
    return other
  }

  const dirname = path.dirname(getStack()[2].getFileName())

  return path.resolve(path.join(dirname, other))
}

module.exports = {
  relpath
}
