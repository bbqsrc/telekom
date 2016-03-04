# telekom

An experiment in applying principles of Erlang's OTP (Open Telecom Platform) to
JavaScript for fun and glory.

## Example

`send` returns a `Promise`.

```javascript
// parent.js
const { Process } = require("telekom/process")

const p = new Process("./path/to/child.js")

p.send({ question: "meaning of universe?" }).then(msg => {
  console.log(msg) // => prints { answer: 42 }
})
```

```javascript
// child.js
const { ChildProcess } = require("telekom/process")

const proc = new ChildProcess(msg => {
  console.log("Got message:", msg)

  // Return what you want to reply, if anything
  return { answer: 42 }
})

const proc2 = new ChildProcess(function*(msg) {
  // You can use generators as well!
  const res = yield someYieldable(msg)

  return res
})
```

## License

BSD 2-clause license. See LICENSE.
