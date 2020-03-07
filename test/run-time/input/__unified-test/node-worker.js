const { parentPort } = require('worker_threads');
let x = 0;
parentPort.on("message", (e) => {
    ++x;
    parentPort.postMessage({ x })
})
