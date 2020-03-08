import * as squill from "@squill/squill";
import * as sqlite3 from "../../../../dist";
import * as w from "../../../../dist/worker/worker-impl.sql";
import * as worker from "worker_threads";

const myWorker = new worker.Worker(`${__dirname}/../../../../dist/worker/node-worker.js`);

const sqlite3Worker = new w.SqliteWorker({
    postMessage : myWorker.postMessage.bind(myWorker),
    setOnMessage : (onMessage) => {
        myWorker.on("message", onMessage);
    },
});

const pool = new sqlite3.Pool(sqlite3Worker);
pool.acquire(connection => squill.selectValue(() => squill.currentTimestamp0())
    .fetchValue(connection)
).then((result) => {
    console.log(result);
});

pool.acquire(async (connection) => {
    await connection.exec(`
        CREATE TABLE T (x DOUBLE);
    `);
    const T = squill.table("T")
        .addColumns({
            x : squill.dtDouble(),
        });
    await T.insertMany(
        connection,
        [
            { x : 1 },
            { x : 2 },
            { x : 3 },
        ]
    );
    return T
        .where(() => true)
        .fetchValue(
            connection,
            columns => squill.double.stdDevPop(columns.x)
        );
}).then((result) => {
    console.log(result);
});
