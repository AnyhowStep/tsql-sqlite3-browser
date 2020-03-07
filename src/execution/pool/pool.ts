import * as tm from "type-mapping";
import * as squill from "@squill/squill";
import {ISqliteWorker, SqliteAction} from "../../worker";
import {IdAllocator, SharedConnectionInformation, Connection} from "../connection";

declare function btoa (blob : Uint8Array) : string;
declare function atob (base64Str : string) : string;

export class Pool implements squill.IPool {
    private readonly worker : ISqliteWorker;
    private readonly idAllocator : IdAllocator;
    private readonly sharedConnectionInfo : SharedConnectionInformation = {
        transactionData : undefined,
        savepointId : 0,
    };
    private readonly asyncQueue : squill.AsyncQueue<Connection>;
    constructor (worker : ISqliteWorker) {
        this.worker = worker;
        this.idAllocator = new IdAllocator();
        this.asyncQueue = new squill.AsyncQueue<Connection>(
            () => {
                const connection = new Connection({
                    pool : this,
                    eventEmitters : new squill.ConnectionEventEmitterCollection(this),
                    worker : this.worker,
                    idAllocator : this.idAllocator,
                    sharedConnectionInformation : this.sharedConnectionInfo,
                });
                return {
                    item : connection,
                    deallocate : () => {
                        return connection.deallocate();
                    },
                };
            }
        );
        this.acquire = this.asyncQueue.enqueue as squill.AsyncQueue<squill.IConnection & Connection>["enqueue"];
        this.acquire(async (connection) => {
            /**
             * @todo Use `createVarArgFunction()`
             */
            await connection.createFunction("bigint_add", (a, b) => {
                if (tm.TypeUtil.isBigInt(a) && tm.TypeUtil.isBigInt(b)) {
                    const result = tm.BigIntUtil.add(a, b);
                    if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                        throw new Error(`DataOutOfRangeError: bigint_add result was ${String(result)}`);
                    }
                    if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                        throw new Error(`DataOutOfRangeError: bigint_add result was ${String(result)}`);
                    }
                    return result;
                } else {
                    throw new Error(`Can only add two bigint values`);
                }
            });
            /**
             * @todo Use `createVarArgFunction()`
             */
            await connection.createFunction("bigint_sub", (a, b) => {
                if (tm.TypeUtil.isBigInt(a) && tm.TypeUtil.isBigInt(b)) {
                    const result = tm.BigIntUtil.sub(a, b);
                    if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                        throw new Error(`DataOutOfRangeError: bigint_sub result was ${String(result)}`);
                    }
                    if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                        throw new Error(`DataOutOfRangeError: bigint_sub result was ${String(result)}`);
                    }
                    return result;
                } else {
                    throw new Error(`Can only sub two bigint values`);
                }
            });
            /**
             * @todo Use `createVarArgFunction()`
             */
            await connection.createFunction("bigint_mul", (a, b) => {
                if (tm.TypeUtil.isBigInt(a) && tm.TypeUtil.isBigInt(b)) {
                    const result = tm.BigIntUtil.mul(a, b);
                    if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                        throw new Error(`DataOutOfRangeError: bigint_mul result was ${String(result)}`);
                    }
                    if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                        throw new Error(`DataOutOfRangeError: bigint_mul result was ${String(result)}`);
                    }
                    return result;
                } else {
                    throw new Error(`Can only mul two bigint values`);
                }
            });
            /**
             * @todo Use `createVarArgFunction()`
             */
            await connection.createFunction("bigint_neg", (a) => {
                if (tm.TypeUtil.isBigInt(a)) {
                    const result = tm.BigIntUtil.sub(0, a);
                    if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                        throw new Error(`DataOutOfRangeError: bigint_neg result was ${String(result)}`);
                    }
                    if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                        throw new Error(`DataOutOfRangeError: bigint_neg result was ${String(result)}`);
                    }
                    return result;
                } else {
                    throw new Error(`Can only neg bigint values`);
                }
            });
            /**
             * @todo Use `createVarArgFunction()`
             */
            await connection.createFunction("bigint_div", (a, b) => {
                if (tm.TypeUtil.isBigInt(a) && tm.TypeUtil.isBigInt(b)) {
                    if (tm.BigIntUtil.equal(b, tm.BigInt(0))) {
                        throw new Error(`DivideByZeroError: Cannot divide by zero`);
                    }
                    const result = tm.BigIntUtil.div(a, b);
                    if (tm.BigIntUtil.lessThan(result, tm.BigInt("-9223372036854775808"))) {
                        throw new Error(`DataOutOfRangeError: bigint_div result was ${String(result)}`);
                    }
                    if (tm.BigIntUtil.greaterThan(result, tm.BigInt("9223372036854775807"))) {
                        throw new Error(`DataOutOfRangeError: bigint_div result was ${String(result)}`);
                    }
                    return result;
                } else {
                    throw new Error(`Can only div two bigint values`);
                }
            });
            await connection.createFunction("decimal_ctor", (x, precision, scale) => {
                if (
                    tm.TypeUtil.isBigInt(precision) &&
                    tm.TypeUtil.isBigInt(scale)
                ) {
                    if (typeof x == "string") {
                        const parsed = tm.mysql.decimal(precision, scale)("rawDecimal", x);
                        return parsed.toString();
                    } else {
                        throw new Error(`Only string to decimal cast implemented`);
                    }
                } else {
                    throw new Error(`Precision and scale must be bigint`);
                }
            });
            await connection.createFunction("ASCII", (x) => {
                if (typeof x == "string") {
                    if (x == "") {
                        return 0;
                    }
                    return x.charCodeAt(0);
                } else {
                    throw new Error(`ASCII only implemented for string`);
                }
            });
            await connection.createFunction("BIN", (x) => {
                if (tm.TypeUtil.isBigInt(x)) {
                    if (tm.BigIntUtil.greaterThanOrEqual(x, 0)) {
                        return tm.BigIntUtil.toString(
                            x,
                            2
                        );
                    } else {
                        return tm.BigIntUtil.toString(
                            tm.BigIntUtil.add(
                                tm.BigIntUtil.leftShift(tm.BigInt(1), 64),
                                x
                            ),
                            2
                        );
                    }
                } else {
                    throw new Error(`BIN only implemented for bigint`);
                }
            });
            await connection.createVarArgFunction("CONCAT_WS", (separator, ...args) => {
                if (typeof separator == "string") {
                    return args.filter(arg => arg !== null).join(separator);
                } else {
                    throw new Error(`CONCAT_WS only implemented for string`);
                }
            });
            await connection.createFunction("FROM_BASE64", (x) => {
                if (typeof x == "string") {
                    const result = new Uint8Array(atob(x).split(",").filter(s => s != "").map(s => parseInt(s, 10)));
                    const base64Result = btoa(result);
                    if (x == base64Result) {
                        return result;
                    } else {
                        throw new Error(`Invalid Base64 string ${x}`);
                    }
                } else {
                    throw new Error(`FROM_BASE64 only implemented for string`);
                }
            });
            await connection.createFunction("LPAD", (str, len, pad) => {
                if (
                    typeof str == "string" &&
                    tm.TypeUtil.isBigInt(len) &&
                    typeof pad == "string"
                ) {
                    if (str.length > Number(len)) {
                        return str.substr(0, Number(len));
                    } else if (str.length == Number(len)) {
                        return str;
                    } else {
                        return str.padStart(Number(len), pad);
                    }
                } else {
                    throw new Error(`LPAD only implemented for (string, bigint, string)`);
                }
            });
            await connection.createFunction("RPAD", (str, len, pad) => {
                if (
                    typeof str == "string" &&
                    tm.TypeUtil.isBigInt(len) &&
                    typeof pad == "string"
                ) {
                    if (str.length > Number(len)) {
                        return str.substr(0, Number(len));
                    } else if (str.length == Number(len)) {
                        return str;
                    } else {
                        return str.padEnd(Number(len), pad);
                    }
                } else {
                    throw new Error(`RPAD only implemented for (string, bigint, string)`);
                }
            });
            await connection.createFunction("REPEAT", (str, count) => {
                if (
                    typeof str == "string" &&
                    tm.TypeUtil.isBigInt(count)
                ) {
                    if (Number(count) < 0) {
                        return "";
                    }
                    return str.repeat(Number(count));
                } else {
                    throw new Error(`REPEAT only implemented for (string, bigint)`);
                }
            });
            await connection.createFunction("REVERSE", (str) => {
                if (
                    typeof str == "string"
                ) {
                    return [...str].reverse().join("");
                } else {
                    throw new Error(`REVERSE only implemented for (string)`);
                }
            });
            await connection.createFunction("TO_BASE64", (blob) => {
                if (
                    blob instanceof Uint8Array
                ) {
                    return btoa(blob);
                } else {
                    throw new Error(`TO_BASE64 only implemented for (Uint8Array)`);
                }
            });
            await connection.createFunction("UNHEX", (x) => {
                if (typeof x == "string") {
                    const matches = x.match(/.{2}/g);
                    if (matches == undefined) {
                        return new Uint8Array([]);
                    }
                    const result = new Uint8Array(matches.map(str => parseInt(str, 16)));
                    const hexResult = [...result].map((n) => ("00" + n.toString(16)).slice(-2)).join("");
                    if (x.toUpperCase() == hexResult.toUpperCase()) {
                        return result;
                    } else {
                        throw new Error(`Invalid Hex string ${x}`);
                    }
                } else {
                    throw new Error(`UNHEX only implemented for string`);
                }
            });
            await connection.createFunction("FLOOR", (x) => {
                if (tm.TypeUtil.isBigInt(x)) {
                    return x;
                } else if (typeof x == "number") {
                    return Math.floor(x);
                } else {
                    throw new Error(`Can only FLOOR bigint or double`);
                }
            });
            await connection.createFunction("CEILING", (x) => {
                if (tm.TypeUtil.isBigInt(x)) {
                    return x;
                } else if (typeof x == "number") {
                    return Math.ceil(x);
                } else {
                    throw new Error(`Can only CEILING bigint or double`);
                }
            });
            await connection.createFunction("CBRT", (x) => {
                if (typeof x == "number") {
                    return Math.cbrt(x);
                } else {
                    throw new Error(`CBRT(${typeof x}) not implmented`);
                }
            });
            await connection.createFunction("COT", (x) => {
                if (typeof x == "number") {
                    const divisor = Math.cos(x);
                    const dividend = Math.sin(x);
                    if (dividend == 0) {
                        return null;
                    } else {
                        return divisor/dividend;
                    }
                } else {
                    throw new Error(`COT(${typeof x}) not implmented`);
                }
            });
            await connection.createFunction("LN", (x) => {
                if (typeof x == "number") {
                    if (x == 0) {
                        return null;
                    }
                    const result = Math.log(x);
                    return result;
                } else {
                    throw new Error(`LN(${typeof x}) not implmented`);
                }
            });
            await connection.createFunction("LOG", (x, y) => {
                if (typeof x == "number" && typeof y == "number") {
                    if (x <= 0 || x == 1) {
                        return null;
                    }
                    if (y == 0) {
                        return null;
                    }
                    return Math.log(y) / Math.log(x);
                } else {
                    throw new Error(`LOG(${typeof x}, ${typeof y}) not implmented`);
                }
            });
            await connection.createFunction("LOG2", (x) => {
                if (typeof x == "number") {
                    if (x == 0) {
                        return null;
                    }
                    const result = Math.log2(x);
                    return result;
                } else {
                    throw new Error(`LOG2(${typeof x}) not implmented`);
                }
            });
            await connection.createFunction("LOG10", (x) => {
                if (typeof x == "number") {
                    if (x == 0) {
                        return null;
                    }
                    const result = Math.log10(x);
                    return result;
                } else {
                    throw new Error(`LOG10(${typeof x}) not implmented`);
                }
            });
            await connection.createFunction("FRANDOM", () => {
                return Math.random();
            });
            await connection.createAggregate(
                "STDDEV_POP",
                () => {
                    return {
                        values : [] as number[],
                    };
                },
                (state, x) => {
                    if (x === null) {
                        return;
                    }
                    if (typeof x == "number") {
                        state.values.push(x);
                    } else {
                        throw new Error(`STDDEV_POP(${typeof x}) not implmented`);
                    }
                },
                (state) => {
                    if (state == undefined) {
                        return null;
                    }
                    if (state.values.length == 0) {
                        return null;
                    }
                    const sum = state.values.reduce(
                        (sum, value) => sum + value,
                        0
                    );
                    const count = state.values.length;
                    const avg = sum/count;
                    const squaredErrors = state.values.map(value => {
                        return Math.pow(value - avg, 2);
                    });
                    const sumSquaredErrors = squaredErrors.reduce(
                        (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                        0
                    );
                    return Math.sqrt(
                        sumSquaredErrors / count
                    );
                }
            );
            await connection.createAggregate(
                "STDDEV_SAMP",
                () => {
                    return {
                        values : [] as number[],
                    };
                },
                (state, x) => {
                    if (x === null) {
                        return;
                    }
                    if (typeof x == "number") {
                        state.values.push(x);
                    } else {
                        throw new Error(`STDDEV_SAMP(${typeof x}) not implmented`);
                    }
                },
                (state) => {
                    if (state == undefined) {
                        return null;
                    }
                    if (state.values.length == 0) {
                        return null;
                    }
                    if (state.values.length == 1) {
                        return null;
                    }
                    const sum = state.values.reduce(
                        (sum, value) => sum + value,
                        0
                    );
                    const count = state.values.length;
                    const avg = sum/count;
                    const squaredErrors = state.values.map(value => {
                        return Math.pow(value - avg, 2);
                    });
                    const sumSquaredErrors = squaredErrors.reduce(
                        (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                        0
                    );
                    return Math.sqrt(
                        sumSquaredErrors / (count-1)
                    );
                }
            );
            await connection.createAggregate(
                "VAR_POP",
                () => {
                    return {
                        values : [] as number[],
                    };
                },
                (state, x) => {
                    if (x === null) {
                        return;
                    }
                    if (typeof x == "number") {
                        state.values.push(x);
                    } else {
                        throw new Error(`VAR_POP(${typeof x}) not implmented`);
                    }
                },
                (state) => {
                    if (state == undefined) {
                        return null;
                    }
                    if (state.values.length == 0) {
                        return null;
                    }
                    const sum = state.values.reduce(
                        (sum, value) => sum + value,
                        0
                    );
                    const count = state.values.length;
                    const avg = sum/count;
                    const squaredErrors = state.values.map(value => {
                        return Math.pow(value - avg, 2);
                    });
                    const sumSquaredErrors = squaredErrors.reduce(
                        (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                        0
                    );
                    return sumSquaredErrors / count;
                }
            );
            await connection.createAggregate(
                "VAR_SAMP",
                () => {
                    return {
                        values : [] as number[],
                    };
                },
                (state, x) => {
                    if (x === null) {
                        return;
                    }
                    if (typeof x == "number") {
                        state.values.push(x);
                    } else {
                        throw new Error(`VAR_SAMP(${typeof x}) not implmented`);
                    }
                },
                (state) => {
                    if (state == undefined) {
                        return null;
                    }
                    if (state.values.length == 0) {
                        return null;
                    }
                    if (state.values.length == 1) {
                        return null;
                    }
                    const sum = state.values.reduce(
                        (sum, value) => sum + value,
                        0
                    );
                    const count = state.values.length;
                    const avg = sum/count;
                    const squaredErrors = state.values.map(value => {
                        return Math.pow(value - avg, 2);
                    });
                    const sumSquaredErrors = squaredErrors.reduce(
                        (sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError,
                        0
                    );
                    return sumSquaredErrors / (count-1);
                }
            );
        }).then(
            () => {},
            (err) => {
                //console.error("Error creating functions", err);
                //process.exit(1);
                throw err;
            }
        );
    }

    readonly acquire : squill.AsyncQueue<squill.IConnection & Connection>["enqueue"];

    acquireTransaction<ResultT> (
        callback : squill.LockCallback<squill.ITransactionConnection, ResultT>
    ) : Promise<ResultT>;
    acquireTransaction<ResultT> (
        minimumIsolationLevel : squill.IsolationLevel,
        callback : squill.LockCallback<squill.ITransactionConnection, ResultT>
    ) : Promise<ResultT>;
    acquireTransaction<ResultT> (
        ...args : (
            | [squill.LockCallback<squill.ITransactionConnection, ResultT>]
            | [squill.IsolationLevel, squill.LockCallback<squill.ITransactionConnection, ResultT>]
        )
    ) : Promise<ResultT> {
        return this.acquire((connection) => {
            /**
             * TS has weird narrowing behaviours
             */
            if (args.length == 1) {
                return connection.transaction(...args);
            } else {
                return connection.transaction(...args);
            }
        });
    }

    acquireReadOnlyTransaction<ResultT> (
        callback : squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ) : Promise<ResultT>;
    acquireReadOnlyTransaction<ResultT> (
        minimumIsolationLevel : squill.IsolationLevel,
        callback : squill.LockCallback<squill.IsolatedSelectConnection, ResultT>
    ) : Promise<ResultT>;
    acquireReadOnlyTransaction<ResultT> (
        ...args : (
            | [squill.LockCallback<squill.IsolatedSelectConnection, ResultT>]
            | [squill.IsolationLevel, squill.LockCallback<squill.IsolatedSelectConnection, ResultT>]
        )
    ) : Promise<ResultT> {
        return this.acquire((connection) => {
            /**
             * TS has weird narrowing behaviours
             */
            if (args.length == 1) {
                return connection.readOnlyTransaction(...args);
            } else {
                return connection.readOnlyTransaction(...args);
            }
        });
    }

    disconnect () : Promise<void> {
        return this.asyncQueue.stop()
            .then(
                () => this.worker.postMessage({
                    id : this.idAllocator.allocateId(),
                    action : SqliteAction.CLOSE,
                }),
                () => this.worker.postMessage({
                    id : this.idAllocator.allocateId(),
                    action : SqliteAction.CLOSE,
                })
            );
    }
    isDeallocated () {
        return this.asyncQueue.getShouldStop();
    }

    readonly onInsert = new squill.PoolEventEmitter<squill.IInsertEvent<squill.ITable>>();
    readonly onInsertOne = new squill.PoolEventEmitter<squill.IInsertOneEvent<squill.ITable>>();
    readonly onInsertAndFetch = new squill.PoolEventEmitter<squill.IInsertAndFetchEvent<squill.ITable>>();
    readonly onInsertSelect = new squill.PoolEventEmitter<squill.IInsertSelectEvent<squill.ITable>>();

    readonly onReplace = new squill.PoolEventEmitter<squill.IReplaceEvent<squill.ITable>>();
    readonly onReplaceOne = new squill.PoolEventEmitter<squill.IReplaceOneEvent<squill.ITable>>();
    readonly onReplaceSelect = new squill.PoolEventEmitter<squill.IReplaceSelectEvent<squill.ITable>>();

    readonly onUpdate = new squill.PoolEventEmitter<squill.IUpdateEvent<squill.ITable>>();
    readonly onUpdateAndFetch = new squill.PoolEventEmitter<squill.IUpdateAndFetchEvent<squill.ITable>>();

    readonly onDelete = new squill.PoolEventEmitter<squill.IDeleteEvent<squill.ITable>>();
}
