import * as sql from "@squill/squill";
import * as sqlite3 from "../../dist/driver";
import {ExecResult} from "../../dist/sql-wasm/sql-wasm-debug";

const worker = new Worker("worker-browser.js");

const sqlite3Worker = new sqlite3.SqliteWorker({
    postMessage : worker.postMessage.bind(worker),
    setOnMessage : (onMessage) => {
        worker.onmessage = (event) => {
            onMessage(event.data);
            if (event.data.action == sqlite3.SqliteAction.CLOSE) {
                worker.terminate();
            }
        };
    },
});

const pool = new sqlite3.Pool(sqlite3Worker);

declare global {
    interface Window {
        rawQuery : (sqlString : string) => Promise<sql.RawQueryResult>;
        exec : (sqlString : string) => Promise<{ execResult : ExecResult, rowsModified : number }>;
    }
}

window.rawQuery = (sqlString) => pool.acquire(
    connection => connection.rawQuery(sqlString)
);

window.exec = (sqlString) => pool.acquire(
    connection => connection.exec(sqlString)
);
