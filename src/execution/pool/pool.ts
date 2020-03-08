import * as squill from "@squill/squill";
import {ISqliteWorker, SqliteAction} from "../../worker";
import {IdAllocator, SharedConnectionInformation, Connection} from "../connection";
import {initPolyfill} from "./polyfill";

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
            await initPolyfill(connection);
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
