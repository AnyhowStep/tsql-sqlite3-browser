import * as sql from "@squill/squill";
import * as sqlite3 from "../../dist";

const worker = new Worker("/browser-worker.js");

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
        executeRawQuery : (sqlString : string) => Promise<sql.RawQueryResult>;
    }
}

window.executeRawQuery = (sqlString) => pool.acquire(
    connection => connection.rawQuery(sqlString)
);
