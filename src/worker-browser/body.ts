declare let onmessage : (event : unknown) => void;
declare let postMessage : (workerResult : unknown) => void;
declare let initSqlJs : typeof import("../sql-wasm/sql-wasm-debug").default;
declare let forceBigIntPolyfill : boolean;

import * as sqljs from "../sql-wasm/sql-wasm-debug";
type FromSqliteMessage = import("../driver").FromSqliteMessage;
type ToSqliteMessage = import("../driver").ToSqliteMessage;

const SqliteAction : {
    [k in keyof typeof import("../driver").SqliteAction] : typeof import("../driver").SqliteAction[k]
} = {
    OPEN : "OPEN" as import("../driver").SqliteAction.OPEN,
    EXEC : "EXEC" as import("../driver").SqliteAction.EXEC,
    EXPORT : "EXPORT" as import("../driver").SqliteAction.EXPORT,
    CLOSE : "CLOSE" as import("../driver").SqliteAction.CLOSE,
    CREATE_GLOBAL_JS_FUNCTION : "CREATE_GLOBAL_JS_FUNCTION" as import("../driver").SqliteAction.CREATE_GLOBAL_JS_FUNCTION,
    CREATE_FUNCTION : "CREATE_FUNCTION" as import("../driver").SqliteAction.CREATE_FUNCTION,
    CREATE_AGGREGATE : "CREATE_AGGREGATE" as import("../driver").SqliteAction.CREATE_AGGREGATE,
};

class MyBigIntPolyfill {
    private value : string;
    constructor (x : any) {
        this.value = String(x);
    }
    toString () {
        return this.value;
    }
}
let bigIntPolyfilled = false;
if (typeof BigInt === "undefined" || forceBigIntPolyfill) {
    bigIntPolyfilled = true;
    getGlobal()["BigInt"] = (
        (x : any) => new MyBigIntPolyfill(x) as unknown as bigint
    ) as any;
}

function isBigInt (x : any) : x is bigint {
    if (bigIntPolyfilled) {
        return x instanceof MyBigIntPolyfill;
    } else {
        return typeof x == "bigint";
    }
}

