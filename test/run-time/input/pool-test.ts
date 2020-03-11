import * as tape from "tape";
import * as sqlite3 from "../../../dist/driver";
import * as worker from "worker_threads";

export function poolTest (fileName : string, callback : (t : tape.Test, pool : sqlite3.Pool) => Promise<void>) {
    tape(fileName, async (t) => {
        const myWorker = new worker.Worker(
            typeof BigInt(0) == "bigint" ?
            `${__dirname}/../../../dist/worker/worker-node.js` :
            `${__dirname}/../../../dist/worker/worker-node-force-bigint-polyfill.js`
        );

        const sqlite3Worker = new sqlite3.SqliteWorker({
            postMessage : myWorker.postMessage.bind(myWorker),
            setOnMessage : (onMessage) => {
                myWorker.on("message", (data) => {
                    onMessage(data);
                });
            },
        });

        const pool = new sqlite3.Pool(sqlite3Worker);
        try {
            await callback(t, pool);
        } catch (err) {
            t.fail(err.message + "\n" + err.stack);
        }

        await pool.disconnect();
        await myWorker.terminate();
        t.end();
    });
}
