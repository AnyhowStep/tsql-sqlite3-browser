import * as tm from "type-mapping";
import * as squill from "@squill/squill";
import {sqlfier, insertOneSqlString, insertManySqlString, deleteSqlString, updateSqlString, insertSelectSqlString} from "../../sqlfier";
import {tryFetchSchemaMeta, tryFetchGeneratedColumnExpression} from "../../schema-introspection";
import {ISqliteWorker, SqliteAction, ToSqliteMessage, FromSqliteMessage} from "../../worker";
import * as ExprLib from "../../expr-library";

export class IdAllocator {
    private nextId = 0;
    allocateId () {
        return ++this.nextId;
    }
}

export interface SharedConnectionInformation {
    /**
     * mutable
     */
    transactionData : (
        | undefined
        | {
            minimumIsolationLevel : squill.IsolationLevel,
            accessMode : squill.TransactionAccessMode,
        }
    );
    /**
     * mutable
     */
    savepointId : number;
}

function onMessage<ActionT extends SqliteAction> (
    data : FromSqliteMessage,
    id : number,
    action : ActionT,
    resolve : (
        data : Extract<FromSqliteMessage, { action : ActionT, error? : undefined }>
    ) => void,
    reject : (error : Error) => void
) {
    if (data.id != id) {
        reject(new Error(`Expected id ${id}; received ${data.id}`));
        return;
    }
    if (data.action != action) {
        reject(new Error(`Expected action ${action}; received ${data.action}`));
        return;
    }

    if (data.error == undefined) {
        resolve(data as any);
    } else {
        reject(new Error(data.error));
    }
}

function postMessage<ActionT extends SqliteAction, ResultT> (
    worker : ISqliteWorker,
    id : number,
    action : ActionT,
    data : Omit<Extract<ToSqliteMessage, { action : ActionT }>, "id"|"action">,
    resolve : (
        data : Extract<FromSqliteMessage, { action : ActionT, error? : undefined }>
    ) => ResultT
) {
    return new Promise<ResultT>((innerResolve, originalInnerReject) => {
        const innerReject = (error : any) => {
            const sql = (
                "sql" in data ?
                (data as any).sql :
                undefined
            );
            if (error instanceof Error) {
                if (error.message.startsWith("DataOutOfRangeError") || error.message.includes("overflow")) {
                    const newErr = new squill.DataOutOfRangeError({
                        innerError : error,
                        sql,
                    });
                    originalInnerReject(newErr);
                } else if (error.message.startsWith("DivideByZeroError")) {
                    const newErr = new squill.DivideByZeroError({
                        innerError : error,
                        sql,
                    });
                    originalInnerReject(newErr);
                } else {
                    const newErr = new squill.SqlError({
                        innerError : error,
                        sql,
                    });
                    originalInnerReject(newErr);
                }
            } else {
                const newErr = new squill.SqlError({
                    innerError : error,
                    sql,
                });
                originalInnerReject(newErr);
            }
        };
        worker.onmessage = (e) => {
            const data = e.data;
            onMessage(
                data,
                id,
                action,
                (data) => {
                    innerResolve(resolve(data));
                },
                innerReject
            );
        };
        worker.onmessageerror = innerReject;
        worker.onerror = innerReject;

        worker.postMessage(
            {
                id,
                action,
                ...data,
            } as ToSqliteMessage
        );
    });
}