function initWorker (
    postMessage : (data : FromSqliteMessage) => void
) {
    let sqlite : sqljs.Sqlite|undefined = undefined;
    let dbInstance : sqljs.Database|undefined = undefined;
    const getSqlite = async () : Promise<sqljs.Sqlite> => {
        if (sqlite == undefined) {
            sqlite = await initSqlJs();
        }
        return sqlite;
    };
    const createDb = async (dbFile? : Uint8Array) : Promise<sqljs.Database> => {
        if (dbInstance != undefined) {
            dbInstance.close();
        }
        dbInstance = undefined;
        dbInstance = new (await getSqlite()).Database(dbFile);
        return dbInstance;
    };
    const getOrCreateDb = async () : Promise<sqljs.Database> => {
        if (dbInstance == undefined) {
            dbInstance = await createDb();
        }
        return dbInstance;
    };
    const closeDb = async () : Promise<void> => {
        if (dbInstance == undefined) {
            return;
        }
        dbInstance.close();
        dbInstance = undefined;
    };

    const processMessage = async (data : ToSqliteMessage|{ isTrusted : boolean, data : ToSqliteMessage }) => {
        if ("isTrusted" in data) {
            data = data.data;
        }
        switch (data.action) {
            case SqliteAction.OPEN: {
                await createDb(data.buffer);
                postMessage({
                    id : data.id,
                    action : data.action,
                });
                return;
            }
            case SqliteAction.EXEC: {
                const db = await getOrCreateDb();
                //console.log(data.sql);
                const execResult = db.exec(data.sql);
                if (bigIntPolyfilled) {
                    for (const resultSet of execResult) {
                        for (const row of resultSet.values) {
                            for (let i=0; i<row.length; ++i) {
                                const value = row[i];
                                if (isBigInt(value)) {
                                    row[i] = value.toString();
                                }
                            }
                        }
                    }
                }
                postMessage({
                    id : data.id,
                    action : data.action,
                    execResult,
                    rowsModified : db.getRowsModified(),
                });
                return;
            }
            case SqliteAction.EXPORT: {
                const db = await getOrCreateDb();
                postMessage({
                    id : data.id,
                    action : data.action,
                    buffer : db.export(),
                });
                return;
            }
            case SqliteAction.CLOSE: {
                await closeDb();
                postMessage({
                    id : data.id,
                    action : data.action,
                });
                return;
            }
            case SqliteAction.CREATE_GLOBAL_JS_FUNCTION: {
                //We want direct eval
                const impl = eval("(" + data.impl + ")");
                (getGlobal() as any)[data.functionName] = impl;
                postMessage({
                    id : data.id,
                    action : data.action,
                });
                return;
            }
            case SqliteAction.CREATE_FUNCTION: {
                const db = await getOrCreateDb();
                /**
                 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_Operator
                 *
                 * https://github.com/webpack/webpack/issues/9615#issuecomment-524167958
                 *
                 * According to https://github.com/fatcerberus,
                 *
                 * > Per spec the JS engine looks specifclaly for `eval(...` to trigger direct eval (inherits containing scope)
                 * >
                 * > `(0, eval)` bypasses it
                 * >
                 * > Indirect eval ensures you only inherit the global scope
                 * >
                 * > In case it wasn't clear the `0` can be anything you want
                 * >
                 * > But `0` is most concise
                 *
                 * ```js
                 *  function bar () {
                 *      const x = 4;
                 *      eval("console.log(x)"); //prints 4
                 *      (0, eval)("console.log(x)"); //Uncaught ReferenceError: x is not defined
                 *  }
                 *  bar();
                 * ```
                 *
                 * ```js
                 *  function bar () {
                 *      const x = 4;
                 *      eval("console.log(x)"); //prints 4
                 *      const indirectEval = eval;
                 *      indirectEval("console.log(x)"); //Uncaught ReferenceError: x is not defined
                 *  }
                 *  bar();
                 * ```
                 *
                 * https://tc39.es/ecma262/#sec-function-calls-runtime-semantics-evaluation
                 */
                //const indirectEval = eval;
                //Actually, maybe we do want direct eval
                const impl = eval("(" + data.impl + ")");
                db.create_function(
                    data.functionName,
                    data.options,
                    impl
                );
                postMessage({
                    id : data.id,
                    action : data.action,
                });
                return;
            }
            case SqliteAction.CREATE_AGGREGATE: {
                const db = await getOrCreateDb();
                //const indirectEval = eval;
                //Actually, maybe we do want direct eval
                const init = eval("(" + data.init + ")");
                const step = eval("(" + data.step + ")");
                const finalize = eval("(" + data.finalize + ")");
                db.create_aggregate(
                    data.functionName,
                    data.options,
                    init,
                    step,
                    finalize
                );
                postMessage({
                    id : data.id,
                    action : data.action,
                });
                return;
            }
            default: {
                /**
                 * Explicitly check we have handled every case.
                 */
                const neverVar : never = data;
                const tmp : ToSqliteMessage = neverVar as ToSqliteMessage;
                postMessage({
                    id : tmp.id,
                    action : tmp.action,
                    error : `Unknown action ${tmp.action}`,
                });
                return;
            }
        }
    };
    return (event : ToSqliteMessage|{ isTrusted : boolean, data : ToSqliteMessage }) => {
        const data = ("isTrusted" in event) ?
            event.data :
            event;

        processMessage(data)
            .catch((error) => {
                postMessage({
                    id : data.id,
                    action : data.action,
                    error : (
                        error == undefined ?
                        "An unknown error occurred" :
                        typeof error.message == "string" ?
                        //error.message + "\n" + error.stack :
                        error.message :
                        "An unexpected error occurred: " + String(error)
                    ),
                });
            });
    };
}


onmessage = initWorker(postMessage) as typeof onmessage;
