/**
 * The web worker implementation from `sql.js` is... Not great.
 * We write our own, to preserve a little more sanity.
 */
import * as sqljs from "../sql-wasm/sql-wasm-debug";

type Identity<T> = T;
type Merge<T> = Identity<{ [k in keyof T] : T[k] }>;
type DistributeMerge<T> =
    T extends any ?
    Merge<T> :
    never
;
type AllKeys<T> =
    T extends any ?
    keyof T :
    never
;
type ToDiscriminatedUnion<T, AllKeyT extends PropertyKey=AllKeys<T>> =
    T extends any ?
    Merge<
        & T
        & {
            [k in Exclude<AllKeyT, keyof T>]? : undefined
        }
    > :
    never
;
export enum SqliteAction {
    OPEN = "OPEN",
    EXEC = "EXEC",
    EXPORT = "EXPORT",
    CLOSE = "CLOSE",
    CREATE_FUNCTION = "CREATE_FUNCTION",
    CREATE_AGGREGATE = "CREATE_AGGREGATE",
}
export type FromSqliteMessage = ToDiscriminatedUnion<
    & { id : number }
    & (
        | {
            action : SqliteAction.OPEN,
        }
        | {
            action : SqliteAction.EXEC,
            execResult : sqljs.ExecResult,
            rowsModified : number,
        }
        | {
            action : SqliteAction.EXPORT,
            buffer : Uint8Array,
        }
        | {
            action : SqliteAction.CLOSE,
        }
        | {
            action : SqliteAction.CREATE_FUNCTION,
        }
        | {
            action : SqliteAction.CREATE_AGGREGATE,
        }
        | {
            action : SqliteAction,
            error : string,
        }
    )
>;
export type ToSqliteMessage = DistributeMerge<
    & { id : number, }
    & (
        | {
            action : SqliteAction.OPEN,
            buffer : Uint8Array|undefined,
        }
        | {
            action : SqliteAction.EXEC,
            sql : string,
        }
        | {
            action : SqliteAction.EXPORT,
        }
        | {
            action : SqliteAction.CLOSE,
        }
        | {
            action : SqliteAction.CREATE_FUNCTION,
            functionName : string,
            options : { isVarArg? : boolean, },
            /**
             * ```ts
             * ((a, b) => a+b).toString()
             * ```
             */
            impl : string,
        }
        | {
            action : SqliteAction.CREATE_AGGREGATE,
            functionName : string,
            /**
             * ```ts
             * (() => { return { count : 0 }; }).toString()
             * ```
             */
            init : string,
            /**
             * ```ts
             * ((state) => { ++state.count; }).toString()
             * ```
             */
            step : string,
            /**
             * ```ts
             * ((state) => state.count).toString()
             * ```
             */
            finalize : string,
        }
    )
>;
export interface ISqliteWorker {
    onmessage : undefined|((message : { data : FromSqliteMessage }) => void),
    onmessageerror : undefined|((error : any) => void),
    onerror : undefined|((error : any) => void),
    postMessage : (message : ToSqliteMessage) => void,
}
