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

```javascript
/* worker.js */
const { ChildProcess } = require("telekom/process")

// Simply multiple what is received
const proc = new ChildProcess(value => value * 2)

/* poolexample.js */
const { Pool } = require("telekom/pool")

const pool = new Pool("./path/to/worker.js") // Defaults to using number of CPUs
const data = [1, 2, 3, 4]

const res1 = yield pool.map(data) // => [2, 4, 6, 8]
const res2 = yield pool.reduce(data, (cur, next) => {
  return cur + next
}, 0) // => 20
```

## License

BSD 2-clause license. See LICENSE.
