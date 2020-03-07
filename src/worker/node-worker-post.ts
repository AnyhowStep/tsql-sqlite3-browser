declare const parentPort : Exclude<typeof import("worker_threads").parentPort, null>;
declare let onmessage : (event : unknown) => void;

parentPort.on("message", onmessage);
