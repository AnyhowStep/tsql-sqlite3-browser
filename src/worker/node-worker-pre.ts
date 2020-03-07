import * as workerThreads from "worker_threads";

const parentPort = workerThreads.parentPort;

//@ts-ignore
const postMessage = (response : unknown) => {
    parentPort!.postMessage(response);
};
//@ts-ignore
let onmessage;
