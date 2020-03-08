import * as squill from "@squill/squill";
import * as sqlite3 from "../../../../dist";
import * as w from "../../../../dist/worker/worker-impl.sql";
import * as worker from "worker_threads";
declare const isBigInt : any;
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
    await T
        .where(() => true)
        .fetchValue(
            connection,
            columns => squill.double.stdDevPop(columns.x)
        )
        .then((result) => {
            console.log(result);
        });

    await T
        .where(() => true)
        .fetchValue(
            connection,
            () => squill.countAll()
        )
        .then((result) => {
            console.log(result);
        });

    await connection.createFunction("IS_BIGINT", (x) => {
        return isBigInt(x);
    });

    await squill
        .selectValue(() => squill
            .makeCustomOperator1<unknown, boolean>(
                (arg) => {
                    return squill.functionCall(
                        "IS_BIGINT",
                        [
                            squill.BuiltInExprUtil.buildAst(arg),
                        ]
                    )
                },
                squill.dtBoolean()
            )(BigInt(1))
        )
        .fetchValue(connection)
        .then((result) => {
            console.log(result);
        });

    await squill
        .selectValue(() => squill
            .makeCustomOperator1<unknown, boolean>(
                (arg) => {
                    return squill.functionCall(
                        "IS_BIGINT",
                        [
                            squill.BuiltInExprUtil.buildAst(arg),
                        ]
                    )
                },
                squill.dtBoolean()
            )(1)
        )
        .fetchValue(connection)
        .then((result) => {
            console.log(result);
        });

    await T
        .where(() => true)
        .fetchValue(
            connection,
            () => 1.7976931348623157e+308
        )
        .then((result) => {
            console.log(result, 1.7976931348623157e+308);
        });

});
