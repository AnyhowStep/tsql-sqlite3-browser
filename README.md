At the moment, written with SQLite 3.31 in mind.

This is a SQLite 3.31 adapter for [`@squill/squill`](https://github.com/AnyhowStep/tsql)

Based on [`sql.js`](https://github.com/sql-js/sql.js)

-----

### TODO

+ Browser worker support
+ Clean up build scripts and dist
+ Detailed usage instructions
+ Browser usage instructions

```ts
//node.js usage instructions
import * as sql from "@squill/squill";
import * as sqlite3 from "@squill/sqlite3-browser";
import * as worker from "worker_threads";

const myWorker = new worker.Worker(
    `${__dirname}/path/to/node_modules/@squill/sqlite3-browser/dist/worker/node-worker.js`
);

const sqlite3Worker = new sqlite3.SqliteWorker({
    postMessage : myWorker.postMessage.bind(myWorker),
    setOnMessage : (onMessage) => {
        myWorker.on("message", (data) => {
            onMessage(data);
            if (data.action == sqlite3.SqliteAction.CLOSE) {
                myWorker.terminate();
            }
        });
    },
});

const pool = new sqlite3.Pool(sqlite3Worker);

await pool
    .acquire(connection => connection.open(`path/to/sqlite3/database/file`));

const myTable = sql.table("myTable")
    .addColumns({
        myTableId : sql.dtBigIntSigned(),
        description : sql.dtVarChar(1024),
    })
    .setAutoIncrement(columns => columns.myTableId);

await pool
    .acquire(connection => myTable
        .whereEqPrimaryKey({
            myTableId : 1337n,
        })
        .fetchOne(connection)
    )
    .then(
        (row) => {
            console.log(row.myTableId);
            console.log(row.description);
        },
        (err) => {
            if (sql.isSqlError(err)) {
                //Probably some error related to executing a SQL query
                //Maybe a RowNotFoundError
            } else {
                //Probably some other error
            }
        }
    );

/**
 * Build a query that may be used later.
 */
const myQuery = sql.from(myTable)
    .select(columns => [
        columns.myTableId
        sql.concat(
            "Description: ",
            columns.description
        ).as("labeledDescription"),
    ]);

await pool
    .acquire(connection => myQuery
        .whereEqPrimaryKey(
            tables => tables.myTable,
            {
                myTableId : 1337n,
            }
        )
        .fetchOne(connection)
    )
    .then(
        (row) => {
            console.log(row.myTableId);
            console.log(row.labeledDescription);
        },
        (err) => {
            if (sql.isSqlError(err)) {
                //Probably some error related to executing a SQL query
                //Maybe a RowNotFoundError
            } else {
                //Probably some other error
            }
        }
    );

//Gets a Uint8Array which contains the entire database
await pool
    .acquire(connection => connection.export());

```