export class Connection implements
    squill.IConnection,
    squill.ConnectionComponent.InTransaction,
    squill.ConnectionComponent.Savepoint<squill.ITransactionConnection>,
    squill.ConnectionComponent.InSavepoint
{
    readonly pool: squill.IPool;
    readonly eventEmitters: squill.IConnectionEventEmitterCollection;

    private readonly idAllocator : IdAllocator;
    private readonly asyncQueue : squill.AsyncQueue<ISqliteWorker>;
    private readonly sharedConnectionInformation : SharedConnectionInformation;

    constructor (
        {
            pool,
            eventEmitters,
            worker,
            idAllocator,
            sharedConnectionInformation,
        } :
        {
            pool : squill.IPool,
            eventEmitters : squill.IConnectionEventEmitterCollection,
            worker : ISqliteWorker|squill.AsyncQueue<ISqliteWorker>,
            idAllocator : IdAllocator,
            sharedConnectionInformation : SharedConnectionInformation,
        }
    ) {
        this.pool = pool;
        this.eventEmitters = eventEmitters;

        this.idAllocator = idAllocator;
        this.asyncQueue = worker instanceof squill.AsyncQueue ?
            worker :
            new squill.AsyncQueue<ISqliteWorker>(
                () => {
                    return {
                        item : worker,
                        deallocate : async () => {}
                    };
                }
            );
        this.sharedConnectionInformation = sharedConnectionInformation;
        this.sharedConnectionInformation;
    }


    tryGetFullConnection(): squill.IConnection | undefined {
        if (
            this.sharedConnectionInformation.transactionData != undefined &&
            this.sharedConnectionInformation.transactionData.accessMode == squill.TransactionAccessMode.READ_ONLY
        ) {
            /**
             * Can't give a full connection if we are in a readonly transaction.
             * No `INSERT/UPDATE/DELETE` allowed.
             */
            return undefined;
        } else {
            return this as unknown as squill.IConnection;
        }
    }
    lock<ResultT>(callback: squill.LockCallback<squill.IConnection, ResultT>): Promise<ResultT> {
        return this.asyncQueue.lock((nestedAsyncQueue) => {
            const nestedConnection = new Connection({
                pool : this.pool,
                eventEmitters : this.eventEmitters,
                idAllocator : this.idAllocator,
                worker : nestedAsyncQueue,
                sharedConnectionInformation : this.sharedConnectionInformation
            });
            return callback(
                nestedConnection as unknown as squill.IConnection
            );
        });
    }

    rollback () : Promise<void> {
        if (!this.isInTransaction()) {
            return Promise.reject(new Error("Not in transaction; cannot rollback"));
        }
        return this.rawQuery("ROLLBACK")
            .then(() => {
                this.sharedConnectionInformation.transactionData = undefined;
                /**
                 * @todo Handle sync errors somehow.
                 * Maybe propagate them to `IPool` and have an `onError` handler or something
                 */
                this.eventEmitters.rollback();
            });
    }
    commit () : Promise<void> {
        if (!this.isInTransaction()) {
            return Promise.reject(new Error("Not in transaction; cannot commit"));
        }
        return this.rawQuery("COMMIT")
            .then(() => {
                this.sharedConnectionInformation.transactionData = undefined;
                /**
                 * @todo Handle sync errors somehow.
                 * Maybe propagate them to `IPool` and have an `onError` handler or something
                 */
                this.eventEmitters.commit();
            });
    }

    getMinimumIsolationLevel () : squill.IsolationLevel {
        if (this.sharedConnectionInformation.transactionData == undefined) {
            throw new Error(`Not in transaction`);
        }
        return this.sharedConnectionInformation.transactionData.minimumIsolationLevel;
    }
    getTransactionAccessMode () : squill.TransactionAccessMode {
        if (this.sharedConnectionInformation.transactionData == undefined) {
            throw new Error(`Not in transaction`);
        }
        return this.sharedConnectionInformation.transactionData.accessMode;
    }

    private transactionImpl<ResultT> (
        minimumIsolationLevel : squill.IsolationLevel,
        accessMode : squill.TransactionAccessMode,
        callback : squill.LockCallback<squill.ITransactionConnection, ResultT>|squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ) : Promise<ResultT> {
        if (this.sharedConnectionInformation.transactionData != undefined) {
            return Promise.reject(new Error(`Transaction already started or starting`));
        }
        /**
         * SQLite only has `SERIALIZABLE` transactions.
         * So, no matter what we request, we will always get a
         * `SERIALIZABLE` transaction.
         *
         * However, we will just pretend that we have all
         * isolation levels supported.
         */
        this.sharedConnectionInformation.transactionData = {
            minimumIsolationLevel,
            accessMode,
        };

        return new Promise<ResultT>((resolve, reject) => {
            return this.rawQuery(`BEGIN TRANSACTION`)
                .then(() => {
                    /**
                     * @todo Handle sync errors somehow.
                     * Maybe propagate them to `IPool` and have an `onError` handler or something
                     */
                    this.eventEmitters.commit();
                    if (!this.isInTransaction()) {
                        /**
                         * Why did one of the `OnCommit` listeners call `commit()` or `rollback()`?
                         */
                        throw new Error(`Expected to be in transaction`);
                    }
                    return callback(this as unknown as squill.ITransactionConnection);
                })
                .then((result) => {
                    if (!this.isInTransaction()) {
                        resolve(result);
                        return;
                    }

                    this.commit()
                        .then(() => {
                            resolve(result);
                        })
                        .catch((commitErr) => {
                            this.rollback()
                                .then(() => {
                                    reject(commitErr);
                                })
                                .catch((rollbackErr) => {
                                    commitErr.rollbackErr = rollbackErr;
                                    reject(commitErr);
                                });
                        });
                })
                .catch((err) => {
                    if (!this.isInTransaction()) {
                        reject(err);
                        return;
                    }

                    this.rollback()
                        .then(() => {
                            reject(err);
                        })
                        .catch((rollbackErr) => {
                            err.rollbackErr = rollbackErr;
                            reject(err);
                        });
                });
        });
    }
    private transactionIfNotInOneImpl<ResultT> (
        minimumIsolationLevel : squill.IsolationLevel,
        accessMode : squill.TransactionAccessMode,
        callback : squill.LockCallback<squill.ITransactionConnection, ResultT>|squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ) : Promise<ResultT> {
        return this.lock(async (nestedConnection) => {
            if (nestedConnection.isInTransaction()) {
                if (squill.IsolationLevelUtil.isWeakerThan(
                    this.getMinimumIsolationLevel(),
                    minimumIsolationLevel
                )) {
                    /**
                     * For example, our current isolation level is
                     * `READ_UNCOMMITTED` but we want
                     * `SERIALIZABLE`.
                     *
                     * Obviously, `READ_UNCOMMITTED` is weaker than
                     * `SERIALIZABLE`.
                     *
                     * So, we error.
                     *
                     * @todo Custom error type
                     */
                    return Promise.reject(new Error(`Current isolation level is ${this.getMinimumIsolationLevel()}; cannot guarantee ${minimumIsolationLevel}`));
                }
                if (squill.TransactionAccessModeUtil.isLessPermissiveThan(
                    this.getTransactionAccessMode(),
                    accessMode
                )) {
                    return Promise.reject(new Error(`Current transaction access mode is ${this.getTransactionAccessMode()}; cannot allow ${accessMode}`));
                }
                try {
                    return callback(nestedConnection);
                } catch (err) {
                    return Promise.reject(err);
                }
            } else {
                return (nestedConnection as unknown as Connection).transactionImpl(
                    minimumIsolationLevel,
                    accessMode,
                    callback
                );
            }
        });
    }

    transactionIfNotInOne<ResultT>(
        callback: squill.LockCallback<squill.ITransactionConnection, ResultT>
    ): Promise<ResultT>;
    transactionIfNotInOne<ResultT>(
        minimumIsolationLevel: squill.IsolationLevel,
        callback: squill.LockCallback<squill.ITransactionConnection, ResultT>
    ): Promise<ResultT>;
    transactionIfNotInOne<ResultT>(
        ...args : (
            | [squill.LockCallback<squill.ITransactionConnection, ResultT>]
            | [squill.IsolationLevel, squill.LockCallback<squill.ITransactionConnection, ResultT>]
        )
    ): Promise<ResultT> {
        return this.transactionIfNotInOneImpl(
            args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0],
            squill.TransactionAccessMode.READ_WRITE,
            args.length == 1 ? args[0] : args[1]
        );
    }
    readOnlyTransactionIfNotInOne<ResultT>(
        callback: squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ): Promise<ResultT>;
    readOnlyTransactionIfNotInOne<ResultT>(
        minimumIsolationLevel: squill.IsolationLevel,
        callback: squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ): Promise<ResultT>;
    readOnlyTransactionIfNotInOne<ResultT>(
        ...args : (
            | [squill.LockCallback<squill.IsolatedSelectConnection, ResultT>]
            | [squill.IsolationLevel, squill.LockCallback<squill.IsolatedSelectConnection, ResultT>]
        )
    ): Promise<ResultT> {
        return this.transactionIfNotInOneImpl(
            args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0],
            squill.TransactionAccessMode.READ_ONLY,
            args.length == 1 ? args[0] : args[1]
        );
    }

    allocateId () {
        return this.idAllocator.allocateId();
    }

    open (dbFile? : Uint8Array) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.OPEN,
                {
                    buffer : dbFile,
                },
                () => {},
            );
        });
    }

    export () {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.EXPORT,
                {},
                data => data.buffer,
            );
        });
    }

    close () {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.CLOSE,
                {},
                () => {},
            );
        });
    }

    createGlobalJsFunction (functionName : string, impl : (...args : any[]) => unknown) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.CREATE_GLOBAL_JS_FUNCTION,
                {
                    functionName,
                    impl : impl.toString(),
                },
                () => {},
            );
        });
    }

    /**
     * The `impl` function will be stringified using `impl.toString()`.
     *
     * Then, the function will be "rebuilt" using `eval()`.
     *
     * This means your `impl` cannot rely on anything outside its scope.
     * It must be a "pure" function.
     *
     * Also, you really shouldn't pass user input to this method.
     */
    createFunction (functionName : string, impl : (...args : unknown[]) => unknown) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.CREATE_FUNCTION,
                {
                    functionName,
                    options : {
                        isVarArg : false,
                    },
                    impl : impl.toString(),
                },
                () => {},
            );
        });
    }

    /**
     * The `impl` function will be stringified using `impl.toString()`.
     *
     * Then, the function will be "rebuilt" using `eval()`.
     *
     * This means your `impl` cannot rely on anything outside its scope.
     * It must be a "pure" function.
     *
     * Also, you really shouldn't pass user input to this method.
     */
    createVarArgFunction (functionName : string, impl : (...args : unknown[]) => unknown) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.CREATE_FUNCTION,
                {
                    functionName,
                    options : {
                        isVarArg : true,
                    },
                    impl : impl.toString(),
                },
                () => {},
            );
        });
    }

    createAggregate<StateT> (
        functionName : string,
        init : () => StateT,
        step : (state : StateT, ...args : unknown[]) => void,
        finalize : (state : StateT|undefined) => unknown
    ) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.CREATE_AGGREGATE,
                {
                    functionName,
                    init : init.toString(),
                    step : step.toString(),
                    finalize : finalize.toString(),
                },
                () => {},
            );
        });
    }

    exec (sql : string) {
        return this.asyncQueue.enqueue((worker) => {
            //console.log("sql", sql);
            return postMessage(
                worker,
                this.allocateId(),
                SqliteAction.EXEC,
                {
                    sql,
                },
                ({execResult, rowsModified}) => {
                    return {execResult, rowsModified};
                },
            );
        });
    }

    rawQuery(sql: string): Promise<squill.RawQueryResult> {
        //console.log("sql", sql);
        return this
            .exec(sql)
            .then((result) : squill.RawQueryResult => {
                if (result.execResult.length == 0) {
                    return {
                        query : { sql },
                        results : undefined,
                        columns : undefined,
                    };
                }
                return {
                    query : { sql },
                    results : result.execResult[0].values,
                    columns : result.execResult[0].columns,
                };
            });
    }
    async select(query: squill.IQueryBase<squill.QueryBaseData>): Promise<squill.SelectResult> {
        const sql = squill.AstUtil.toSql(query, sqlfier);
        return this.exec(sql)
            .then((result): squill.SelectResult => {
                if (result.execResult.length > 1) {
                    throw new Error(`Expected to run 1 SELECT statement; found ${result.execResult.length}`);
                }

                /**
                 * When SQLite fetches zero rows, we get zero execResults...
                 * Which is frustrating.
                 */
                const resultSet = (
                    (result.execResult.length == 0) ?
                    {
                        values : [],
                        columns : [],
                    } :
                    result.execResult[0]
                );
                const selectResult : squill.SelectResult = {
                    query : { sql, },
                    rows : resultSet.values.map((row) => {
                        const obj : Record<string, unknown> = {};
                        for (let i=0; i<resultSet.columns.length; ++i) {
                            const k = resultSet.columns[i];
                            const v = row[i];
                            obj[k] = v;
                        }
                        return obj;
                    }),
                    columns : resultSet.columns,
                };
                return selectResult;
            });
    }
    async insertOne<TableT extends squill.InsertableTable>(
        table: TableT,
        row: squill.BuiltInInsertRow<TableT>
    ): Promise<squill.InsertOneResult> {
        const sql = insertOneSqlString("INSERT", table, row);
        return this.lock((rawNestedConnection) => {
            const nestedConnection = (rawNestedConnection as Connection);
            return nestedConnection.exec(sql)
                .then(async (result) => {
                    if (result.execResult.length != 0) {
                        throw new Error(`insertOne() should have no result set; found ${result.execResult.length}`);
                    }
                    if (result.rowsModified != 1) {
                        throw new Error(`insertOne() should modify one row`);
                    }

                    const autoIncrementId = (
                        (table.autoIncrement == undefined) ?
                        undefined :
                        (row[table.autoIncrement as keyof typeof row] === undefined) ?
                        await squill
                            .selectValue(() => ExprLib.lastInsertRowId())
                            .fetchValue(nestedConnection) :
                        /**
                         * Emulate MySQL behaviour
                         */
                        tm.BigInt(0)
                    );

                    const insertOneResult : squill.InsertOneResult = {
                        query : { sql, },
                        insertedRowCount : tm.BigInt(1) as 1n,
                        autoIncrementId : (
                            autoIncrementId == undefined ?
                            undefined :
                            tm.BigIntUtil.equal(autoIncrementId, tm.BigInt(0)) ?
                            undefined :
                            autoIncrementId
                        ),
                        warningCount : tm.BigInt(0),
                        message : "ok",
                    };
                    return insertOneResult;
                })
                .catch((err) => {
                    //console.error("error encountered", sql);
                    throw err;
                });
        });
    }
    async insertMany<TableT extends squill.InsertableTable>(
        table: TableT,
        rows: readonly [squill.BuiltInInsertRow<TableT>, ...squill.BuiltInInsertRow<TableT>[]]
    ): Promise<squill.InsertManyResult> {
        const sql = await insertManySqlString(this, "INSERT", table, rows);
        return this.lock(async (rawNestedConnection) : Promise<squill.InsertManyResult> => {
            const nestedConnection = rawNestedConnection as Connection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                    if (result.execResult.length != 0) {
                        throw new Error(`insertMany() should have no result set; found ${result.execResult.length}`);
                    }
                    if (result.rowsModified != rows.length) {
                        throw new Error(`insertMany() should modify ${rows.length} rows; only modified ${result.rowsModified} rows`);
                    }

                    return {
                        query : { sql, },
                        insertedRowCount : tm.BigInt(result.rowsModified),
                        warningCount : tm.BigInt(0),
                        message : "ok",
                    };
                })
                .catch((err) => {
                    //console.error("error encountered", sql);
                    throw err;
                });
        });
    }
    insertIgnoreOne<TableT extends squill.InsertableTable>(
        table: TableT,
        row: squill.BuiltInInsertRow<TableT>
    ): Promise<squill.InsertIgnoreOneResult> {
        const sql = insertOneSqlString("INSERT OR IGNORE", table, row);
        return this.lock((rawNestedConnection) => {
            const nestedConnection = (rawNestedConnection as Connection);
            return nestedConnection.exec(sql)
                .then(async (result) => {
                    if (result.execResult.length != 0) {
                        throw new Error(`insertIgnoreOne() should have no result set; found ${result.execResult.length}`);
                    }
                    if (result.rowsModified != 0 && result.rowsModified != 1) {
                        throw new Error(`insertIgnoreOne() should modify zero or one row`);
                    }

                    if (result.rowsModified == 0) {
                        return {
                            query : { sql, },
                            insertedRowCount : tm.BigInt(result.rowsModified) as 0n,
                            autoIncrementId : undefined,
                            warningCount : tm.BigInt(1),
                            message : "ok",
                        };
                    }

                    const autoIncrementId = (
                        (table.autoIncrement == undefined) ?
                        undefined :
                        (row[table.autoIncrement as keyof typeof row] === undefined) ?
                        await squill
                            .selectValue(() => ExprLib.lastInsertRowId())
                            .fetchValue(nestedConnection) :
                        /**
                         * Emulate MySQL behaviour
                         */
                        tm.BigInt(0)
                    );

                    return {
                        query : { sql, },
                        insertedRowCount : tm.BigInt(result.rowsModified) as 1n,
                        autoIncrementId : (
                            autoIncrementId == undefined ?
                            undefined :
                            tm.BigIntUtil.equal(autoIncrementId, tm.BigInt(0)) ?
                            undefined :
                            autoIncrementId
                        ),
                        warningCount : tm.BigInt(0),
                        message : "ok",
                    };
                })
                .catch((err) => {
                    //console.error("error encountered", sql);
                    throw err;
                });
        });
    }
    async insertIgnoreMany<TableT extends squill.InsertableTable>(
        table: TableT,
        rows: readonly [squill.BuiltInInsertRow<TableT>, ...squill.BuiltInInsertRow<TableT>[]]
    ): Promise<squill.InsertIgnoreManyResult> {
        const sql = await insertManySqlString(this, "INSERT OR IGNORE", table, rows);
        return this.lock(async (rawNestedConnection) : Promise<squill.InsertIgnoreManyResult> => {
            const nestedConnection = rawNestedConnection as Connection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                    if (result.execResult.length != 0) {
                        throw new Error(`insertIgnoreMany() should have no result set; found ${result.execResult.length}`);
                    }
                    if (result.rowsModified > rows.length) {
                        throw new Error(`insertIgnoreMany() should modify ${rows.length} rows or less; modified ${result.rowsModified} rows`);
                    }

                    return {
                        query : { sql, },
                        insertedRowCount : tm.BigInt(result.rowsModified),
                        warningCount : tm.BigInt(rows.length - result.rowsModified),
                        message : "ok",
                    };
                })
                .catch((err) => {
                    //console.error("error encountered", sql);
                    throw err;
                });
        });
    }
    replaceOne<TableT extends squill.InsertableTable & squill.DeletableTable>(
        table: TableT,
        row: squill.BuiltInInsertRow<TableT>
    ): Promise<squill.ReplaceOneResult> {
        const sql = insertOneSqlString("REPLACE", table, row);
        return this.lock((rawNestedConnection) => {
            const nestedConnection = (rawNestedConnection as unknown as Connection);
            return nestedConnection.exec(sql)
                .then(async (result) => {
                    if (result.execResult.length != 0) {
                        throw new Error(`replaceOne() should have no result set; found ${result.execResult.length}`);
                    }
                    if (result.rowsModified != 1) {
                        throw new Error(`replaceOne() should modify one row`);
                    }

                    const autoIncrementId = (
                        (table.autoIncrement == undefined) ?
                        undefined :
                        (row[table.autoIncrement as keyof typeof row] === undefined) ?
                        await squill
                            .selectValue(() => ExprLib.lastInsertRowId())
                            .fetchValue(nestedConnection) :
                        /**
                         * Emulate MySQL behaviour
                         */
                        tm.BigInt(0)
                    );

                    return {
                        query : { sql, },
                        insertedOrReplacedRowCount : tm.BigInt(1) as 1n,
                        autoIncrementId : (
                            autoIncrementId == undefined ?
                            undefined :
                            tm.BigIntUtil.equal(autoIncrementId, tm.BigInt(0)) ?
                            undefined :
                            autoIncrementId
                        ),
                        warningCount : tm.BigInt(0),
                        message : "ok",
                    };
                })
                .catch((err) => {
                    //console.error("error encountered", sql);
                    throw err;
                });
        });
    }
    async replaceMany<TableT extends squill.InsertableTable & squill.DeletableTable>(
        table: TableT,
        rows : readonly [squill.BuiltInInsertRow<TableT>, ...squill.BuiltInInsertRow<TableT>[]]
    ): Promise<squill.ReplaceManyResult> {
        const sql = await insertManySqlString(this, "REPLACE", table, rows);
        return this.exec(sql)
            .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`replaceMany() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified != rows.length) {
                    throw new Error(`replaceMany() should modify ${rows.length} rows; modified ${result.rowsModified} rows`);
                }

                return {
                    query : { sql, },
                    insertedOrReplacedRowCount : tm.BigInt(result.rowsModified),
                    warningCount : tm.BigInt(0),
                    message : "ok",
                };
            })
            .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
    }
    async insertSelect<
        QueryT extends squill.QueryBaseUtil.AfterSelectClause & squill.QueryBaseUtil.NonCorrelated,
        TableT extends squill.InsertableTable
    >(
        query: QueryT,
        table: TableT,
        insertSelectRow: squill.InsertSelectRow<QueryT, TableT>
    ): Promise<squill.InsertManyResult> {
        const sql = await insertSelectSqlString(this, "INSERT", query, table, insertSelectRow);
        return this.lock(async (rawNestedConnection) : Promise<squill.InsertManyResult> => {
            const nestedConnection = rawNestedConnection as unknown as Connection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                    if (result.execResult.length != 0) {
                        throw new Error(`insertSelect() should have no result set; found ${result.execResult.length}`);
                    }
                    if (result.rowsModified < 0) {
                        throw new Error(`insertSelect() should modify zero, or more rows; modified ${result.rowsModified} rows`);
                    }

                    return {
                        query : { sql, },
                        insertedRowCount : tm.BigInt(result.rowsModified),
                        warningCount : tm.BigInt(0),
                        message : "ok",
                    };
                })
                .catch((err) => {
                    //console.error("error encountered", sql);
                    throw err;
                });
        });
    }
    async insertIgnoreSelect<
        QueryT extends squill.QueryBaseUtil.AfterSelectClause & squill.QueryBaseUtil.NonCorrelated,
        TableT extends squill.InsertableTable
    >(
        query: QueryT,
        table: TableT,
        insertSelectRow: squill.InsertSelectRow<QueryT, TableT>
    ): Promise<squill.InsertIgnoreManyResult> {
        const sql = await insertSelectSqlString(this, "INSERT OR IGNORE", query, table, insertSelectRow);
        return this.transactionIfNotInOne(async (rawNestedConnection) : Promise<squill.InsertIgnoreManyResult> => {
            const nestedConnection = rawNestedConnection as unknown as Connection;
            const maxInsertCount = await squill.ExecutionUtil.count(query, nestedConnection);
            return nestedConnection.exec(sql)
                .then(async (result) => {
                    if (result.execResult.length != 0) {
                        throw new Error(`insertIgnoreSelect() should have no result set; found ${result.execResult.length}`);
                    }
                    if (result.rowsModified < 0) {
                        throw new Error(`insertIgnoreSelect() should modify zero, or more rows; modified ${result.rowsModified} rows`);
                    }

                    return {
                        query : { sql, },
                        insertedRowCount : tm.BigInt(result.rowsModified),
                        warningCount : tm.BigIntUtil.sub(
                            maxInsertCount,
                            result.rowsModified
                        ),
                        message : "ok",
                    };
                })
                .catch((err) => {
                    //console.error("error encountered", sql);
                    throw err;
                });
        });
    }
    async replaceSelect<
        QueryT extends squill.QueryBaseUtil.AfterSelectClause & squill.QueryBaseUtil.NonCorrelated,
        TableT extends squill.InsertableTable
    >(
        query: QueryT,
        table: TableT,
        insertSelectRow: squill.InsertSelectRow<QueryT, TableT>
    ): Promise<squill.ReplaceManyResult> {
        const sql = await insertSelectSqlString(this, "REPLACE", query, table, insertSelectRow);
        return this.exec(sql)
            .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`replaceSelect() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified < 0) {
                    throw new Error(`replaceSelect() should modify zero, or more rows; modified ${result.rowsModified} rows`);
                }

                return {
                    query : { sql, },
                    insertedOrReplacedRowCount : tm.BigInt(result.rowsModified),
                    warningCount : tm.BigInt(0),
                    message : "ok",
                };
            })
            .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
    }
    update<TableT extends squill.ITable> (
        table : TableT,
        whereClause : squill.WhereClause,
        assignmentMap : squill.BuiltInAssignmentMap<TableT>
    ) : Promise<squill.UpdateResult> {
        const sql = updateSqlString(table, whereClause, assignmentMap);
        if (sql == undefined) {
            return squill.from(table as any)
                .where(() => whereClause as any)
                .count(this)
                .then((count) => {
                    return {
                        query : {
                            /**
                             * No `UPDATE` statement executed
                             */
                            sql : "",
                        },
                        foundRowCount : count,
                        updatedRowCount : tm.BigInt(0),
                        warningCount : tm.BigInt(0),
                        message : "ok",
                    };
                });
        }

        return this.exec(sql)
            .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`update() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified < 0) {
                    throw new Error(`update() should modify zero, or more rows; modified ${result.rowsModified} rows`);
                }

                return {
                    query : { sql, },
                    foundRowCount : tm.BigInt(result.rowsModified),
                    updatedRowCount : tm.BigInt(result.rowsModified),
                    warningCount : tm.BigInt(0),
                    message : "ok",
                };
            })
            .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
    }
    delete(table: squill.DeletableTable, whereClause: squill.WhereClause): Promise<squill.DeleteResult> {
        const sql = deleteSqlString(table, whereClause);
        return this.exec(sql)
            .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`delete() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified < 0) {
                    throw new Error(`delete() should modify zero, or more rows; modified ${result.rowsModified} rows`);
                }

                return {
                    query : { sql, },
                    deletedRowCount : tm.BigInt(result.rowsModified),
                    warningCount : tm.BigInt(0),
                    message : "ok",
                };
            })
            .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
    }
    tryFetchSchemaMeta(schemaAlias: string | undefined): Promise<squill.SchemaMeta | undefined> {
        return tryFetchSchemaMeta(this, schemaAlias);
    }
    tryFetchGeneratedColumnExpression(
        schemaAlias: string | undefined,
        tableAlias: string,
        columnAlias: string
    ): Promise<string | undefined> {
        return tryFetchGeneratedColumnExpression(
            this,
            schemaAlias,
            tableAlias,
            columnAlias
        );
    }
    transaction<ResultT>(
        callback: squill.LockCallback<squill.ITransactionConnection, ResultT>
    ): Promise<ResultT>;
    transaction<ResultT>(
        minimumIsolationLevel: squill.IsolationLevel,
        callback: squill.LockCallback<squill.ITransactionConnection, ResultT>
    ): Promise<ResultT>;
    transaction<ResultT>(
        ...args : (
            | [squill.LockCallback<squill.ITransactionConnection, ResultT>]
            | [squill.IsolationLevel, squill.LockCallback<squill.ITransactionConnection, ResultT>]
        )
    ): Promise<ResultT> {
        return this.lock(async (nestedConnection) => {
            return (nestedConnection as unknown as Connection).transactionImpl(
                args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0],
                squill.TransactionAccessMode.READ_WRITE,
                args.length == 1 ? args[0] : args[1]
            );
        });
    }
    readOnlyTransaction<ResultT>(
        callback: squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ): Promise<ResultT>;
    readOnlyTransaction<ResultT>(
        minimumIsolationLevel: squill.IsolationLevel,
        callback: squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ): Promise<ResultT>;
    readOnlyTransaction<ResultT>(
        ...args : (
            | [squill.LockCallback<squill.IsolatedSelectConnection, ResultT>]
            | [squill.IsolationLevel, squill.LockCallback<squill.IsolatedSelectConnection, ResultT>]
        )
    ): Promise<ResultT> {
        return this.lock(async (nestedConnection) => {
            return (nestedConnection as unknown as Connection).transactionImpl(
                args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0],
                squill.TransactionAccessMode.READ_ONLY,
                args.length == 1 ? args[0] : args[1]
            );
        });
    }
    isInTransaction(): this is squill.ITransactionConnection {
        return this.sharedConnectionInformation.transactionData != undefined;
    }

    private savepointData : (
        | undefined
        | {
            savepointName : string,
        }
    ) = undefined;
    private savepointImpl<ResultT> (
        callback : squill.LockCallback<squill.ITransactionConnection & squill.ConnectionComponent.InSavepoint, ResultT>
    ) : Promise<ResultT> {
        if (this.sharedConnectionInformation.transactionData == undefined) {
            return Promise.reject(new Error(`Cannot use savepoint outside transaction`));
        }
        if (this.savepointData != undefined) {
            return Promise.reject(new Error(`A savepoint is already in progress`));
        }
        const savepointData = {
            savepointName : `squill_savepoint_${++this.sharedConnectionInformation.savepointId}`,
        };
        this.savepointData = savepointData;
        this.eventEmitters.savepoint();

        return new Promise<ResultT>((resolve, reject) => {
            this.rawQuery(`SAVEPOINT ${savepointData.savepointName}`)
                .then(() => {
                    if (!this.isInTransaction()) {
                        throw new Error(`Expected to be in transaction`);
                    }
                    if (this.savepointData != savepointData) {
                        /**
                         * Why did the savepoint information change?
                         */
                        throw new Error(`Expected to be in savepoint ${savepointData.savepointName}`);
                    }
                    return callback(this as squill.ITransactionConnection & squill.ConnectionComponent.InSavepoint);
                })
                .then((result) => {
                    if (!this.isInTransaction()) {
                        /**
                         * `.rollback()` was probably explicitly called
                         */
                        resolve(result);
                        return;
                    }
                    if (this.savepointData == undefined) {
                        /**
                         * `.rollbackToSavepoint()` was probably explicitly called
                         */
                        resolve(result);
                        return;
                    }
                    if (this.savepointData != savepointData) {
                        /**
                         * Some weird thing is going on here.
                         * This should never happen.
                         */
                        reject(new Error(`Expected to be in savepoint ${savepointData.savepointName} or to not be in a savepoint`));
                        return;
                    }

                    this.releaseSavepoint()
                        .then(() => {
                            resolve(result);
                        })
                        .catch((_releaseErr) => {
                            /**
                             * Being unable to release a savepoint isn't so bad.
                             * It usually just means the DBMS cannot reclaim resources
                             * until the transaction ends.
                             *
                             * @todo Do something with `_releaseErr`
                             */
                            resolve(result);
                        });
                })
                .catch((err) => {
                    if (!this.isInTransaction()) {
                        /**
                         * `.rollback()` was probably explicitly called
                         */
                        reject(err);
                        return;
                    }
                    if (this.savepointData == undefined) {
                        /**
                         * `.rollbackToSavepoint()` was probably explicitly called
                         */
                        reject(err);
                        return;
                    }
                    if (this.savepointData != savepointData) {
                        /**
                         * Some weird thing is going on here.
                         * This should never happen.
                         */
                        err.savepointErr = new Error(`Expected to be in savepoint ${savepointData.savepointName} or to not be in a savepoint`);
                        reject(err);
                        return;
                    }

                    this.rollbackToSavepoint()
                        .then(() => {
                            reject(err);
                        })
                        .catch((rollbackToSavepointErr) => {
                            err.rollbackToSavepointErr = rollbackToSavepointErr;
                            reject(err);
                        });
                });
        });
    }
    rollbackToSavepoint () : Promise<void> {
        if (this.savepointData == undefined) {
            return Promise.reject(new Error("Not in savepoint; cannot release savepoint"));
        }
        return this.rawQuery(`ROLLBACK TO SAVEPOINT ${this.savepointData.savepointName}`)
            .then(() => {
                this.savepointData = undefined;
                this.eventEmitters.rollbackToSavepoint();
            });
    }
    releaseSavepoint () : Promise<void> {
        if (this.savepointData == undefined) {
            return Promise.reject(new Error("Not in savepoint; cannot release savepoint"));
        }
        return this.rawQuery(`RELEASE SAVEPOINT ${this.savepointData.savepointName}`)
            .then(() => {
                this.savepointData = undefined;
                this.eventEmitters.releaseSavepoint();
            });
    }
    savepoint<ResultT> (
        callback : squill.LockCallback<squill.ITransactionConnection & squill.ConnectionComponent.InSavepoint, ResultT>
    ) : Promise<ResultT> {
        return this.lock(async (nestedConnection) => {
            return (nestedConnection as unknown as Connection).savepointImpl(
                callback
            );
        });
    }

    private deallocatePromise : Promise<void>|undefined = undefined;
    deallocate (): Promise<void> {
        //console.log("deallocating...");
        if (this.deallocatePromise == undefined) {
            this.deallocatePromise = this.asyncQueue.stop()
                .then(
                    () => {
                        //console.log("deallocated");
                        /**
                         * @todo Handle sync errors somehow.
                         * Maybe propagate them to `IPool` and have an `onError` handler or something
                         */
                        this.eventEmitters.commit();
                    },
                    (err) => {
                        //console.log("deallocated with error");
                        /**
                         * @todo Handle sync errors somehow.
                         * Maybe propagate them to `IPool` and have an `onError` handler or something
                         */
                        this.eventEmitters.commit();
                        throw err;
                    }
                );
            return this.deallocatePromise;
        }
        return Promise.reject("This connection has already been deallocated");
    }
    isDeallocated(): boolean {
        return this.deallocatePromise != undefined;
    }
}
