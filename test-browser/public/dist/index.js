/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"index": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./test-browser/src/index.ts","vendors"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./dist/driver/constants.js":
/*!**********************************!*\
  !*** ./dist/driver/constants.js ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SCHEMA_NAME = "main";
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./dist/driver/execution/connection/connection.js":
/*!********************************************************!*\
  !*** ./dist/driver/execution/connection/connection.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tm = __webpack_require__(/*! type-mapping */ "./node_modules/type-mapping/dist/index.js");
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const sqlfier_1 = __webpack_require__(/*! ../../sqlfier */ "./dist/driver/sqlfier/index.js");
const schema_introspection_1 = __webpack_require__(/*! ../../schema-introspection */ "./dist/driver/schema-introspection/index.js");
const worker_1 = __webpack_require__(/*! ../../worker */ "./dist/driver/worker.js");
const ExprLib = __webpack_require__(/*! ../../expr-library */ "./dist/driver/expr-library/index.js");
class IdAllocator {
    constructor() {
        this.nextId = 0;
    }
    allocateId() {
        return ++this.nextId;
    }
}
exports.IdAllocator = IdAllocator;
function onMessage(data, id, action, resolve, reject) {
    if (data.id != id) {
        reject(new Error(`Expected id ${id}; received ${data.id}`));
        return;
    }
    if (data.action != action) {
        reject(new Error(`Expected action ${action}; received ${data.action}`));
        return;
    }
    if (data.error == undefined) {
        resolve(data);
    }
    else {
        reject(new Error(data.error));
    }
}
function postMessage(worker, id, action, data, resolve) {
    return new Promise((innerResolve, originalInnerReject) => {
        const innerReject = (error) => {
            const sql = ("sql" in data ?
                data.sql :
                undefined);
            if (error instanceof Error) {
                if (error.message.startsWith("DataOutOfRangeError") || error.message.includes("overflow")) {
                    const newErr = new squill.DataOutOfRangeError({
                        innerError: error,
                        sql,
                    });
                    originalInnerReject(newErr);
                }
                else if (error.message.startsWith("DivideByZeroError")) {
                    const newErr = new squill.DivideByZeroError({
                        innerError: error,
                        sql,
                    });
                    originalInnerReject(newErr);
                }
                else {
                    const newErr = new squill.SqlError({
                        innerError: error,
                        sql,
                    });
                    originalInnerReject(newErr);
                }
            }
            else {
                const newErr = new squill.SqlError({
                    innerError: error,
                    sql,
                });
                originalInnerReject(newErr);
            }
        };
        worker.onmessage = (e) => {
            const data = e.data;
            onMessage(data, id, action, (data) => {
                innerResolve(resolve(data));
            }, innerReject);
        };
        worker.onmessageerror = innerReject;
        worker.onerror = innerReject;
        worker.postMessage({
            id,
            action,
            ...data,
        });
    });
}
class Connection {
    constructor({ pool, eventEmitters, worker, idAllocator, sharedConnectionInformation, }) {
        this.savepointData = undefined;
        this.deallocatePromise = undefined;
        this.pool = pool;
        this.eventEmitters = eventEmitters;
        this.idAllocator = idAllocator;
        this.asyncQueue = worker instanceof squill.AsyncQueue ?
            worker :
            new squill.AsyncQueue(() => {
                return {
                    item: worker,
                    deallocate: async () => { }
                };
            });
        this.sharedConnectionInformation = sharedConnectionInformation;
        this.sharedConnectionInformation;
    }
    tryGetFullConnection() {
        if (this.sharedConnectionInformation.transactionData != undefined &&
            this.sharedConnectionInformation.transactionData.accessMode == squill.TransactionAccessMode.READ_ONLY) {
            /**
             * Can't give a full connection if we are in a readonly transaction.
             * No `INSERT/UPDATE/DELETE` allowed.
             */
            return undefined;
        }
        else {
            return this;
        }
    }
    lock(callback) {
        return this.asyncQueue.lock((nestedAsyncQueue) => {
            const nestedConnection = new Connection({
                pool: this.pool,
                eventEmitters: this.eventEmitters,
                idAllocator: this.idAllocator,
                worker: nestedAsyncQueue,
                sharedConnectionInformation: this.sharedConnectionInformation
            });
            return callback(nestedConnection);
        });
    }
    rollback() {
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
    commit() {
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
    getMinimumIsolationLevel() {
        if (this.sharedConnectionInformation.transactionData == undefined) {
            throw new Error(`Not in transaction`);
        }
        return this.sharedConnectionInformation.transactionData.minimumIsolationLevel;
    }
    getTransactionAccessMode() {
        if (this.sharedConnectionInformation.transactionData == undefined) {
            throw new Error(`Not in transaction`);
        }
        return this.sharedConnectionInformation.transactionData.accessMode;
    }
    transactionImpl(minimumIsolationLevel, accessMode, callback) {
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
        return new Promise((resolve, reject) => {
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
                return callback(this);
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
    transactionIfNotInOneImpl(minimumIsolationLevel, accessMode, callback) {
        return this.lock(async (nestedConnection) => {
            if (nestedConnection.isInTransaction()) {
                if (squill.IsolationLevelUtil.isWeakerThan(this.getMinimumIsolationLevel(), minimumIsolationLevel)) {
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
                if (squill.TransactionAccessModeUtil.isLessPermissiveThan(this.getTransactionAccessMode(), accessMode)) {
                    return Promise.reject(new Error(`Current transaction access mode is ${this.getTransactionAccessMode()}; cannot allow ${accessMode}`));
                }
                try {
                    return callback(nestedConnection);
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
            else {
                return nestedConnection.transactionImpl(minimumIsolationLevel, accessMode, callback);
            }
        });
    }
    transactionIfNotInOne(...args) {
        return this.transactionIfNotInOneImpl(args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0], squill.TransactionAccessMode.READ_WRITE, args.length == 1 ? args[0] : args[1]);
    }
    readOnlyTransactionIfNotInOne(...args) {
        return this.transactionIfNotInOneImpl(args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0], squill.TransactionAccessMode.READ_ONLY, args.length == 1 ? args[0] : args[1]);
    }
    allocateId() {
        return this.idAllocator.allocateId();
    }
    open(dbFile) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.OPEN, {
                buffer: dbFile,
            }, () => { });
        });
    }
    export() {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.EXPORT, {}, data => data.buffer);
        });
    }
    close() {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.CLOSE, {}, () => { });
        });
    }
    createGlobalJsFunction(functionName, impl) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.CREATE_GLOBAL_JS_FUNCTION, {
                functionName,
                impl: impl.toString(),
            }, () => { });
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
    createFunction(functionName, impl) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.CREATE_FUNCTION, {
                functionName,
                options: {
                    isVarArg: false,
                },
                impl: impl.toString(),
            }, () => { });
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
    createVarArgFunction(functionName, impl) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.CREATE_FUNCTION, {
                functionName,
                options: {
                    isVarArg: true,
                },
                impl: impl.toString(),
            }, () => { });
        });
    }
    createAggregate(functionName, init, step, finalize) {
        return this.asyncQueue.enqueue((worker) => {
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.CREATE_AGGREGATE, {
                functionName,
                init: init.toString(),
                step: step.toString(),
                finalize: finalize.toString(),
            }, () => { });
        });
    }
    exec(sql) {
        return this.asyncQueue.enqueue((worker) => {
            //console.log("sql", sql);
            return postMessage(worker, this.allocateId(), worker_1.SqliteAction.EXEC, {
                sql,
            }, ({ execResult, rowsModified }) => {
                return { execResult, rowsModified };
            });
        });
    }
    rawQuery(sql) {
        //console.log("sql", sql);
        return this
            .exec(sql)
            .then((result) => {
            if (result.execResult.length == 0) {
                return {
                    query: { sql },
                    results: undefined,
                    columns: undefined,
                };
            }
            return {
                query: { sql },
                results: result.execResult[0].values,
                columns: result.execResult[0].columns,
            };
        });
    }
    async select(query) {
        const sql = squill.AstUtil.toSql(query, sqlfier_1.sqlfier);
        return this.exec(sql)
            .then((result) => {
            if (result.execResult.length > 1) {
                throw new Error(`Expected to run 1 SELECT statement; found ${result.execResult.length}`);
            }
            /**
             * When SQLite fetches zero rows, we get zero execResults...
             * Which is frustrating.
             */
            const resultSet = ((result.execResult.length == 0) ?
                {
                    values: [],
                    columns: [],
                } :
                result.execResult[0]);
            const selectResult = {
                query: { sql, },
                rows: resultSet.values.map((row) => {
                    const obj = {};
                    for (let i = 0; i < resultSet.columns.length; ++i) {
                        const k = resultSet.columns[i];
                        const v = row[i];
                        obj[k] = v;
                    }
                    return obj;
                }),
                columns: resultSet.columns,
            };
            return selectResult;
        });
    }
    async insertOne(table, row) {
        const sql = sqlfier_1.insertOneSqlString("INSERT", table, row);
        return this.lock((rawNestedConnection) => {
            const nestedConnection = rawNestedConnection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`insertOne() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified != 1) {
                    throw new Error(`insertOne() should modify one row`);
                }
                const autoIncrementId = ((table.autoIncrement == undefined) ?
                    undefined :
                    (row[table.autoIncrement] === undefined) ?
                        await squill
                            .selectValue(() => ExprLib.lastInsertRowId())
                            .fetchValue(nestedConnection) :
                        /**
                         * Emulate MySQL behaviour
                         */
                        tm.BigInt(0));
                const insertOneResult = {
                    query: { sql, },
                    insertedRowCount: tm.BigInt(1),
                    autoIncrementId: (autoIncrementId == undefined ?
                        undefined :
                        tm.BigIntUtil.equal(autoIncrementId, tm.BigInt(0)) ?
                            undefined :
                            autoIncrementId),
                    warningCount: tm.BigInt(0),
                    message: "ok",
                };
                return insertOneResult;
            })
                .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
        });
    }
    async insertMany(table, rows) {
        const sql = await sqlfier_1.insertManySqlString(this, "INSERT", table, rows);
        return this.lock(async (rawNestedConnection) => {
            const nestedConnection = rawNestedConnection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`insertMany() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified != rows.length) {
                    throw new Error(`insertMany() should modify ${rows.length} rows; only modified ${result.rowsModified} rows`);
                }
                return {
                    query: { sql, },
                    insertedRowCount: tm.BigInt(result.rowsModified),
                    warningCount: tm.BigInt(0),
                    message: "ok",
                };
            })
                .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
        });
    }
    insertIgnoreOne(table, row) {
        const sql = sqlfier_1.insertOneSqlString("INSERT OR IGNORE", table, row);
        return this.lock((rawNestedConnection) => {
            const nestedConnection = rawNestedConnection;
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
                        query: { sql, },
                        insertedRowCount: tm.BigInt(result.rowsModified),
                        autoIncrementId: undefined,
                        warningCount: tm.BigInt(1),
                        message: "ok",
                    };
                }
                const autoIncrementId = ((table.autoIncrement == undefined) ?
                    undefined :
                    (row[table.autoIncrement] === undefined) ?
                        await squill
                            .selectValue(() => ExprLib.lastInsertRowId())
                            .fetchValue(nestedConnection) :
                        /**
                         * Emulate MySQL behaviour
                         */
                        tm.BigInt(0));
                return {
                    query: { sql, },
                    insertedRowCount: tm.BigInt(result.rowsModified),
                    autoIncrementId: (autoIncrementId == undefined ?
                        undefined :
                        tm.BigIntUtil.equal(autoIncrementId, tm.BigInt(0)) ?
                            undefined :
                            autoIncrementId),
                    warningCount: tm.BigInt(0),
                    message: "ok",
                };
            })
                .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
        });
    }
    async insertIgnoreMany(table, rows) {
        const sql = await sqlfier_1.insertManySqlString(this, "INSERT OR IGNORE", table, rows);
        return this.lock(async (rawNestedConnection) => {
            const nestedConnection = rawNestedConnection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`insertIgnoreMany() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified > rows.length) {
                    throw new Error(`insertIgnoreMany() should modify ${rows.length} rows or less; modified ${result.rowsModified} rows`);
                }
                return {
                    query: { sql, },
                    insertedRowCount: tm.BigInt(result.rowsModified),
                    warningCount: tm.BigInt(rows.length - result.rowsModified),
                    message: "ok",
                };
            })
                .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
        });
    }
    replaceOne(table, row) {
        const sql = sqlfier_1.insertOneSqlString("REPLACE", table, row);
        return this.lock((rawNestedConnection) => {
            const nestedConnection = rawNestedConnection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`replaceOne() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified != 1) {
                    throw new Error(`replaceOne() should modify one row`);
                }
                const autoIncrementId = ((table.autoIncrement == undefined) ?
                    undefined :
                    (row[table.autoIncrement] === undefined) ?
                        await squill
                            .selectValue(() => ExprLib.lastInsertRowId())
                            .fetchValue(nestedConnection) :
                        /**
                         * Emulate MySQL behaviour
                         */
                        tm.BigInt(0));
                return {
                    query: { sql, },
                    insertedOrReplacedRowCount: tm.BigInt(1),
                    autoIncrementId: (autoIncrementId == undefined ?
                        undefined :
                        tm.BigIntUtil.equal(autoIncrementId, tm.BigInt(0)) ?
                            undefined :
                            autoIncrementId),
                    warningCount: tm.BigInt(0),
                    message: "ok",
                };
            })
                .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
        });
    }
    async replaceMany(table, rows) {
        const sql = await sqlfier_1.insertManySqlString(this, "REPLACE", table, rows);
        return this.exec(sql)
            .then(async (result) => {
            if (result.execResult.length != 0) {
                throw new Error(`replaceMany() should have no result set; found ${result.execResult.length}`);
            }
            if (result.rowsModified != rows.length) {
                throw new Error(`replaceMany() should modify ${rows.length} rows; modified ${result.rowsModified} rows`);
            }
            return {
                query: { sql, },
                insertedOrReplacedRowCount: tm.BigInt(result.rowsModified),
                warningCount: tm.BigInt(0),
                message: "ok",
            };
        })
            .catch((err) => {
            //console.error("error encountered", sql);
            throw err;
        });
    }
    async insertSelect(query, table, insertSelectRow) {
        const sql = await sqlfier_1.insertSelectSqlString(this, "INSERT", query, table, insertSelectRow);
        return this.lock(async (rawNestedConnection) => {
            const nestedConnection = rawNestedConnection;
            return nestedConnection.exec(sql)
                .then(async (result) => {
                if (result.execResult.length != 0) {
                    throw new Error(`insertSelect() should have no result set; found ${result.execResult.length}`);
                }
                if (result.rowsModified < 0) {
                    throw new Error(`insertSelect() should modify zero, or more rows; modified ${result.rowsModified} rows`);
                }
                return {
                    query: { sql, },
                    insertedRowCount: tm.BigInt(result.rowsModified),
                    warningCount: tm.BigInt(0),
                    message: "ok",
                };
            })
                .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
        });
    }
    async insertIgnoreSelect(query, table, insertSelectRow) {
        const sql = await sqlfier_1.insertSelectSqlString(this, "INSERT OR IGNORE", query, table, insertSelectRow);
        return this.transactionIfNotInOne(async (rawNestedConnection) => {
            const nestedConnection = rawNestedConnection;
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
                    query: { sql, },
                    insertedRowCount: tm.BigInt(result.rowsModified),
                    warningCount: tm.BigIntUtil.sub(maxInsertCount, result.rowsModified),
                    message: "ok",
                };
            })
                .catch((err) => {
                //console.error("error encountered", sql);
                throw err;
            });
        });
    }
    async replaceSelect(query, table, insertSelectRow) {
        const sql = await sqlfier_1.insertSelectSqlString(this, "REPLACE", query, table, insertSelectRow);
        return this.exec(sql)
            .then(async (result) => {
            if (result.execResult.length != 0) {
                throw new Error(`replaceSelect() should have no result set; found ${result.execResult.length}`);
            }
            if (result.rowsModified < 0) {
                throw new Error(`replaceSelect() should modify zero, or more rows; modified ${result.rowsModified} rows`);
            }
            return {
                query: { sql, },
                insertedOrReplacedRowCount: tm.BigInt(result.rowsModified),
                warningCount: tm.BigInt(0),
                message: "ok",
            };
        })
            .catch((err) => {
            //console.error("error encountered", sql);
            throw err;
        });
    }
    update(table, whereClause, assignmentMap) {
        const sql = sqlfier_1.updateSqlString(table, whereClause, assignmentMap);
        if (sql == undefined) {
            return squill.from(table)
                .where(() => whereClause)
                .count(this)
                .then((count) => {
                return {
                    query: {
                        /**
                         * No `UPDATE` statement executed
                         */
                        sql: "",
                    },
                    foundRowCount: count,
                    updatedRowCount: tm.BigInt(0),
                    warningCount: tm.BigInt(0),
                    message: "ok",
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
                query: { sql, },
                foundRowCount: tm.BigInt(result.rowsModified),
                updatedRowCount: tm.BigInt(result.rowsModified),
                warningCount: tm.BigInt(0),
                message: "ok",
            };
        })
            .catch((err) => {
            //console.error("error encountered", sql);
            throw err;
        });
    }
    delete(table, whereClause) {
        const sql = sqlfier_1.deleteSqlString(table, whereClause);
        return this.exec(sql)
            .then(async (result) => {
            if (result.execResult.length != 0) {
                throw new Error(`delete() should have no result set; found ${result.execResult.length}`);
            }
            if (result.rowsModified < 0) {
                throw new Error(`delete() should modify zero, or more rows; modified ${result.rowsModified} rows`);
            }
            return {
                query: { sql, },
                deletedRowCount: tm.BigInt(result.rowsModified),
                warningCount: tm.BigInt(0),
                message: "ok",
            };
        })
            .catch((err) => {
            //console.error("error encountered", sql);
            throw err;
        });
    }
    tryFetchSchemaMeta(schemaAlias) {
        return schema_introspection_1.tryFetchSchemaMeta(this, schemaAlias);
    }
    tryFetchGeneratedColumnExpression(schemaAlias, tableAlias, columnAlias) {
        return schema_introspection_1.tryFetchGeneratedColumnExpression(this, schemaAlias, tableAlias, columnAlias);
    }
    transaction(...args) {
        return this.lock(async (nestedConnection) => {
            return nestedConnection.transactionImpl(args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0], squill.TransactionAccessMode.READ_WRITE, args.length == 1 ? args[0] : args[1]);
        });
    }
    readOnlyTransaction(...args) {
        return this.lock(async (nestedConnection) => {
            return nestedConnection.transactionImpl(args.length == 1 ? squill.IsolationLevel.SERIALIZABLE : args[0], squill.TransactionAccessMode.READ_ONLY, args.length == 1 ? args[0] : args[1]);
        });
    }
    isInTransaction() {
        return this.sharedConnectionInformation.transactionData != undefined;
    }
    savepointImpl(callback) {
        if (this.sharedConnectionInformation.transactionData == undefined) {
            return Promise.reject(new Error(`Cannot use savepoint outside transaction`));
        }
        if (this.savepointData != undefined) {
            return Promise.reject(new Error(`A savepoint is already in progress`));
        }
        const savepointData = {
            savepointName: `squill_savepoint_${++this.sharedConnectionInformation.savepointId}`,
        };
        this.savepointData = savepointData;
        this.eventEmitters.savepoint();
        return new Promise((resolve, reject) => {
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
                return callback(this);
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
    rollbackToSavepoint() {
        if (this.savepointData == undefined) {
            return Promise.reject(new Error("Not in savepoint; cannot release savepoint"));
        }
        return this.rawQuery(`ROLLBACK TO SAVEPOINT ${this.savepointData.savepointName}`)
            .then(() => {
            this.savepointData = undefined;
            this.eventEmitters.rollbackToSavepoint();
        });
    }
    releaseSavepoint() {
        if (this.savepointData == undefined) {
            return Promise.reject(new Error("Not in savepoint; cannot release savepoint"));
        }
        return this.rawQuery(`RELEASE SAVEPOINT ${this.savepointData.savepointName}`)
            .then(() => {
            this.savepointData = undefined;
            this.eventEmitters.releaseSavepoint();
        });
    }
    savepoint(callback) {
        return this.lock(async (nestedConnection) => {
            return nestedConnection.savepointImpl(callback);
        });
    }
    deallocate() {
        //console.log("deallocating...");
        if (this.deallocatePromise == undefined) {
            this.deallocatePromise = this.asyncQueue.stop()
                .then(() => {
                //console.log("deallocated");
                /**
                 * @todo Handle sync errors somehow.
                 * Maybe propagate them to `IPool` and have an `onError` handler or something
                 */
                this.eventEmitters.commit();
            }, (err) => {
                //console.log("deallocated with error");
                /**
                 * @todo Handle sync errors somehow.
                 * Maybe propagate them to `IPool` and have an `onError` handler or something
                 */
                this.eventEmitters.commit();
                throw err;
            });
            return this.deallocatePromise;
        }
        return Promise.reject("This connection has already been deallocated");
    }
    isDeallocated() {
        return this.deallocatePromise != undefined;
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map

/***/ }),

/***/ "./dist/driver/execution/connection/index.js":
/*!***************************************************!*\
  !*** ./dist/driver/execution/connection/index.js ***!
  \***************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./connection */ "./dist/driver/execution/connection/connection.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/execution/index.js":
/*!****************************************!*\
  !*** ./dist/driver/execution/index.js ***!
  \****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./connection */ "./dist/driver/execution/connection/index.js"));
__export(__webpack_require__(/*! ./pool */ "./dist/driver/execution/pool/index.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/bigint-polyfill.js":
/*!*******************************************************!*\
  !*** ./dist/driver/execution/pool/bigint-polyfill.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const UnsignedDecimalStrUtil = __webpack_require__(/*! ./unsigned-decimal-str-util */ "./dist/driver/execution/pool/unsigned-decimal-str-util.js");
const SignedDecimalStrUtil = __webpack_require__(/*! ./signed-decimal-str-util */ "./dist/driver/execution/pool/signed-decimal-str-util.js");
const BigIntUtil = __webpack_require__(/*! ./bigint-util */ "./dist/driver/execution/pool/bigint-util.js");
const { unsignedDigitArrayAdd, unsignedDigitArraySubtract, unsignedDecimalStrAdd, unsignedDecimalStrSubtract, unsignedDecimalStrMultiply, unsignedDigitArrayGreaterThanOrEqual, unsignedDigitArrayLessThanOrEqual, unsignedDecimalStrDivide, } = UnsignedDecimalStrUtil;
const { signedDecimalStrLessThanOrEqual, signedDecimalStrGreaterThanOrEqual, signedDecimalStrUnaryMinus, signedDecimalStrAdd, signedDecimalStrSubtract, signedDecimalStrMultiply, signedDecimalStrDivide, } = SignedDecimalStrUtil;
const { isSafeBigIntSigned, assertSafeBigIntSigned, bigIntAdd, bigIntSubtract, bigIntUnaryMinus, bigIntMultiply, bigIntDivide, } = BigIntUtil;
async function initBigIntPolyfill(connection) {
    await connection.createGlobalJsFunction("unsignedDigitArrayAdd", unsignedDigitArrayAdd);
    await connection.createGlobalJsFunction("unsignedDigitArraySubtract", unsignedDigitArraySubtract);
    await connection.createGlobalJsFunction("unsignedDecimalStrAdd", unsignedDecimalStrAdd);
    await connection.createGlobalJsFunction("unsignedDecimalStrSubtract", unsignedDecimalStrSubtract);
    await connection.createGlobalJsFunction("unsignedDecimalStrMultiply", unsignedDecimalStrMultiply);
    await connection.createGlobalJsFunction("unsignedDigitArrayGreaterThanOrEqual", unsignedDigitArrayGreaterThanOrEqual);
    await connection.createGlobalJsFunction("unsignedDigitArrayLessThanOrEqual", unsignedDigitArrayLessThanOrEqual);
    await connection.createGlobalJsFunction("unsignedDecimalStrDivide", unsignedDecimalStrDivide);
    await connection.createGlobalJsFunction("signedDecimalStrLessThanOrEqual", signedDecimalStrLessThanOrEqual);
    await connection.createGlobalJsFunction("signedDecimalStrGreaterThanOrEqual", signedDecimalStrGreaterThanOrEqual);
    await connection.createGlobalJsFunction("signedDecimalStrUnaryMinus", signedDecimalStrUnaryMinus);
    await connection.createGlobalJsFunction("signedDecimalStrAdd", signedDecimalStrAdd);
    await connection.createGlobalJsFunction("signedDecimalStrSubtract", signedDecimalStrSubtract);
    await connection.createGlobalJsFunction("signedDecimalStrMultiply", signedDecimalStrMultiply);
    await connection.createGlobalJsFunction("signedDecimalStrDivide", signedDecimalStrDivide);
    await connection.createGlobalJsFunction("isSafeBigIntSigned", isSafeBigIntSigned);
    await connection.createGlobalJsFunction("assertSafeBigIntSigned", assertSafeBigIntSigned);
    await connection.createGlobalJsFunction("bigIntAdd", bigIntAdd);
    await connection.createGlobalJsFunction("bigIntSubtract", bigIntSubtract);
    await connection.createGlobalJsFunction("bigIntUnaryMinus", bigIntUnaryMinus);
    await connection.createGlobalJsFunction("bigIntMultiply", bigIntMultiply);
    await connection.createGlobalJsFunction("bigIntDivide", bigIntDivide);
    await connection.createVarArgFunction("bigint_add", (...arr) => {
        if (arr.length == 0) {
            return BigInt(0);
        }
        if (arr.length == 1) {
            const a = arr[0];
            if (isBigInt(a)) {
                return a;
            }
            else {
                throw new Error(`Cannot add non-bigint`);
            }
        }
        const [a, b, ...rest] = arr;
        if (!isBigInt(a) || !isBigInt(b)) {
            throw new Error(`Cannot add non-bigint`);
        }
        const sum = bigIntAdd(a, b);
        return rest.reduce((result, x) => {
            if (!isBigInt(x)) {
                throw new Error(`Cannot add non-bigint`);
            }
            return bigIntAdd(result, x);
        }, sum);
    });
    await connection.createFunction("bigint_sub", (a, b) => {
        if (!isBigInt(a) || !isBigInt(b)) {
            throw new Error(`Cannot subtract non-bigint`);
        }
        return bigIntSubtract(a, b);
    });
    await connection.createVarArgFunction("bigint_mul", (...arr) => {
        if (arr.length == 0) {
            return BigInt(1);
        }
        if (arr.length == 1) {
            const a = arr[0];
            if (isBigInt(a)) {
                return a;
            }
            else {
                throw new Error(`Cannot multiply non-bigint`);
            }
        }
        const [a, b, ...rest] = arr;
        if (!isBigInt(a) || !isBigInt(b)) {
            throw new Error(`Cannot multiply non-bigint`);
        }
        const product = bigIntMultiply(a, b);
        return rest.reduce((result, x) => {
            if (!isBigInt(x)) {
                throw new Error(`Cannot multiply non-bigint`);
            }
            return bigIntMultiply(result, x);
        }, product);
    });
    await connection.createFunction("bigint_neg", (a) => {
        if (!isBigInt(a)) {
            throw new Error(`Cannot unary minus non-bigint`);
        }
        return bigIntUnaryMinus(a);
    });
    await connection.createFunction("bigint_div", (a, b) => {
        if (!isBigInt(a) || !isBigInt(b)) {
            throw new Error(`Cannot divide non-bigint ${typeof a}/${typeof b}`);
        }
        return bigIntDivide(a, b);
    });
}
exports.initBigIntPolyfill = initBigIntPolyfill;
//# sourceMappingURL=bigint-polyfill.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/bigint-util.js":
/*!***************************************************!*\
  !*** ./dist/driver/execution/pool/bigint-util.js ***!
  \***************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const SignedDecimalStrUtil = __webpack_require__(/*! ./signed-decimal-str-util */ "./dist/driver/execution/pool/signed-decimal-str-util.js");
const { signedDecimalStrLessThanOrEqual, signedDecimalStrGreaterThanOrEqual, signedDecimalStrAdd, signedDecimalStrSubtract, signedDecimalStrMultiply, signedDecimalStrDivide, } = SignedDecimalStrUtil;
function isSafeBigIntSigned(x) {
    const MAX_SAFE_BIGINT_SIGNED = "9223372036854775807";
    const MIN_SAFE_BIGINT_SIGNED = "-9223372036854775808";
    if (typeof x == "bigint") {
        return (x <= BigInt(MAX_SAFE_BIGINT_SIGNED) &&
            x >= BigInt(MIN_SAFE_BIGINT_SIGNED));
    }
    return (signedDecimalStrLessThanOrEqual(x, MAX_SAFE_BIGINT_SIGNED) &&
        signedDecimalStrGreaterThanOrEqual(x, MIN_SAFE_BIGINT_SIGNED));
}
exports.isSafeBigIntSigned = isSafeBigIntSigned;
function assertSafeBigIntSigned(x) {
    if (!isSafeBigIntSigned(x)) {
        throw new RangeError(`BIGINT SIGNED overflow`);
    }
}
exports.assertSafeBigIntSigned = assertSafeBigIntSigned;
function bigIntAdd(a, b) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        const result = a + b;
        assertSafeBigIntSigned(result);
        return result;
    }
    const result = signedDecimalStrAdd(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}
exports.bigIntAdd = bigIntAdd;
function bigIntSubtract(a, b) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        const result = a - b;
        assertSafeBigIntSigned(result);
        return result;
    }
    const result = signedDecimalStrSubtract(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}
exports.bigIntSubtract = bigIntSubtract;
function bigIntUnaryMinus(a) {
    if (typeof a == "bigint") {
        const result = -a;
        assertSafeBigIntSigned(result);
        return result;
    }
    const str = String(a);
    if (str == "0") {
        return BigInt("0");
    }
    const result = (str[0] == "-" ?
        str.substr(1) :
        "-" + str);
    assertSafeBigIntSigned(result);
    return BigInt(result);
}
exports.bigIntUnaryMinus = bigIntUnaryMinus;
function bigIntMultiply(a, b) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        const result = a * b;
        assertSafeBigIntSigned(result);
        return result;
    }
    const result = signedDecimalStrMultiply(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}
exports.bigIntMultiply = bigIntMultiply;
function bigIntDivide(a, b) {
    if (typeof a == "bigint" && typeof b == "bigint") {
        if (b == BigInt(0)) {
            throw new Error(`DivideByZeroError: Cannot divide by zero`);
        }
        const result = a / b;
        assertSafeBigIntSigned(result);
        return result;
    }
    const result = signedDecimalStrDivide(a.toString(), b.toString());
    assertSafeBigIntSigned(result);
    return BigInt(result);
}
exports.bigIntDivide = bigIntDivide;
//# sourceMappingURL=bigint-util.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/decimal-polyfill.js":
/*!********************************************************!*\
  !*** ./dist/driver/execution/pool/decimal-polyfill.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const FixedPointUtil = __webpack_require__(/*! ./fixed-point-util */ "./dist/driver/execution/pool/fixed-point-util.js");
const FloatingPointUtil = __webpack_require__(/*! ./floating-point-util */ "./dist/driver/execution/pool/floating-point-util.js");
const { tryParseFixedPoint } = FixedPointUtil;
const { tryParseFloatingPoint, floatingPointToIntegerAndExponent } = FloatingPointUtil;
async function initDecimalPolyfill(connection) {
    await connection.createGlobalJsFunction("tryParseFloatingPoint", tryParseFloatingPoint);
    await connection.createGlobalJsFunction("floatingPointToIntegerAndExponent", floatingPointToIntegerAndExponent);
    await connection.createGlobalJsFunction("tryParseFixedPoint", tryParseFixedPoint);
    await connection.createFunction("decimal_ctor", (x, precision, scale) => {
        if (!isBigInt(precision) ||
            !isBigInt(scale)) {
            throw new Error(`Precision and scale must be bigint`);
        }
        const maxPrecision = Number(precision);
        const maxScale = Number(scale);
        if (maxPrecision < 1) {
            throw new Error(`Precision cannot be less than 1`);
        }
        if (maxScale < 0) {
            throw new Error(`Scale cannot be less than 0`);
        }
        if (maxScale > maxPrecision) {
            throw new Error(`Scale cannot be greater than precision`);
        }
        if (!isBigInt(x) &&
            typeof x != "number" &&
            typeof x != "string") {
            throw new Error(`Cannot cast ${typeof x} to DECIMAL(${precision}, ${scale})`);
        }
        const str = String(x);
        const parsed = tryParseFixedPoint(str);
        if (parsed == undefined) {
            throw new Error(`Could not cast to DECIMAL(${precision}, ${scale}); invalid fixed point format`);
        }
        const curScale = (parsed.getFixedPointFractionalPartString() == "0" ?
            0 :
            parsed.getFixedPointFractionalPartString().length);
        const curPrecision = (curScale +
            (parsed.getFixedPointIntegerPartString() == "0" ?
                0 :
                parsed.getFixedPointIntegerPartString().length));
        if (curPrecision > maxPrecision) {
            throw new Error(`DECIMAL(${precision}, ${scale}) precision pverflow`);
        }
        if (curScale > maxScale) {
            throw new Error(`DECIMAL(${precision}, ${scale}) scale pverflow`);
        }
        return parsed.getFixedPointString();
    });
}
exports.initDecimalPolyfill = initDecimalPolyfill;
//# sourceMappingURL=decimal-polyfill.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/fixed-point-util.js":
/*!********************************************************!*\
  !*** ./dist/driver/execution/pool/fixed-point-util.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const FloatingPointUtil = __webpack_require__(/*! ./floating-point-util */ "./dist/driver/execution/pool/floating-point-util.js");
const { tryParseFloatingPoint, floatingPointToIntegerAndExponent } = FloatingPointUtil;
/**
 * @todo Make `getXxx()` functions cache results
 */
function tryParseFixedPoint(str) {
    const parsed = tryParseFloatingPoint(str);
    if (parsed == undefined) {
        return undefined;
    }
    const { isNegative, integerPart, isZero, exponentValue, } = floatingPointToIntegerAndExponent(parsed);
    function lazyInit(initDelegate) {
        let initialized = false;
        let value = undefined;
        return () => {
            if (!initialized) {
                value = initDelegate();
                initialized = true;
            }
            return value;
        };
    }
    if (isZero) {
        const fixedPointIntegerPartLength = 1;
        const fixedPointFractionalPartLength = 1;
        const fixedPointLength = ((isNegative ? 1 : 0) +
            fixedPointIntegerPartLength +
            1 +
            fixedPointFractionalPartLength);
        const getFixedPointIntegerPartString = () => "0";
        const getFixedPointFractionalPartString = () => "0";
        const getFixedPointString = lazyInit(() => {
            const sign = isNegative ? "-" : "";
            return (sign +
                getFixedPointIntegerPartString() +
                "." +
                getFixedPointFractionalPartString());
        });
        return {
            isInteger: true,
            isNegative,
            isZero,
            fixedPointIntegerPartLength,
            fixedPointFractionalPartLength,
            fixedPointLength,
            getFixedPointIntegerPartString,
            getFixedPointFractionalPartString,
            getFixedPointString,
        };
    }
    if (exponentValue >= 0) {
        const fixedPointIntegerPartLength = integerPart.length + exponentValue;
        const fixedPointFractionalPartLength = 1;
        const fixedPointLength = ((isNegative ? 1 : 0) +
            fixedPointIntegerPartLength +
            1 +
            fixedPointFractionalPartLength);
        const getFixedPointIntegerPartString = lazyInit(() => (integerPart + "0".repeat(exponentValue)));
        const getFixedPointFractionalPartString = () => "0";
        const getFixedPointString = lazyInit(() => {
            const sign = isNegative ? "-" : "";
            return (sign +
                getFixedPointIntegerPartString() +
                "." +
                getFixedPointFractionalPartString());
        });
        return {
            isInteger: true,
            isNegative,
            isZero,
            fixedPointIntegerPartLength,
            fixedPointFractionalPartLength,
            fixedPointLength,
            getFixedPointIntegerPartString,
            getFixedPointFractionalPartString,
            getFixedPointString,
        };
    }
    else {
        const fractionalOffset = -exponentValue;
        if (fractionalOffset < integerPart.length) {
            const newIntegerPart = integerPart.substring(0, integerPart.length - fractionalOffset);
            let newFractionalPart = integerPart.substring(integerPart.length - fractionalOffset, integerPart.length).replace(/(0+)$/, "");
            if (newFractionalPart == "") {
                newFractionalPart = "0";
            }
            const fixedPointIntegerPartLength = newIntegerPart.length;
            const fixedPointFractionalPartLength = newFractionalPart.length;
            const fixedPointLength = ((isNegative ? 1 : 0) +
                fixedPointIntegerPartLength +
                1 +
                fixedPointFractionalPartLength);
            const getFixedPointIntegerPartString = () => newIntegerPart;
            const getFixedPointFractionalPartString = () => newFractionalPart;
            const getFixedPointString = lazyInit(() => {
                const sign = isNegative ? "-" : "";
                return (sign +
                    getFixedPointIntegerPartString() +
                    "." +
                    getFixedPointFractionalPartString());
            });
            return {
                isInteger: (newFractionalPart == "0"),
                isNegative,
                isZero,
                fixedPointIntegerPartLength,
                fixedPointFractionalPartLength,
                fixedPointLength,
                getFixedPointIntegerPartString,
                getFixedPointFractionalPartString,
                getFixedPointString,
            };
        }
        else if (fractionalOffset == integerPart.length) {
            let newFractionalPart = integerPart.replace(/(0+)$/, "");
            if (newFractionalPart == "") {
                newFractionalPart = "0";
            }
            const fixedPointIntegerPartLength = 1;
            const fixedPointFractionalPartLength = newFractionalPart.length;
            const fixedPointLength = ((isNegative ? 1 : 0) +
                fixedPointIntegerPartLength +
                1 +
                fixedPointFractionalPartLength);
            const getFixedPointIntegerPartString = () => ("0");
            const getFixedPointFractionalPartString = () => newFractionalPart;
            const getFixedPointString = lazyInit(() => {
                const sign = isNegative ? "-" : "";
                return (sign +
                    getFixedPointIntegerPartString() +
                    "." +
                    getFixedPointFractionalPartString());
            });
            return {
                isInteger: (newFractionalPart == "0"),
                isNegative,
                isZero,
                fixedPointIntegerPartLength,
                fixedPointFractionalPartLength,
                fixedPointLength,
                getFixedPointIntegerPartString,
                getFixedPointFractionalPartString,
                getFixedPointString,
            };
        }
        else {
            let leadingZeroCount = fractionalOffset - integerPart.length;
            let newFractionalPart = integerPart.replace(/(0+)$/, "");
            if (newFractionalPart == "") {
                leadingZeroCount = 0;
                newFractionalPart = "0";
            }
            const fixedPointIntegerPartLength = 1;
            const fixedPointFractionalPartLength = leadingZeroCount + newFractionalPart.length;
            const fixedPointLength = ((isNegative ? 1 : 0) +
                fixedPointIntegerPartLength +
                1 +
                fixedPointFractionalPartLength);
            const getFixedPointIntegerPartString = () => ("0");
            const getFixedPointFractionalPartString = lazyInit(() => ("0".repeat(leadingZeroCount) +
                newFractionalPart));
            const getFixedPointString = lazyInit(() => {
                const sign = isNegative ? "-" : "";
                return (sign +
                    getFixedPointIntegerPartString() +
                    "." +
                    getFixedPointFractionalPartString());
            });
            return {
                isInteger: (newFractionalPart == "0"),
                isNegative,
                isZero,
                fixedPointIntegerPartLength,
                fixedPointFractionalPartLength,
                fixedPointLength,
                getFixedPointIntegerPartString,
                getFixedPointFractionalPartString,
                getFixedPointString,
            };
        }
    }
}
exports.tryParseFixedPoint = tryParseFixedPoint;
//# sourceMappingURL=fixed-point-util.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/floating-point-util.js":
/*!***********************************************************!*\
  !*** ./dist/driver/execution/pool/floating-point-util.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function tryParseFloatingPoint(str) {
    const floatingPointRegex = /^([-+])?([0-9]+\.?[0-9]*|[0-9]*\.?[0-9]+)([eE]([-+])?([0-9]+))?$/;
    const m = floatingPointRegex.exec(str);
    if (m == undefined) {
        return undefined;
    }
    //-123.456e+789
    //~
    const rawCoefficientSign = m[1];
    //-123.456e+789
    // ~~~~~~~
    const rawCoefficientValue = m[2];
    //-123.456e+789
    //         ~
    const rawExponentSign = m[4];
    //-123.456e+789
    //          ~~~
    const rawExponentValue = m[5];
    const rawDecimalPlaceIndex = rawCoefficientValue.indexOf(".");
    const rawIntegerPart = (rawDecimalPlaceIndex < 0 ?
        rawCoefficientValue :
        rawCoefficientValue.substring(0, rawDecimalPlaceIndex));
    const rawFractionalPart = (rawDecimalPlaceIndex < 0 ?
        "" :
        rawCoefficientValue.substring(rawDecimalPlaceIndex + 1, rawCoefficientValue.length));
    const trimmedIntegerPart = rawIntegerPart.replace(/^(0+)/, "");
    const integerPart = (trimmedIntegerPart == "" ?
        "0" :
        trimmedIntegerPart);
    const trimmedFractionalPart = rawFractionalPart.replace(/(0+)$/, "");
    const fractionalPart = (trimmedFractionalPart == "" ?
        "0" :
        trimmedFractionalPart);
    const isZero = (integerPart == "0" && fractionalPart == "0");
    function safeCastToNumber(str) {
        const result = Number(str);
        if (result.toString() != str) {
            throw new Error(`Cannot cast exponent to number`);
        }
        return result;
    }
    const exponentValue = (isZero ?
        0 :
        rawExponentValue == undefined ?
            0 :
            rawExponentSign === "-" ?
                -safeCastToNumber(rawExponentValue) :
                safeCastToNumber(rawExponentValue));
    return {
        isNegative: (rawCoefficientSign === "-"),
        integerPart,
        fractionalPart,
        isZero,
        exponentValue,
    };
}
exports.tryParseFloatingPoint = tryParseFloatingPoint;
/**
 * Converts the fractional part to an integer part,
 * by lowering the exponent
 */
function floatingPointToIntegerAndExponent(arg) {
    if (arg.fractionalPart == "0") {
        return arg;
    }
    const exponentValue = (arg.exponentValue -
        arg.fractionalPart.length);
    const integerPart = (arg.integerPart == "0" ?
        arg.fractionalPart.replace(/^(0+)/, "") :
        arg.integerPart + arg.fractionalPart);
    return {
        isNegative: arg.isNegative,
        integerPart,
        fractionalPart: "0",
        isZero: arg.isZero,
        exponentValue,
    };
}
exports.floatingPointToIntegerAndExponent = floatingPointToIntegerAndExponent;
//# sourceMappingURL=floating-point-util.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/index.js":
/*!*********************************************!*\
  !*** ./dist/driver/execution/pool/index.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./pool */ "./dist/driver/execution/pool/pool.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/polyfill.js":
/*!************************************************!*\
  !*** ./dist/driver/execution/pool/polyfill.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const decimal_polyfill_1 = __webpack_require__(/*! ./decimal-polyfill */ "./dist/driver/execution/pool/decimal-polyfill.js");
const bigint_polyfill_1 = __webpack_require__(/*! ./bigint-polyfill */ "./dist/driver/execution/pool/bigint-polyfill.js");
async function initPolyfill(connection) {
    await decimal_polyfill_1.initDecimalPolyfill(connection);
    await bigint_polyfill_1.initBigIntPolyfill(connection);
    await connection.createFunction("ASCII", (x) => {
        if (typeof x == "string") {
            if (x == "") {
                return 0;
            }
            return x.charCodeAt(0);
        }
        else {
            throw new Error(`ASCII only implemented for string`);
        }
    });
    await connection.createFunction("BIN", (x) => {
        if (isBigInt(x)) {
            const str = x.toString();
            if (str[0] == "-") {
                return binaryStrSetWidth(signedDecimalStrToBinaryStr(str), 64);
            }
            else {
                //substr to remove leading 0
                return signedDecimalStrToBinaryStr(str).substr(1);
            }
            /*
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
            */
        }
        else {
            throw new Error(`BIN only implemented for bigint`);
        }
    });
    await connection.createVarArgFunction("CONCAT_WS", (separator, ...args) => {
        if (typeof separator == "string") {
            return args.filter(arg => arg !== null).join(separator);
        }
        else {
            throw new Error(`CONCAT_WS only implemented for string`);
        }
    });
    await connection.createFunction("FROM_BASE64", (x) => {
        if (typeof x == "string") {
            const result = new Uint8Array(atob(x).split("").filter(s => s != "").map(s => s.charCodeAt(0)));
            return result;
        }
        else {
            throw new Error(`FROM_BASE64 only implemented for string`);
        }
    });
    await connection.createFunction("LPAD", (str, len, pad) => {
        if (typeof str == "string" &&
            isBigInt(len) &&
            typeof pad == "string") {
            if (str.length > Number(len)) {
                return str.substr(0, Number(len));
            }
            else if (str.length == Number(len)) {
                return str;
            }
            else {
                return str.padStart(Number(len), pad);
            }
        }
        else {
            throw new Error(`LPAD only implemented for (string, bigint, string)`);
        }
    });
    await connection.createFunction("RPAD", (str, len, pad) => {
        if (typeof str == "string" &&
            isBigInt(len) &&
            typeof pad == "string") {
            if (str.length > Number(len)) {
                return str.substr(0, Number(len));
            }
            else if (str.length == Number(len)) {
                return str;
            }
            else {
                return str.padEnd(Number(len), pad);
            }
        }
        else {
            throw new Error(`RPAD only implemented for (string, bigint, string)`);
        }
    });
    await connection.createFunction("REPEAT", (str, count) => {
        if (typeof str == "string" &&
            isBigInt(count)) {
            if (Number(count) < 0) {
                return "";
            }
            return str.repeat(Number(count));
        }
        else {
            throw new Error(`REPEAT only implemented for (string, bigint)`);
        }
    });
    await connection.createFunction("REVERSE", (str) => {
        if (typeof str == "string") {
            return [...str].reverse().join("");
        }
        else {
            throw new Error(`REVERSE only implemented for (string)`);
        }
    });
    await connection.createFunction("TO_BASE64", (blob) => {
        if (blob instanceof Uint8Array) {
            return btoa([...blob].map(n => String.fromCharCode(n)).join(""));
        }
        else {
            throw new Error(`TO_BASE64 only implemented for (Uint8Array)`);
        }
    });
    await connection.createFunction("UNHEX", (x) => {
        if (typeof x == "string") {
            const matches = x.match(/.{2}/g);
            if (matches == undefined) {
                throw new Error(`Invalid Hex string`);
            }
            const result = new Uint8Array(matches.map(str => parseInt(str, 16)));
            const hexResult = [...result].map((n) => ("00" + n.toString(16)).slice(-2)).join("");
            if (x.toUpperCase() == hexResult.toUpperCase()) {
                return result;
            }
            else {
                throw new Error(`Invalid Hex string`);
            }
        }
        else {
            throw new Error(`UNHEX only implemented for string`);
        }
    });
    await connection.createFunction("FLOOR", (x) => {
        if (isBigInt(x)) {
            return x;
        }
        else if (typeof x == "number") {
            return Math.floor(x);
        }
        else {
            throw new Error(`Can only FLOOR bigint or double`);
        }
    });
    await connection.createFunction("CEILING", (x) => {
        if (isBigInt(x)) {
            return x;
        }
        else if (typeof x == "number") {
            return Math.ceil(x);
        }
        else {
            throw new Error(`Can only CEILING bigint or double`);
        }
    });
    await connection.createFunction("CBRT", (x) => {
        if (typeof x == "number") {
            return Math.cbrt(x);
        }
        else {
            throw new Error(`CBRT(${typeof x}) not implmented`);
        }
    });
    await connection.createFunction("COT", (x) => {
        if (typeof x == "number") {
            const divisor = Math.cos(x);
            const dividend = Math.sin(x);
            if (dividend == 0) {
                return null;
            }
            else {
                return divisor / dividend;
            }
        }
        else {
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
        }
        else {
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
        }
        else {
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
        }
        else {
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
        }
        else {
            throw new Error(`LOG10(${typeof x}) not implmented`);
        }
    });
    await connection.createFunction("FRANDOM", () => {
        return Math.random();
    });
    await connection.createAggregate("STDDEV_POP", () => {
        return {
            values: [],
        };
    }, (state, x) => {
        if (x === null) {
            return;
        }
        if (typeof x == "number") {
            state.values.push(x);
        }
        else {
            throw new Error(`STDDEV_POP(${typeof x}) not implmented`);
        }
    }, (state) => {
        if (state == undefined) {
            return null;
        }
        if (state.values.length == 0) {
            return null;
        }
        const sum = state.values.reduce((sum, value) => sum + value, 0);
        const count = state.values.length;
        const avg = sum / count;
        const squaredErrors = state.values.map(value => {
            return Math.pow(value - avg, 2);
        });
        const sumSquaredErrors = squaredErrors.reduce((sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError, 0);
        return Math.sqrt(sumSquaredErrors / count);
    });
    await connection.createAggregate("STDDEV_SAMP", () => {
        return {
            values: [],
        };
    }, (state, x) => {
        if (x === null) {
            return;
        }
        if (typeof x == "number") {
            state.values.push(x);
        }
        else {
            throw new Error(`STDDEV_SAMP(${typeof x}) not implmented`);
        }
    }, (state) => {
        if (state == undefined) {
            return null;
        }
        if (state.values.length == 0) {
            return null;
        }
        if (state.values.length == 1) {
            return null;
        }
        const sum = state.values.reduce((sum, value) => sum + value, 0);
        const count = state.values.length;
        const avg = sum / count;
        const squaredErrors = state.values.map(value => {
            return Math.pow(value - avg, 2);
        });
        const sumSquaredErrors = squaredErrors.reduce((sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError, 0);
        return Math.sqrt(sumSquaredErrors / (count - 1));
    });
    await connection.createAggregate("VAR_POP", () => {
        return {
            values: [],
        };
    }, (state, x) => {
        if (x === null) {
            return;
        }
        if (typeof x == "number") {
            state.values.push(x);
        }
        else {
            throw new Error(`VAR_POP(${typeof x}) not implmented`);
        }
    }, (state) => {
        if (state == undefined) {
            return null;
        }
        if (state.values.length == 0) {
            return null;
        }
        const sum = state.values.reduce((sum, value) => sum + value, 0);
        const count = state.values.length;
        const avg = sum / count;
        const squaredErrors = state.values.map(value => {
            return Math.pow(value - avg, 2);
        });
        const sumSquaredErrors = squaredErrors.reduce((sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError, 0);
        return sumSquaredErrors / count;
    });
    await connection.createAggregate("VAR_SAMP", () => {
        return {
            values: [],
        };
    }, (state, x) => {
        if (x === null) {
            return;
        }
        if (typeof x == "number") {
            state.values.push(x);
        }
        else {
            throw new Error(`VAR_SAMP(${typeof x}) not implmented`);
        }
    }, (state) => {
        if (state == undefined) {
            return null;
        }
        if (state.values.length == 0) {
            return null;
        }
        if (state.values.length == 1) {
            return null;
        }
        const sum = state.values.reduce((sum, value) => sum + value, 0);
        const count = state.values.length;
        const avg = sum / count;
        const squaredErrors = state.values.map(value => {
            return Math.pow(value - avg, 2);
        });
        const sumSquaredErrors = squaredErrors.reduce((sumSquaredErrors, squaredError) => sumSquaredErrors + squaredError, 0);
        return sumSquaredErrors / (count - 1);
    });
}
exports.initPolyfill = initPolyfill;
//# sourceMappingURL=polyfill.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/pool.js":
/*!********************************************!*\
  !*** ./dist/driver/execution/pool/pool.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const worker_1 = __webpack_require__(/*! ../../worker */ "./dist/driver/worker.js");
const connection_1 = __webpack_require__(/*! ../connection */ "./dist/driver/execution/connection/index.js");
const polyfill_1 = __webpack_require__(/*! ./polyfill */ "./dist/driver/execution/pool/polyfill.js");
class Pool {
    constructor(worker) {
        this.sharedConnectionInfo = {
            transactionData: undefined,
            savepointId: 0,
        };
        this.onInsert = new squill.PoolEventEmitter();
        this.onInsertOne = new squill.PoolEventEmitter();
        this.onInsertAndFetch = new squill.PoolEventEmitter();
        this.onInsertSelect = new squill.PoolEventEmitter();
        this.onReplace = new squill.PoolEventEmitter();
        this.onReplaceOne = new squill.PoolEventEmitter();
        this.onReplaceSelect = new squill.PoolEventEmitter();
        this.onUpdate = new squill.PoolEventEmitter();
        this.onUpdateAndFetch = new squill.PoolEventEmitter();
        this.onDelete = new squill.PoolEventEmitter();
        this.worker = worker;
        this.idAllocator = new connection_1.IdAllocator();
        this.asyncQueue = new squill.AsyncQueue(() => {
            const connection = new connection_1.Connection({
                pool: this,
                eventEmitters: new squill.ConnectionEventEmitterCollection(this),
                worker: this.worker,
                idAllocator: this.idAllocator,
                sharedConnectionInformation: this.sharedConnectionInfo,
            });
            return {
                item: connection,
                deallocate: () => {
                    return connection.deallocate();
                },
            };
        });
        this.acquire = this.asyncQueue.enqueue;
        this.acquire(async (connection) => {
            await polyfill_1.initPolyfill(connection);
        }).then(() => { }, (err) => {
            //console.error("Error creating functions", err);
            //process.exit(1);
            throw err;
        });
    }
    acquireTransaction(...args) {
        return this.acquire((connection) => {
            /**
             * TS has weird narrowing behaviours
             */
            if (args.length == 1) {
                return connection.transaction(...args);
            }
            else {
                return connection.transaction(...args);
            }
        });
    }
    acquireReadOnlyTransaction(...args) {
        return this.acquire((connection) => {
            /**
             * TS has weird narrowing behaviours
             */
            if (args.length == 1) {
                return connection.readOnlyTransaction(...args);
            }
            else {
                return connection.readOnlyTransaction(...args);
            }
        });
    }
    disconnect() {
        return this.asyncQueue.stop()
            .then(() => this.worker.postMessage({
            id: this.idAllocator.allocateId(),
            action: worker_1.SqliteAction.CLOSE,
        }), () => this.worker.postMessage({
            id: this.idAllocator.allocateId(),
            action: worker_1.SqliteAction.CLOSE,
        }));
    }
    isDeallocated() {
        return this.asyncQueue.getShouldStop();
    }
}
exports.Pool = Pool;
//# sourceMappingURL=pool.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/signed-decimal-str-util.js":
/*!***************************************************************!*\
  !*** ./dist/driver/execution/pool/signed-decimal-str-util.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const UnsignedDecimalStrUtil = __webpack_require__(/*! ./unsigned-decimal-str-util */ "./dist/driver/execution/pool/unsigned-decimal-str-util.js");
const { unsignedDecimalStrAdd, unsignedDecimalStrSubtract, unsignedDecimalStrMultiply, unsignedDecimalStrDivide, } = UnsignedDecimalStrUtil;
/**
 *
 * @param {string} decimalStr
 */
function signedDecimalStrIsPositive(decimalStr) {
    return decimalStr[0] != "-";
}
exports.signedDecimalStrIsPositive = signedDecimalStrIsPositive;
/**
 *
 * @param {string} a
 * @param {string} b
 */
function signedDecimalStrGreaterThanOrEqual(a, b) {
    if (signedDecimalStrIsPositive(a)) {
        if (signedDecimalStrIsPositive(b)) {
            if (a.length > b.length) {
                return true;
            }
            if (a.length < b.length) {
                return false;
            }
            for (let i = 0; i < a.length; ++i) {
                if (Number(a[i]) > Number(b[i])) {
                    return true;
                }
                if (Number(a[i]) < Number(b[i])) {
                    return false;
                }
            }
            return true;
        }
        else {
            //a > b
            return true;
        }
    }
    else {
        if (signedDecimalStrIsPositive(b)) {
            //a < b
            return false;
        }
        else {
            return signedDecimalStrGreaterThanOrEqual(b.substr(1), a.substr(1));
        }
    }
}
exports.signedDecimalStrGreaterThanOrEqual = signedDecimalStrGreaterThanOrEqual;
/**
 *
 * @param {string} a
 * @param {string} b
 */
function signedDecimalStrLessThanOrEqual(a, b) {
    return signedDecimalStrGreaterThanOrEqual(b, a);
}
exports.signedDecimalStrLessThanOrEqual = signedDecimalStrLessThanOrEqual;
function signedDecimalStrUnaryMinus(a) {
    if (a == "0") {
        return a;
    }
    const aNegative = a[0] == "-";
    return aNegative ? a.substr(1) : ("-" + a);
}
exports.signedDecimalStrUnaryMinus = signedDecimalStrUnaryMinus;
function signedDecimalStrSubtract(a, b) {
    if (a == b) {
        return "0";
    }
    if (b[0] == "-") {
        //a - negative = a + (-negative)
        return signedDecimalStrAdd(a, b.substr(1));
    }
    if (a[0] == "-") {
        //negative - b = -((-negative) + b)
        return signedDecimalStrUnaryMinus(signedDecimalStrAdd(a.substr(1), b));
    }
    if (signedDecimalStrGreaterThanOrEqual(a, b)) {
        //a > b
        return unsignedDecimalStrSubtract(a, b);
    }
    else {
        //a < b
        return signedDecimalStrUnaryMinus(signedDecimalStrSubtract(b, a));
    }
}
exports.signedDecimalStrSubtract = signedDecimalStrSubtract;
function signedDecimalStrAdd(a, b) {
    if (b[0] == "-") {
        //a + negative = a - (-negative)
        return signedDecimalStrSubtract(a, b.substr(1));
    }
    if (a[0] == "-") {
        //negative + b = b - (-negative)
        const absA = a.substr(1);
        if (absA == b) {
            //-x + x = 0
            return "0";
        }
        else if (signedDecimalStrGreaterThanOrEqual(absA, b)) {
            //x > b
            return signedDecimalStrUnaryMinus(signedDecimalStrSubtract(absA, b));
        }
        else {
            //x < b
            return signedDecimalStrSubtract(b, absA);
        }
    }
    return unsignedDecimalStrAdd(a, b);
}
exports.signedDecimalStrAdd = signedDecimalStrAdd;
function signedDecimalStrMultiply(a, b) {
    const aNegative = a[0] == "-";
    const bNegative = b[0] == "-";
    const absMul = unsignedDecimalStrMultiply(aNegative ? a.substr(1) : a, bNegative ? b.substr(1) : b);
    if (aNegative == bNegative) {
        return absMul;
    }
    else {
        return signedDecimalStrUnaryMinus(absMul);
    }
}
exports.signedDecimalStrMultiply = signedDecimalStrMultiply;
function signedDecimalStrDivide(a, b) {
    const aNegative = a[0] == "-";
    const bNegative = b[0] == "-";
    const absDiv = unsignedDecimalStrDivide(aNegative ? a.substr(1) : a, bNegative ? b.substr(1) : b);
    if (aNegative == bNegative) {
        return absDiv;
    }
    else {
        return signedDecimalStrUnaryMinus(absDiv);
    }
}
exports.signedDecimalStrDivide = signedDecimalStrDivide;
//# sourceMappingURL=signed-decimal-str-util.js.map

/***/ }),

/***/ "./dist/driver/execution/pool/unsigned-decimal-str-util.js":
/*!*****************************************************************!*\
  !*** ./dist/driver/execution/pool/unsigned-decimal-str-util.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function unsignedDigitArrayAdd(numA, numB) {
    const result = [];
    let carry = 0;
    for (let i = 0; i < Math.max(numA.length, numB.length); ++i) {
        carry += (i < numA.length ?
            numA[numA.length - i - 1] :
            0);
        carry += (i < numB.length ?
            numB[numB.length - i - 1] :
            0);
        const digit = carry % 10;
        carry = Math.floor(carry / 10);
        result.unshift(digit);
    }
    if (carry != 0) {
        result.unshift(carry);
    }
    return result;
}
exports.unsignedDigitArrayAdd = unsignedDigitArrayAdd;
function unsignedDigitArraySubtract(numA, numB) {
    const result = [];
    let carry = 0;
    for (let i = 0; i < numA.length; ++i) {
        carry += numA[numA.length - i - 1];
        carry -= (i < numB.length ?
            numB[numB.length - i - 1] :
            0);
        if (carry >= 0) {
            result.unshift(carry);
            carry = 0;
        }
        else {
            carry += 10;
            result.unshift(carry);
            carry = -1;
        }
    }
    if (carry < 0) {
        throw new Error(`Result of unsigned subtraction is negative`);
    }
    while (result[0] == 0 && result.length >= 2) {
        result.shift();
    }
    return result;
}
exports.unsignedDigitArraySubtract = unsignedDigitArraySubtract;
function unsignedDecimalStrAdd(a, b) {
    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);
    return unsignedDigitArrayAdd(numA, numB).join("");
}
exports.unsignedDecimalStrAdd = unsignedDecimalStrAdd;
function unsignedDecimalStrSubtract(a, b) {
    if (a == b) {
        return "0";
    }
    if (a.length < b.length) {
        throw new Error(`Result of unsigned subtraction is negative`);
    }
    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);
    return unsignedDigitArraySubtract(numA, numB).join("");
}
exports.unsignedDecimalStrSubtract = unsignedDecimalStrSubtract;
function unsignedDecimalStrMultiply(a, b) {
    if (a == "0" || b == "0") {
        return "0";
    }
    if (a == "1") {
        return b;
    }
    if (b == "1") {
        return a;
    }
    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);
    const arr = numB.map((digitB, indexB) => {
        const result = [];
        let carry = 0;
        for (let i = numA.length - 1; i >= 0; --i) {
            const digitA = numA[i];
            carry += digitA * digitB;
            const digit = carry % 10;
            carry = Math.floor(carry / 10);
            result.unshift(digit);
        }
        if (carry != 0) {
            result.unshift(carry);
        }
        const powerOf10 = numB.length - indexB - 1;
        for (let i = 0; i < powerOf10; ++i) {
            result.push(0);
        }
        return result;
    });
    if (arr.length == 0) {
        return "0";
    }
    if (arr.length == 1) {
        return arr[0].join("");
    }
    const [x, y, ...rest] = arr;
    let result = unsignedDigitArrayAdd(x, y);
    for (const r of rest) {
        result = unsignedDigitArrayAdd(result, r);
    }
    return result.join("");
}
exports.unsignedDecimalStrMultiply = unsignedDecimalStrMultiply;
function unsignedDigitArrayGreaterThanOrEqual(numA, numB) {
    if (numA.length > numB.length) {
        return true;
    }
    if (numA.length < numB.length) {
        return false;
    }
    for (let i = 0; i < numA.length; ++i) {
        const digitA = numA[i];
        const digitB = numB[i];
        if (digitA > digitB) {
            return true;
        }
        if (digitA < digitB) {
            return false;
        }
    }
    return true;
}
exports.unsignedDigitArrayGreaterThanOrEqual = unsignedDigitArrayGreaterThanOrEqual;
function unsignedDigitArrayLessThanOrEqual(numA, numB) {
    return unsignedDigitArrayGreaterThanOrEqual(numB, numA);
}
exports.unsignedDigitArrayLessThanOrEqual = unsignedDigitArrayLessThanOrEqual;
function unsignedDecimalStrDivide(a, b) {
    if (b == "0") {
        throw new Error(`DivideByZeroError: Cannot divide by zero`);
    }
    if (b == "1") {
        return a;
    }
    if (a == "0") {
        return "0";
    }
    const numA = a.toString().split("").map(Number);
    const numB = b.toString().split("").map(Number);
    const quotient = [];
    let remainder = [];
    for (let i = 0; i < numA.length; ++i) {
        remainder.push(numA[i]);
        while (remainder[0] == 0 && remainder.length >= 2) {
            remainder.shift();
        }
        if (remainder.length < numB.length) {
            quotient.push(0);
            continue;
        }
        let tmp = [0];
        let q = 0;
        while (q <= 9) {
            const tmp2 = unsignedDigitArrayAdd(tmp, numB);
            if (unsignedDigitArrayLessThanOrEqual(tmp2, remainder)) {
                tmp = tmp2;
                ++q;
            }
            else {
                break;
            }
        }
        if (q == 0) {
            quotient.push(0);
            continue;
        }
        quotient.push(q);
        remainder = unsignedDigitArraySubtract(remainder, tmp);
    }
    while (quotient[0] == 0 && quotient.length >= 2) {
        quotient.shift();
    }
    return quotient.join("");
}
exports.unsignedDecimalStrDivide = unsignedDecimalStrDivide;
//# sourceMappingURL=unsigned-decimal-str-util.js.map

/***/ }),

/***/ "./dist/driver/expr-library/index.js":
/*!*******************************************!*\
  !*** ./dist/driver/expr-library/index.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./information */ "./dist/driver/expr-library/information/index.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/expr-library/information/index.js":
/*!*******************************************************!*\
  !*** ./dist/driver/expr-library/information/index.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./last-insert-row-id */ "./dist/driver/expr-library/information/last-insert-row-id.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/expr-library/information/last-insert-row-id.js":
/*!********************************************************************!*\
  !*** ./dist/driver/expr-library/information/last-insert-row-id.js ***!
  \********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tm = __webpack_require__(/*! type-mapping */ "./node_modules/type-mapping/dist/index.js");
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
exports.lastInsertRowId = squill.makeCustomOperator0("LAST_INSERT_ROWID()", tm.mysql.bigIntSigned());
//# sourceMappingURL=last-insert-row-id.js.map

/***/ }),

/***/ "./dist/driver/index.js":
/*!******************************!*\
  !*** ./dist/driver/index.js ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./execution */ "./dist/driver/execution/index.js"));
__export(__webpack_require__(/*! ./expr-library */ "./dist/driver/expr-library/index.js"));
__export(__webpack_require__(/*! ./schema-introspection */ "./dist/driver/schema-introspection/index.js"));
__export(__webpack_require__(/*! ./sqlfier */ "./dist/driver/sqlfier/index.js"));
__export(__webpack_require__(/*! ./constants */ "./dist/driver/constants.js"));
__export(__webpack_require__(/*! ./worker */ "./dist/driver/worker.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/schema-introspection/index.js":
/*!***************************************************!*\
  !*** ./dist/driver/schema-introspection/index.js ***!
  \***************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./sqlite-master */ "./dist/driver/schema-introspection/sqlite-master.js"));
__export(__webpack_require__(/*! ./try-fetch-generated-column-expression */ "./dist/driver/schema-introspection/try-fetch-generated-column-expression.js"));
__export(__webpack_require__(/*! ./try-fetch-schema-meta */ "./dist/driver/schema-introspection/try-fetch-schema-meta.js"));
__export(__webpack_require__(/*! ./try-fetch-table-meta */ "./dist/driver/schema-introspection/try-fetch-table-meta.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/schema-introspection/sqlite-master.js":
/*!***********************************************************!*\
  !*** ./dist/driver/schema-introspection/sqlite-master.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
exports.sqlite_master = squill.table("sqlite_master")
    .addColumns({
    type: squill.dtVarChar(),
    name: squill.dtVarChar(),
    tbl_name: squill.dtVarChar(),
    rootpage: squill.dtBigIntSigned(),
    sql: squill.dtVarChar().orNull(),
})
    .setPrimaryKey(columns => [columns.name]);
//# sourceMappingURL=sqlite-master.js.map

/***/ }),

/***/ "./dist/driver/schema-introspection/try-fetch-generated-column-expression.js":
/*!***********************************************************************************!*\
  !*** ./dist/driver/schema-introspection/try-fetch-generated-column-expression.js ***!
  \***********************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function tryFetchGeneratedColumnExpression(_connection, _schemaAlias, _tableAlias, _columnAlias) {
    /**
     * @todo
     */
    return Promise.resolve(undefined);
}
exports.tryFetchGeneratedColumnExpression = tryFetchGeneratedColumnExpression;
//# sourceMappingURL=try-fetch-generated-column-expression.js.map

/***/ }),

/***/ "./dist/driver/schema-introspection/try-fetch-schema-meta.js":
/*!*******************************************************************!*\
  !*** ./dist/driver/schema-introspection/try-fetch-schema-meta.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const try_fetch_table_meta_1 = __webpack_require__(/*! ./try-fetch-table-meta */ "./dist/driver/schema-introspection/try-fetch-table-meta.js");
const sqlite_master_1 = __webpack_require__(/*! ./sqlite-master */ "./dist/driver/schema-introspection/sqlite-master.js");
const constants_1 = __webpack_require__(/*! ../constants */ "./dist/driver/constants.js");
async function tryFetchSchemaMeta(connection, rawSchemaAlias) {
    const schemaAlias = (rawSchemaAlias == undefined ?
        constants_1.DEFAULT_SCHEMA_NAME :
        rawSchemaAlias);
    const tables = await squill
        .from(sqlite_master_1.sqlite_master
        .setSchemaName(schemaAlias))
        .whereEq(columns => columns.type, "table")
        .selectValue(columns => columns.name)
        .map(async (row) => {
        const tableMeta = await try_fetch_table_meta_1.tryFetchTableMeta(connection, schemaAlias, row.sqlite_master.name);
        if (tableMeta == undefined) {
            throw new Error(`Table ${squill.pascalStyleEscapeString(schemaAlias)}.${squill.pascalStyleEscapeString(row.sqlite_master.name)} does not exist`);
        }
        else {
            return tableMeta;
        }
    })
        .fetchAll(connection);
    return {
        schemaAlias,
        tables,
    };
}
exports.tryFetchSchemaMeta = tryFetchSchemaMeta;
//# sourceMappingURL=try-fetch-schema-meta.js.map

/***/ }),

/***/ "./dist/driver/schema-introspection/try-fetch-table-meta.js":
/*!******************************************************************!*\
  !*** ./dist/driver/schema-introspection/try-fetch-table-meta.js ***!
  \******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tm = __webpack_require__(/*! type-mapping */ "./node_modules/type-mapping/dist/index.js");
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const sqlite_master_1 = __webpack_require__(/*! ./sqlite-master */ "./dist/driver/schema-introspection/sqlite-master.js");
async function tryFetchTableMeta(connection, schemaAlias, tableAlias) {
    const sql = await sqlite_master_1.sqlite_master
        .setSchemaName(schemaAlias)
        .whereEqPrimaryKey({
        name: tableAlias,
    })
        .fetchValue(connection, columns => columns.sql)
        .orUndefined();
    if (sql === undefined) {
        return undefined;
    }
    if (sql === null) {
        throw new Error(`Table ${tableAlias} should have SQL string`);
    }
    //Modified version of
    //http://afoucal.free.fr/index.php/2009/01/26/get-default-value-and-unique-attribute-field-sqlite-database-using-air/
    const allColumnDefSql = sql.replace(/^CREATE\s+\w+\s+(("\w+"|\w+)|\[(.+)\])\s+(\(|AS|)/im, "");
    function getColumnDefSqlImpl(columnAlias) {
        const columnRegex = new RegExp(columnAlias + "(.*?)(,|\r|$)", "m");
        const columnDefSqlMatch = allColumnDefSql.match(columnRegex);
        if (columnDefSqlMatch == undefined) {
            return undefined;
        }
        return columnDefSqlMatch[1];
    }
    function getColumnDefSql(columnAlias) {
        const resultQuoted = getColumnDefSqlImpl(squill.escapeIdentifierWithDoubleQuotes(columnAlias));
        if (resultQuoted != undefined) {
            return resultQuoted;
        }
        const resultUnquoted = getColumnDefSqlImpl(columnAlias);
        if (resultUnquoted != undefined) {
            return resultUnquoted;
        }
        throw new Error(`Cannot find column definition for ${tableAlias}.${columnAlias}`);
    }
    function isAutoIncrement(columnAlias) {
        return /AUTOINCREMENT/i.test(getColumnDefSql(columnAlias));
    }
    function isUnique(columnAlias) {
        return /UNIQUE/i.test(getColumnDefSql(columnAlias));
    }
    function isPrimaryKey(columnAlias) {
        return /PRIMARY\s+KEY/i.test(getColumnDefSql(columnAlias));
    }
    let constraintSql = allColumnDefSql;
    const { execResult } = await connection
        .exec(`pragma table_info(${squill.escapeIdentifierWithDoubleQuotes(tableAlias)})`);
    if (execResult.length != 1) {
        throw new Error(`Expected to fetch table info`);
    }
    const candidateKeys = [];
    let primaryKey = undefined;
    const resultSet = execResult[0];
    const objArr = resultSet.values.map((row) => {
        const obj = resultSet.columns.reduce((obj, columnAlias, index) => {
            obj[columnAlias] = row[index];
            return obj;
        }, {});
        obj.isAutoIncrement = isAutoIncrement(obj.name);
        obj.isUnique = isUnique(obj.name);
        obj.isPrimaryKey = isPrimaryKey(obj.name);
        obj.columnAlias = obj.name;
        obj.isNullable = tm.BigIntUtil.equal(obj.notnull, tm.BigInt(0));
        obj.explicitDefaultValue = typeof obj.dflt_value == "string" ?
            obj.dflt_value :
            undefined;
        /**
         * @todo
         */
        obj.generationExpression = undefined;
        const columnDef = getColumnDefSql(obj.name);
        constraintSql = constraintSql.replace(columnDef, "");
        if (isPrimaryKey(obj.name)) {
            if (primaryKey != undefined) {
                throw new Error(`Multiple primary keys found`);
            }
            primaryKey = {
                candidateKeyName: obj.name,
                columnAliases: [obj.name],
            };
        }
        else if (isUnique(obj.name)) {
            const constraintRegex = /CONSTRAINT\s+(.+)\s+UNIQUE/gi;
            const constraintMatch = constraintRegex.exec(columnDef);
            if (constraintMatch == undefined) {
                throw new Error(`Cannot get UNIQUE constraint of ${obj.name}`);
            }
            candidateKeys.push({
                candidateKeyName: squill.tryUnescapeIdentifierWithDoubleQuotes(constraintMatch[1]),
                columnAliases: [obj.name],
            });
        }
        return obj;
    });
    const constraintRegex = /CONSTRAINT\s+(.+)\s+(UNIQUE|PRIMARY\s+KEY)\s*\((.+)\)/gi;
    while (true) {
        const constraintMatch = constraintRegex.exec(constraintSql);
        if (constraintMatch == undefined) {
            break;
        }
        const constraintName = squill.tryUnescapeIdentifierWithDoubleQuotes(constraintMatch[1]);
        const constraintType = constraintMatch[2];
        const constraintColumns = constraintMatch[3];
        const columnRegex = /\s*(.+?)\s*(,|$)/gi;
        const columnAliases = [];
        while (true) {
            const columnMatch = columnRegex.exec(constraintColumns);
            if (columnMatch == undefined) {
                break;
            }
            columnAliases.push(squill.tryUnescapeIdentifierWithDoubleQuotes(columnMatch[1]));
        }
        if (constraintType.toUpperCase() == "UNIQUE") {
            candidateKeys.push({
                candidateKeyName: constraintName,
                columnAliases,
            });
        }
        else {
            if (primaryKey != undefined) {
                throw new Error(`Multiple primary keys found`);
            }
            primaryKey = {
                candidateKeyName: constraintName,
                columnAliases,
            };
        }
    }
    return {
        tableAlias,
        columns: objArr,
        candidateKeys,
        primaryKey: candidateKeys.find(candidateKey => candidateKey.candidateKeyName == "PRIMARY"),
    };
}
exports.tryFetchTableMeta = tryFetchTableMeta;
//# sourceMappingURL=try-fetch-table-meta.js.map

/***/ }),

/***/ "./dist/driver/sqlfier/delete-sql-string.js":
/*!**************************************************!*\
  !*** ./dist/driver/sqlfier/delete-sql-string.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const sqlfier_1 = __webpack_require__(/*! ./sqlfier */ "./dist/driver/sqlfier/sqlfier.js");
function deleteSqlString(table, whereClause) {
    const ast = [
        "DELETE FROM",
        table.unaliasedAst,
        "WHERE",
        whereClause.ast
    ];
    return squill.AstUtil.toSql(ast, sqlfier_1.sqlfier);
}
exports.deleteSqlString = deleteSqlString;
//# sourceMappingURL=delete-sql-string.js.map

/***/ }),

/***/ "./dist/driver/sqlfier/index.js":
/*!**************************************!*\
  !*** ./dist/driver/sqlfier/index.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./delete-sql-string */ "./dist/driver/sqlfier/delete-sql-string.js"));
__export(__webpack_require__(/*! ./insert-many-sql-string */ "./dist/driver/sqlfier/insert-many-sql-string.js"));
__export(__webpack_require__(/*! ./insert-one-sql-string */ "./dist/driver/sqlfier/insert-one-sql-string.js"));
__export(__webpack_require__(/*! ./insert-select-sql-string */ "./dist/driver/sqlfier/insert-select-sql-string.js"));
__export(__webpack_require__(/*! ./sqlfier */ "./dist/driver/sqlfier/sqlfier.js"));
__export(__webpack_require__(/*! ./update-sql-string */ "./dist/driver/sqlfier/update-sql-string.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/driver/sqlfier/insert-many-sql-string.js":
/*!*******************************************************!*\
  !*** ./dist/driver/sqlfier/insert-many-sql-string.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tm = __webpack_require__(/*! type-mapping */ "./node_modules/type-mapping/dist/index.js");
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const sqlfier_1 = __webpack_require__(/*! ./sqlfier */ "./dist/driver/sqlfier/sqlfier.js");
const schema_introspection_1 = __webpack_require__(/*! ../schema-introspection */ "./dist/driver/schema-introspection/index.js");
const constants_1 = __webpack_require__(/*! ../constants */ "./dist/driver/constants.js");
async function insertManySqlString(connection, insertType, table, insertRows) {
    const rawSchemaName = squill.TableUtil.tryGetSchemaName(table);
    const schemaName = (rawSchemaName == undefined ?
        constants_1.DEFAULT_SCHEMA_NAME :
        rawSchemaName);
    /**
     * We need to fetch the `tableMeta` because SQLite does not support the
     * `DEFAULT` keyword.
     */
    const tableMeta = await schema_introspection_1.tryFetchTableMeta(connection, schemaName, table.alias);
    if (tableMeta == undefined) {
        throw new Error(`Table ${squill.pascalStyleEscapeString(schemaName)}.${squill.pascalStyleEscapeString(table.alias)} does not exist`);
    }
    const structure = tableMeta.columns;
    //console.log(structure);
    const columnAliases = squill.TableUtil.columnAlias(table)
        .sort()
        .filter(columnAlias => {
        /**
         * @todo handle GENERATED columns
         */
        //Might possibly be a GENERATED column, actually.
        //For some reason, these don't show up in pragma table_info
        const columnDef = structure.find(columnDef => {
            return columnDef.name == columnAlias;
        });
        return columnDef != undefined;
    });
    const values = insertRows.map(insertRow => {
        const ast = columnAliases
            .map(columnAlias => {
            const value = insertRow[columnAlias];
            if (value === undefined) {
                const columnDef = structure.find(columnDef => {
                    return columnDef.name == columnAlias;
                });
                if (columnDef == undefined) {
                    //Might possibly be a GENERATED column, actually.
                    //For some reason, these don't show up in pragma table_info
                    throw new Error(`Unknown column ${table.alias}.${columnAlias}`);
                }
                if (columnDef.dflt_value != undefined) {
                    return columnDef.dflt_value;
                }
                if (tm.BigIntUtil.equal(columnDef.notnull, tm.BigInt(1))) {
                    if (columnDef.isAutoIncrement) {
                        return "NULL";
                    }
                    throw new Error(`${table.alias}.${columnAlias} is not nullable`);
                }
                else {
                    return "NULL";
                }
            }
            else {
                return squill.BuiltInExprUtil.buildAst(value);
            }
        })
            .reduce((values, ast) => {
            if (values.length > 0) {
                values.push(", ");
            }
            values.push(ast);
            return values;
        }, []);
        ast.unshift("(");
        ast.push(")");
        return ast;
    })
        .reduce((values, ast) => {
        if (values.length > 0) {
            values.push(", ");
        }
        values.push(ast);
        return values;
    }, []);
    const ast = [
        `${insertType} INTO`,
        /**
         * We use the `unaliasedAst` because the user may have called `setSchemaName()`
         */
        table.unaliasedAst,
        "(",
        columnAliases.map(squill.escapeIdentifierWithDoubleQuotes).join(", "),
        ") VALUES",
        ...values,
    ];
    const sql = squill.AstUtil.toSql(ast, sqlfier_1.sqlfier);
    return sql;
}
exports.insertManySqlString = insertManySqlString;
//# sourceMappingURL=insert-many-sql-string.js.map

/***/ }),

/***/ "./dist/driver/sqlfier/insert-one-sql-string.js":
/*!******************************************************!*\
  !*** ./dist/driver/sqlfier/insert-one-sql-string.js ***!
  \******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const sqlfier_1 = __webpack_require__(/*! ./sqlfier */ "./dist/driver/sqlfier/sqlfier.js");
function insertOneSqlString(insertType, table, insertRow) {
    const columnAliases = squill.TableUtil.columnAlias(table)
        .filter(columnAlias => {
        return insertRow[columnAlias] !== undefined;
    })
        .sort();
    const values = columnAliases
        .map(columnAlias => squill.BuiltInExprUtil.buildAst(insertRow[columnAlias]))
        .reduce((values, ast) => {
        if (values.length > 0) {
            values.push(", ");
        }
        values.push(ast);
        return values;
    }, []);
    const ast = values.length == 0 ?
        [
            `${insertType} INTO`,
            /**
             * We use the `unaliasedAst` because the user may have called `setSchemaName()`
             */
            table.unaliasedAst,
            "DEFAULT VALUES",
        ] :
        [
            `${insertType} INTO`,
            /**
             * We use the `unaliasedAst` because the user may have called `setSchemaName()`
             */
            table.unaliasedAst,
            "(",
            columnAliases.map(squill.escapeIdentifierWithDoubleQuotes).join(", "),
            ") VALUES (",
            ...values,
            ")",
        ];
    return squill.AstUtil.toSql(ast, sqlfier_1.sqlfier);
}
exports.insertOneSqlString = insertOneSqlString;
//# sourceMappingURL=insert-one-sql-string.js.map

/***/ }),

/***/ "./dist/driver/sqlfier/insert-select-sql-string.js":
/*!*********************************************************!*\
  !*** ./dist/driver/sqlfier/insert-select-sql-string.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tm = __webpack_require__(/*! type-mapping */ "./node_modules/type-mapping/dist/index.js");
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const sqlfier_1 = __webpack_require__(/*! ./sqlfier */ "./dist/driver/sqlfier/sqlfier.js");
const constants_1 = __webpack_require__(/*! ../constants */ "./dist/driver/constants.js");
const schema_introspection_1 = __webpack_require__(/*! ../schema-introspection */ "./dist/driver/schema-introspection/index.js");
async function insertSelectSqlString(connection, insertType, query, table, insertSelectRow) {
    const rawSchemaName = squill.TableUtil.tryGetSchemaName(table);
    const schemaName = (rawSchemaName == undefined ?
        constants_1.DEFAULT_SCHEMA_NAME :
        rawSchemaName);
    /**
     * We need to fetch the `tableMeta` because SQLite does not support the
     * `DEFAULT` keyword.
     */
    const tableMeta = await schema_introspection_1.tryFetchTableMeta(connection, schemaName, table.alias);
    if (tableMeta == undefined) {
        throw new Error(`Table ${squill.pascalStyleEscapeString(schemaName)}.${squill.pascalStyleEscapeString(table.alias)} does not exist`);
    }
    const structure = tableMeta.columns;
    //console.log(structure);
    const columnAliases = squill.TableUtil.columnAlias(table)
        .sort()
        .filter(columnAlias => {
        /**
         * @todo handle GENERATED columns
         */
        //Might possibly be a GENERATED column, actually.
        //For some reason, these don't show up in pragma table_info
        const columnDef = structure.find(columnDef => {
            return columnDef.name == columnAlias;
        });
        return columnDef != undefined;
    });
    const values = columnAliases
        .map(columnAlias => {
        const value = insertSelectRow[columnAlias];
        if (value === undefined) {
            const columnDef = structure.find(columnDef => {
                return columnDef.name == columnAlias;
            });
            if (columnDef == undefined) {
                //Might possibly be a GENERATED column, actually.
                //For some reason, these don't show up in pragma table_info
                throw new Error(`Unknown column ${table.alias}.${columnAlias}`);
            }
            if (columnDef.dflt_value != undefined) {
                return columnDef.dflt_value;
            }
            if (tm.BigIntUtil.equal(columnDef.notnull, tm.BigInt(1))) {
                if (columnDef.isAutoIncrement) {
                    return "NULL";
                }
                throw new Error(`${table.alias}.${columnAlias} is not nullable`);
            }
            else {
                return "NULL";
            }
        }
        else {
            if (squill.ColumnUtil.isColumn(value)) {
                return squill.escapeIdentifierWithDoubleQuotes(`${value.tableAlias}${squill.SEPARATOR}${value.columnAlias}`);
            }
            else {
                return squill.BuiltInExprUtil.buildAst(value);
            }
        }
    })
        .reduce((values, ast) => {
        if (values.length > 0) {
            values.push(", ");
        }
        values.push(ast);
        return values;
    }, []);
    const ast = [
        `${insertType} INTO`,
        /**
         * We use the `unaliasedAst` because the user may have called `setSchemaName()`
         */
        table.unaliasedAst,
        "(",
        columnAliases.map(squill.escapeIdentifierWithDoubleQuotes).join(", "),
        ")",
        "SELECT",
        ...values,
        "FROM",
        "(",
        query,
        ") AS tmp"
    ];
    const sql = squill.AstUtil.toSql(ast, sqlfier_1.sqlfier);
    return sql;
}
exports.insertSelectSqlString = insertSelectSqlString;
//# sourceMappingURL=insert-select-sql-string.js.map

/***/ }),

/***/ "./dist/driver/sqlfier/sqlfier.js":
/*!****************************************!*\
  !*** ./dist/driver/sqlfier/sqlfier.js ***!
  \****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tm = __webpack_require__(/*! type-mapping */ "./node_modules/type-mapping/dist/index.js");
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const constants_1 = __webpack_require__(/*! ../constants */ "./dist/driver/constants.js");
/**
* We do not use `ABS(-9223372036854775808)` because of,
* https://github.com/AnyhowStep/tsql/issues/233
*/
exports.THROW_AST = "(SELECT SUM(9223372036854775807) FROM (SELECT NULL UNION ALL SELECT NULL))";
const insertBetween = squill.AstUtil.insertBetween;
function normalizeOrderByAndLimitClauses(query) {
    /**
     * MySQL behaviour,
     * No `UNION` clause.
     *
     * | `ORDER BY` | `LIMIT` | `UNION ORDER BY` | `UNION LIMIT` | Result
     * |------------|---------|------------------|---------------|-------------------------------------------------
     * | Y          | Y       | Y                | Y             | `ORDER BY ... LIMIT ...) ORDER BY ... LIMIT ...`
     * | Y          | Y       | Y                | N             | `ORDER BY ... LIMIT ...) ORDER BY ...`
     * | Y          | Y       | N                | Y             | `ORDER BY ...) LIMIT ...`
     * | Y          | Y       | N                | N             | `ORDER BY ... LIMIT ...)`
     * | Y          | N       | Y                | Y             | `) ORDER BY ... LIMIT ...`
     * | Y          | N       | Y                | N             | `) ORDER BY ...`
     * | Y          | N       | N                | Y             | `ORDER BY ...) LIMIT ...`
     * | Y          | N       | N                | N             | `ORDER BY ...)`
     * |------------|---------|------------------|---------------|-------------------------------------------------
     * | N          | Y       | Y                | Y             | `LIMIT ...) ORDER BY ... LIMIT ...`
     * | N          | Y       | Y                | N             | `LIMIT ...) ORDER BY ...`
     * | N          | Y       | N                | Y             | `) LIMIT ...`
     * | N          | Y       | N                | N             | `LIMIT ...)`
     * | N          | N       | Y                | Y             | `) ORDER BY ... LIMIT ...`
     * | N          | N       | Y                | N             | `) ORDER BY ...`
     * | N          | N       | N                | Y             | `) LIMIT ...`
     * | N          | N       | N                | N             | `)`
     *
     * Observations:
     * + With no `LIMIT` clause, the `UNION ORDER BY` and `UNION LIMIT` take over, regardless of `ORDER BY`
     * + With the `LIMIT` clause, the `UNION ORDER BY` never takes over
     * + With the `LIMIT` clause, the `UNION LIMIT` takes over when there is no `UNION ORDER BY`
     *
     * + `UNION LIMIT` takes over when, !`LIMIT` || !`UNION ORDER BY`
     * + `UNION ORDER BY` takes over when, !`LIMIT`
     */
    /**
     *
     * MySQL behaviour,
     * With `UNION` clause.
     *
     * Nothing is taken over.
     */
    const orderByClause = ((query.compoundQueryOrderByClause != undefined &&
        query.compoundQueryClause == undefined &&
        query.limitClause == undefined) ?
        query.compoundQueryOrderByClause :
        query.orderByClause);
    const limitClause = ((query.compoundQueryLimitClause != undefined &&
        query.compoundQueryClause == undefined &&
        (query.limitClause == undefined ||
            query.compoundQueryOrderByClause == undefined)) ?
        query.compoundQueryLimitClause :
        query.limitClause);
    const compoundQueryOrderByClause = (orderByClause == query.compoundQueryOrderByClause ?
        undefined :
        query.compoundQueryOrderByClause);
    const compoundQueryLimitClause = (limitClause == query.compoundQueryLimitClause ?
        undefined :
        query.compoundQueryLimitClause);
    return {
        ...query,
        orderByClause,
        limitClause,
        compoundQueryOrderByClause,
        compoundQueryLimitClause,
    };
}
function selectClauseColumnToSql(column, isDerivedTable) {
    return [
        [
            squill.escapeIdentifierWithDoubleQuotes(column.tableAlias),
            ".",
            squill.escapeIdentifierWithDoubleQuotes(column.columnAlias)
        ].join(""),
        "AS",
        squill.escapeIdentifierWithDoubleQuotes(isDerivedTable ?
            column.columnAlias :
            `${column.tableAlias}${squill.SEPARATOR}${column.columnAlias}`)
    ];
}
function selectClauseColumnArrayToSql(columns, isDerivedTable) {
    columns.sort((a, b) => {
        const tableAliasCmp = a.tableAlias.localeCompare(b.tableAlias);
        if (tableAliasCmp != 0) {
            return tableAliasCmp;
        }
        return a.columnAlias.localeCompare(b.columnAlias);
    });
    const result = [];
    for (const column of columns) {
        if (result.length > 0) {
            result.push(",");
        }
        result.push(...selectClauseColumnToSql(column, isDerivedTable));
    }
    return result;
}
function selectClauseColumnMapToSql(map, isDerivedTable) {
    const columns = squill.ColumnUtil.fromColumnMap(map);
    return selectClauseColumnArrayToSql(columns, isDerivedTable);
}
function selectClauseColumnRefToSql(ref, isDerivedTable) {
    const columns = squill.ColumnUtil.fromColumnRef(ref);
    return selectClauseColumnArrayToSql(columns, isDerivedTable);
}
function selectClauseToSql(selectClause, toSql, isDerivedTable, isDistinct) {
    const result = [];
    for (const selectItem of selectClause) {
        if (result.length > 0) {
            result.push(",");
        }
        if (squill.ColumnUtil.isColumn(selectItem)) {
            result.push(...selectClauseColumnToSql(selectItem, isDerivedTable));
        }
        else if (squill.ExprSelectItemUtil.isExprSelectItem(selectItem)) {
            result.push(toSql(selectItem.unaliasedAst), "AS", squill.escapeIdentifierWithDoubleQuotes(isDerivedTable ?
                selectItem.alias :
                `${selectItem.tableAlias}${squill.SEPARATOR}${selectItem.alias}`));
        }
        else if (squill.ColumnMapUtil.isColumnMap(selectItem)) {
            result.push(...selectClauseColumnMapToSql(selectItem, isDerivedTable));
        }
        else if (squill.ColumnRefUtil.isColumnRef(selectItem)) {
            result.push(...selectClauseColumnRefToSql(selectItem, isDerivedTable));
        }
        else {
            throw new Error(`Not implemented`);
        }
    }
    return isDistinct ?
        ["SELECT DISTINCT", ...result] :
        ["SELECT", ...result];
}
function fromClauseToSql(currentJoins, toSql) {
    const result = [];
    for (const join of currentJoins) {
        if (join.joinType == squill.JoinType.FROM) {
            result.push("FROM");
        }
        else {
            result.push(join.joinType, "JOIN");
        }
        if (squill.isIdentifierNode(join.tableAst)) {
            const lastIdentifier = join.tableAst.identifiers[join.tableAst.identifiers.length - 1];
            if (lastIdentifier == join.tableAlias) {
                result.push(toSql(join.tableAst));
            }
            else {
                result.push(toSql(join.tableAst), "AS", squill.escapeIdentifierWithDoubleQuotes(join.tableAlias));
            }
        }
        else if (squill.QueryBaseUtil.isQuery(join.tableAst)) {
            result.push("(", queryToSql(join.tableAst, toSql, true), ")");
            result.push("AS");
            result.push(squill.escapeIdentifierWithDoubleQuotes(join.tableAlias));
        }
        else if (squill.Parentheses.IsParentheses(join.tableAst) && squill.QueryBaseUtil.isQuery(join.tableAst.ast)) {
            const subQuery = join.tableAst.ast;
            result.push("(", queryToSql(subQuery, toSql, true), ")");
            result.push("AS");
            result.push(squill.escapeIdentifierWithDoubleQuotes(join.tableAlias));
        }
        else {
            result.push("(", toSql(join.tableAst), ")");
            result.push("AS");
            result.push(squill.escapeIdentifierWithDoubleQuotes(join.tableAlias));
        }
        if (join.onClause != undefined) {
            result.push("ON");
            result.push(toSql(squill.AstUtil.tryUnwrapParentheses(join.onClause.ast)));
        }
    }
    return result;
}
function whereClauseToSql(whereClause, toSql) {
    return [
        "WHERE",
        toSql(squill.AstUtil.tryUnwrapParentheses(whereClause.ast))
    ];
}
function orderByClauseToSql(orderByClause, toSql) {
    if (orderByClause.length == 0) {
        return [];
    }
    const result = [];
    for (const [sortExpr, sortDirection] of orderByClause) {
        if (result.length > 0) {
            result.push(",");
        }
        if (squill.ColumnUtil.isColumn(sortExpr)) {
            if (sortExpr.unaliasedAst == undefined) {
                result.push([
                    squill.escapeIdentifierWithDoubleQuotes(sortExpr.tableAlias),
                    ".",
                    squill.escapeIdentifierWithDoubleQuotes(sortExpr.columnAlias)
                ].join(""));
            }
            else {
                result.push(squill.escapeIdentifierWithDoubleQuotes(`${sortExpr.tableAlias}${squill.SEPARATOR}${sortExpr.columnAlias}`));
            }
        }
        else if (squill.ExprUtil.isExpr(sortExpr)) {
            if (squill.LiteralValueNodeUtil.isLiteralValueNode(sortExpr.ast)) {
                if (sortExpr.ast.literalValueType == squill.LiteralValueType.BIGINT_SIGNED) {
                    result.push(toSql([sortExpr.ast, "+ 0"]));
                }
                else {
                    result.push(toSql(sortExpr.ast));
                }
            }
            else {
                result.push(toSql(sortExpr.ast));
            }
        }
        else {
            result.push(toSql(sortExpr.unaliasedAst));
        }
        result.push(sortDirection);
    }
    return [
        "ORDER BY",
        ...result
    ];
}
function groupByClauseToSql(groupByClause, _toSql) {
    if (groupByClause.length == 0) {
        return [];
    }
    const result = [];
    for (const column of groupByClause) {
        if (result.length > 0) {
            result.push(",");
        }
        if (column.tableAlias == squill.ALIASED) {
            result.push(squill.escapeIdentifierWithDoubleQuotes(`${column.tableAlias}${squill.SEPARATOR}${column.columnAlias}`));
        }
        else {
            result.push([
                squill.escapeIdentifierWithDoubleQuotes(column.tableAlias),
                ".",
                squill.escapeIdentifierWithDoubleQuotes(column.columnAlias)
            ].join(""));
        }
    }
    return [
        "GROUP BY",
        ...result
    ];
}
function havingClauseToSql(havingClause, toSql) {
    return [
        "HAVING",
        toSql(squill.AstUtil.tryUnwrapParentheses(havingClause.ast))
    ];
}
function limitClauseToSql(limitClause, _toSql) {
    return [
        "LIMIT",
        squill.escapeValue(limitClause.maxRowCount),
        "OFFSET",
        squill.escapeValue(limitClause.offset),
    ];
}
function compoundQueryClauseToSql(compoundQueryClause, toSql) {
    const result = [];
    for (const rawCompoundQuery of compoundQueryClause) {
        result.push(rawCompoundQuery.compoundQueryType);
        if (!rawCompoundQuery.isDistinct) {
            result.push("ALL");
        }
        const query = rawCompoundQuery.query;
        if (query.orderByClause != undefined ||
            query.limitClause != undefined ||
            query.compoundQueryClause != undefined ||
            query.compoundQueryOrderByClause != undefined ||
            query.compoundQueryLimitClause != undefined) {
            result.push("SELECT * FROM (", toSql(query), ")");
        }
        else {
            result.push(toSql(query));
        }
    }
    return result;
}
function queryToSql(rawQuery, toSql, isDerivedTable) {
    const query = normalizeOrderByAndLimitClauses(rawQuery);
    if ((
    /**
     * If we have both a compound `ORDER BY/LIMIT` clause
     * and regular `ORDER BY/LIMIT` clause,
     * we will need a derived table because
     * SQLite only supports on `ORDER BY` and `LIMIT` clause for the entire query.
     */
    (query.compoundQueryOrderByClause != undefined ||
        query.compoundQueryLimitClause != undefined) &&
        (query.orderByClause != undefined ||
            query.limitClause != undefined)) ||
        /**
         * If we have a compound query and an `ORDER BY` or `LIMIT` clause,
         * we will need to make the query a derived table because
         * SQLite only supports on `ORDER BY` and `LIMIT` clause for the entire query.
         */
        (query.compoundQueryClause != undefined &&
            (query.orderByClause != undefined ||
                query.limitClause != undefined))) {
        /**
         * We have to apply some hackery to get the same behaviour as MySQL.
         */
        const innerQuery = {
            ...query,
            compoundQueryClause: undefined,
            compoundQueryOrderByClause: undefined,
            compoundQueryLimitClause: undefined,
        };
        const result = [
            "SELECT * FROM (",
            toSql(innerQuery),
            ")"
        ];
        if (query.compoundQueryClause != undefined) {
            result.push(compoundQueryClauseToSql(query.compoundQueryClause, toSql).join(" "));
        }
        if (query.compoundQueryOrderByClause != undefined) {
            result.push(orderByClauseToSql(query.compoundQueryOrderByClause, toSql).join(" "));
        }
        if (query.compoundQueryLimitClause != undefined) {
            result.push(limitClauseToSql(query.compoundQueryLimitClause, toSql).join(" "));
        }
        return result.join(" ");
    }
    const result = [];
    if (query.selectClause != undefined) {
        result.push(selectClauseToSql(query.selectClause, toSql, isDerivedTable, query.isDistinct).join(" "));
    }
    if (query.fromClause != undefined && query.fromClause.currentJoins != undefined) {
        result.push(fromClauseToSql(query.fromClause.currentJoins, toSql).join(" "));
    }
    if (query.limitClause != undefined && tm.BigIntUtil.equal(query.limitClause.maxRowCount, 0)) {
        /**
         * ```sql
         *  CREATE TABLE "myTable" ("myColumn" INT PRIMARY KEY);
         *  INSERT INTO "myTable"("myColumn") VALUES (4);
         *  SELECT
         *      COALESCE(
         *          (
         *              SELECT
         *                  "myTable"."myColumn" AS "myTable--myColumn"
         *              FROM
         *                  "myTable"
         *              LIMIT
         *                  0
         *              OFFSET
         *                  0
         *          ),
         *          3
         *      );
         * ```
         * The above gives `4` on SQLite.
         * Gives `3` on MySQL and PostgreSQL.
         * SQLite is bugged.
         *
         * The fix is to use `WHERE FALSE` when `LIMIT 0` is detected.
         *
         * ```sql
         *  CREATE TABLE "myTable" ("myColumn" INT PRIMARY KEY);
         *  INSERT INTO "myTable"("myColumn") VALUES (4);
         *  SELECT
         *      COALESCE(
         *          (
         *              SELECT
         *                  "myTable"."myColumn" AS "myTable--myColumn"
         *              FROM
         *                  "myTable"
         *              WHERE
         *                  FALSE
         *              LIMIT
         *                  0
         *              OFFSET
         *                  0
         *          ),
         *          3
         *      );
         * ```
         */
        result.push("WHERE FALSE");
    }
    else {
        if (query.whereClause != undefined) {
            result.push(whereClauseToSql(query.whereClause, toSql).join(" "));
        }
    }
    if (query.groupByClause == undefined || query.groupByClause.length == 0) {
        if (query.havingClause != undefined) {
            /**
             * Workaround for `<empty grouping set>` not supported by SQLite
             */
            throw new Error(`SQLite does not support ... GROUP BY () HAVING ...`);
            //result.push(havingClauseToSql(query.havingClause, toSql).join(" "));
        }
    }
    else {
        result.push(groupByClauseToSql(query.groupByClause, toSql).join(" "));
        if (query.havingClause != undefined) {
            result.push(havingClauseToSql(query.havingClause, toSql).join(" "));
        }
    }
    if (query.orderByClause != undefined) {
        result.push(orderByClauseToSql(query.orderByClause, toSql).join(" "));
    }
    if (query.limitClause != undefined) {
        result.push(limitClauseToSql(query.limitClause, toSql).join(" "));
    }
    if (query.compoundQueryClause != undefined) {
        result.push(compoundQueryClauseToSql(query.compoundQueryClause, toSql).join(" "));
    }
    if (query.compoundQueryOrderByClause != undefined) {
        result.push(orderByClauseToSql(query.compoundQueryOrderByClause, toSql).join(" "));
    }
    if (query.compoundQueryLimitClause != undefined) {
        result.push(limitClauseToSql(query.compoundQueryLimitClause, toSql).join(" "));
    }
    return result.join(" ");
}
exports.sqlfier = {
    identifierSqlfier: (identifierNode) => identifierNode.identifiers
        .map(squill.escapeIdentifierWithDoubleQuotes)
        .join("."),
    literalValueSqlfier: {
        [squill.LiteralValueType.DECIMAL]: ({ literalValue, precision, scale }) => squill.functionCall("decimal_ctor", [
            squill.pascalStyleEscapeString(literalValue),
            squill.escapeValue(precision),
            squill.escapeValue(scale)
        ]) /*toSql(
            castAsDecimal(
                literalValue,
                precision,
                scale
            ).ast
        )*/,
        [squill.LiteralValueType.STRING]: ({ literalValue }) => {
            if (literalValue.includes('\0')) {
                throw new Error(`String literal may not contain null characters`);
            }
            return squill.pascalStyleEscapeString(literalValue);
        },
        [squill.LiteralValueType.DOUBLE]: ({ literalValue }) => {
            if (isNaN(literalValue)) {
                throw new squill.DataOutOfRangeError({
                    message: `Literal ${literalValue} not allowed`,
                    /**
                     * @todo Figure out how to get the entire SQL, then throw?
                     */
                    sql: undefined,
                });
            }
            if (literalValue == Infinity) {
                return "(1e999)";
            }
            if (literalValue == -Infinity) {
                return "(-1e999)";
            }
            return squill.escapeValue(literalValue);
        },
        [squill.LiteralValueType.BIGINT_SIGNED]: ({ literalValue }) => squill.escapeValue(literalValue),
        /**
         * @deprecated
         */
        //[LiteralValueType.BIGINT_UNSIGNED] : ({literalValue}) => escapeValue(literalValue),
        [squill.LiteralValueType.BOOLEAN]: ({ literalValue }) => squill.escapeValue(literalValue),
        [squill.LiteralValueType.BUFFER]: ({ literalValue }) => squill.escapeValue(literalValue),
        [squill.LiteralValueType.NULL]: ({ literalValue }) => squill.escapeValue(literalValue),
        [squill.LiteralValueType.DATE_TIME]: ({ literalValue }, toSql) => toSql(squill.utcStringToTimestamp(squill.DateTimeUtil.toSqlUtc(literalValue, 3)).ast),
    },
    operatorSqlfier: {
        /*
            Comparison Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/comparison-operators.html
        */
        [squill.OperatorType.BETWEEN_AND]: ({ operands }) => [
            operands[0],
            "BETWEEN",
            operands[1],
            "AND",
            operands[2]
        ],
        [squill.OperatorType.NOT_BETWEEN_AND]: ({ operands }) => [
            operands[0],
            "NOT BETWEEN",
            operands[1],
            "AND",
            operands[2]
        ],
        [squill.OperatorType.COALESCE]: ({ operatorType, operands }) => squill.functionCall(operatorType, operands),
        [squill.OperatorType.EQUAL]: ({ operands }) => insertBetween(operands, "="),
        [squill.OperatorType.NULL_SAFE_EQUAL]: ({ operands }) => insertBetween(operands, "IS"),
        [squill.OperatorType.NOT_NULL_SAFE_EQUAL]: ({ operands }) => insertBetween(operands, "IS NOT"),
        [squill.OperatorType.LESS_THAN]: ({ operands }) => insertBetween(operands, "<"),
        [squill.OperatorType.GREATER_THAN]: ({ operands }) => insertBetween(operands, ">"),
        [squill.OperatorType.LESS_THAN_OR_EQUAL]: ({ operands }) => insertBetween(operands, "<="),
        [squill.OperatorType.GREATER_THAN_OR_EQUAL]: ({ operands }) => insertBetween(operands, ">="),
        [squill.OperatorType.IN_ARRAY]: ({ operands: [x, ...rest] }) => {
            return [
                x,
                squill.functionCall("IN", [...rest])
            ];
        },
        [squill.OperatorType.IN_QUERY]: ({ operands: [x, y] }) => {
            /**
             * https://github.com/AnyhowStep/tsql/issues/198
             */
            return [
                x,
                squill.functionCall("IN", [
                    squill.Parentheses.IsParentheses(y) ?
                        y.ast :
                        y
                ])
            ];
        },
        [squill.OperatorType.NOT_IN_ARRAY]: ({ operands: [x, ...rest] }) => {
            return [
                x,
                squill.functionCall("NOT IN", [...rest])
            ];
        },
        [squill.OperatorType.NOT_IN_QUERY]: ({ operands: [x, y] }) => {
            /**
             * https://github.com/AnyhowStep/tsql/issues/198
             */
            return [
                x,
                squill.functionCall("NOT IN", [
                    squill.Parentheses.IsParentheses(y) ?
                        y.ast :
                        y
                ])
            ];
        },
        [squill.OperatorType.IS_NOT_NULL]: ({ operands }) => [operands[0], "IS NOT NULL"],
        [squill.OperatorType.IS_NULL]: ({ operands }) => [operands[0], "IS NULL"],
        [squill.OperatorType.IS_UNKNOWN]: ({ operands }) => [operands[0], "IS NULL"],
        [squill.OperatorType.IS_NOT_UNKNOWN]: ({ operands }) => [operands[0], "IS NOT NULL"],
        [squill.OperatorType.IS_TRUE]: ({ operands }) => [operands[0], "IS TRUE"],
        [squill.OperatorType.IS_NOT_TRUE]: ({ operands }) => [operands[0], "IS NOT TRUE"],
        [squill.OperatorType.IS_FALSE]: ({ operands }) => [operands[0], "IS FALSE"],
        [squill.OperatorType.IS_NOT_FALSE]: ({ operands }) => [operands[0], "IS NOT FALSE"],
        [squill.OperatorType.LIKE_ESCAPE]: ({ operands: [expr, pattern, escapeChar] }) => {
            if (squill.LiteralValueNodeUtil.isLiteralValueNode(escapeChar) && escapeChar.literalValue === "") {
                return [
                    expr, "LIKE", pattern
                ];
            }
            else {
                return [
                    expr, "LIKE", pattern, "ESCAPE", escapeChar
                ];
            }
        },
        [squill.OperatorType.NOT_LIKE_ESCAPE]: ({ operands: [expr, pattern, escapeChar] }) => {
            if (squill.LiteralValueNodeUtil.isLiteralValueNode(escapeChar) && escapeChar.literalValue === "") {
                return [
                    expr, "NOT LIKE", pattern
                ];
            }
            else {
                return [
                    expr, "NOT LIKE", pattern, "ESCAPE", escapeChar
                ];
            }
        },
        [squill.OperatorType.NOT_EQUAL]: ({ operands }) => insertBetween(operands, "<>"),
        [squill.OperatorType.LEAST]: ({ operands }) => squill.functionCall("MIN", operands),
        [squill.OperatorType.GREATEST]: ({ operands }) => squill.functionCall("MAX", operands),
        /*
            Logical Operators
            https://dev.mysql.com/doc/refman/8.0/en/logical-operators.html
        */
        [squill.OperatorType.AND]: ({ operands }) => insertBetween(operands, "AND"),
        [squill.OperatorType.OR]: ({ operands }) => insertBetween(operands, "OR"),
        [squill.OperatorType.NOT]: ({ operands }) => [
            "NOT",
            operands[0]
        ],
        [squill.OperatorType.XOR]: ({ operands }) => insertBetween(operands, "<>"),
        /*
            Control Flow Functions
            https://dev.mysql.com/doc/refman/8.0/en/control-flow-functions.html
        */
        [squill.OperatorType.IF]: ({ operands: [a, b, c] }) => [
            "CASE WHEN",
            a,
            "THEN",
            b,
            "ELSE",
            c,
            "END"
        ],
        [squill.OperatorType.IF_NULL]: ({ operands }) => squill.functionCall("IFNULL", operands),
        [squill.OperatorType.NULL_IF_EQUAL]: ({ operands }) => squill.functionCall("NULLIF", operands),
        /*
            String Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/string-functions.html
        */
        [squill.OperatorType.ASCII]: ({ operands }) => squill.functionCall("ASCII", operands),
        [squill.OperatorType.BIN]: ({ operands }) => squill.functionCall("BIN", operands),
        [squill.OperatorType.BIT_LENGTH]: ({ operands }) => ([
            squill.functionCall("LENGTH", [
                squill.functionCall("CAST", [[operands, "AS BLOB"]])
            ]),
            "* 8"
        ]),
        [squill.OperatorType.CHAR_LENGTH]: ({ operands }) => squill.functionCall("LENGTH", operands),
        [squill.OperatorType.OCTET_LENGTH]: ({ operands }) => squill.functionCall("LENGTH", [
            squill.functionCall("CAST", [[operands, "AS BLOB"]])
        ]),
        [squill.OperatorType.CONCAT]: ({ operands }) => insertBetween(operands, "||"),
        [squill.OperatorType.NULL_SAFE_CONCAT]: ({ operands }) => (insertBetween(operands.map(operand => squill.functionCall("COALESCE", [operand, "''"])), "||")),
        [squill.OperatorType.CONCAT_WS]: ({ operands }) => squill.functionCall("CONCAT_WS", operands),
        [squill.OperatorType.FROM_BASE64]: ({ operands }) => squill.functionCall("FROM_BASE64", operands),
        [squill.OperatorType.HEX]: ({ operands }) => squill.functionCall("HEX", operands),
        [squill.OperatorType.IN_STR]: ({ operands }) => squill.functionCall("INSTR", operands),
        [squill.OperatorType.LPAD]: ({ operands }) => squill.functionCall("LPAD", operands),
        [squill.OperatorType.RPAD]: ({ operands }) => squill.functionCall("RPAD", operands),
        [squill.OperatorType.LTRIM]: ({ operands }) => squill.functionCall("LTRIM", operands),
        [squill.OperatorType.RTRIM]: ({ operands }) => squill.functionCall("RTRIM", operands),
        [squill.OperatorType.TRIM]: ({ operands }) => squill.functionCall("TRIM", operands),
        [squill.OperatorType.POSITION]: ({ operands }) => squill.functionCall("INSTR", [operands[1], operands[0]]),
        [squill.OperatorType.REPEAT]: ({ operands }) => squill.functionCall("REPEAT", operands),
        [squill.OperatorType.REPLACE]: ({ operands }) => squill.functionCall("REPLACE", operands),
        [squill.OperatorType.REVERSE]: ({ operands }) => squill.functionCall("REVERSE", operands),
        [squill.OperatorType.TO_BASE64]: ({ operands }) => squill.functionCall("TO_BASE64", operands),
        [squill.OperatorType.UNHEX]: ({ operands }) => squill.functionCall("UNHEX", operands),
        [squill.OperatorType.UPPER]: ({ operands }) => squill.functionCall("UPPER", operands),
        [squill.OperatorType.LOWER]: ({ operands }) => squill.functionCall("LOWER", operands),
        /*
            Arithmetic Operators
            https://dev.mysql.com/doc/refman/8.0/en/arithmetic-functions.html
        */
        [squill.OperatorType.FRACTIONAL_DIVISION]: ({ operands }) => insertBetween(operands, "/"),
        [squill.OperatorType.INTEGER_DIVISION]: ({ operands, typeHint }) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                return squill.functionCall("CAST", [
                    [
                        insertBetween(operands, "/"),
                        "AS BIGINT"
                    ]
                ]);
            }
            else if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_div", operands);
            }
            else {
                throw new Error(`INTEGER_DIVISION not implemented for ${typeHint}`);
            }
        },
        /**
         * In SQLite, `%` ONLY does integer remainder
         */
        [squill.OperatorType.INTEGER_REMAINDER]: ({ operands, typeHint }, toSql) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                return squill.functionCall("CAST", [
                    toSql(insertBetween(operands.map(op => squill.functionCall("CAST", [
                        toSql(op) + " AS INTEGER"
                    ])), "%")) + " AS DOUBLE"
                ]);
            }
            else if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return insertBetween(operands, "%");
            }
            else {
                throw new Error(`INTEGER_REMAINDER not implemented for ${typeHint}`);
            }
        },
        [squill.OperatorType.FRACTIONAL_REMAINDER]: ({ operands, typeHint }) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                function naiveFractionalRemainder(dividend, divisor) {
                    const absDivisor = squill.functionCall("ABS", [divisor]);
                    return squill.parentheses([
                        dividend,
                        "-",
                        squill.functionCall("FLOOR", [
                            [
                                dividend,
                                "/",
                                absDivisor
                            ]
                        ]),
                        "*",
                        absDivisor
                    ], false);
                }
                const dividend = operands[0];
                const divisor = operands[1];
                return [
                    "CASE",
                    "WHEN", dividend, "= 1e999 THEN NULL",
                    "WHEN", dividend, "= -1e999 THEN NULL",
                    "WHEN", divisor, "= 1e999 THEN",
                    dividend,
                    "WHEN", divisor, "= -1e999 THEN",
                    dividend,
                    "WHEN", dividend, ">= 0 THEN", naiveFractionalRemainder(dividend, divisor),
                    "ELSE",
                    "-", naiveFractionalRemainder(squill.parentheses(["-", dividend], false), divisor),
                    "END"
                ];
            }
            else {
                throw new Error(`FRACTIONAL_REMAINDER not implemented for ${typeHint}`);
            }
        },
        [squill.OperatorType.ADDITION]: ({ operands, typeHint }) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_add", operands);
            }
            else {
                return squill.functionCall("COALESCE", [
                    insertBetween(operands, "+"),
                    exports.THROW_AST
                ]);
            }
        },
        [squill.OperatorType.SUBTRACTION]: ({ operands, typeHint }) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_sub", operands);
            }
            else {
                return squill.functionCall("COALESCE", [
                    insertBetween(operands, "-"),
                    exports.THROW_AST
                ]);
            }
        },
        [squill.OperatorType.MULTIPLICATION]: ({ operands, typeHint }) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_mul", operands);
            }
            else {
                return squill.functionCall("COALESCE", [
                    insertBetween(operands, "*"),
                    exports.THROW_AST
                ]);
            }
        },
        [squill.OperatorType.UNARY_MINUS]: ({ operands, typeHint }) => {
            if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("bigint_neg", operands);
            }
            else {
                return ["-", operands[0]];
            }
        },
        /*
            Mathematical Functions
            https://dev.mysql.com/doc/refman/8.0/en/mathematical-functions.html
        */
        [squill.OperatorType.ABSOLUTE_VALUE]: ({ operands }) => squill.functionCall("ABS", operands),
        [squill.OperatorType.ARC_COSINE]: ({ operands }) => squill.functionCall("ACOS", operands),
        [squill.OperatorType.ARC_SINE]: ({ operands }) => squill.functionCall("ASIN", operands),
        [squill.OperatorType.ARC_TANGENT]: ({ operands }) => squill.functionCall("ATAN", operands),
        [squill.OperatorType.ARC_TANGENT_2]: ({ operands }) => squill.functionCall("ATAN2", operands),
        [squill.OperatorType.CUBE_ROOT]: ({ operands }) => squill.functionCall("CBRT", operands),
        [squill.OperatorType.CEILING]: ({ operands }) => squill.functionCall("CEILING", operands),
        [squill.OperatorType.COSINE]: ({ operands }) => squill.functionCall("COS", operands),
        [squill.OperatorType.COTANGENT]: ({ operands }) => squill.functionCall("COT", operands),
        [squill.OperatorType.DEGREES]: ({ operands }) => [operands[0], "* (180.0/3.141592653589793)"],
        [squill.OperatorType.NATURAL_EXPONENTIATION]: ({ operands }) => squill.functionCall("EXP", operands),
        [squill.OperatorType.FLOOR]: ({ operands }) => squill.functionCall("FLOOR", operands),
        [squill.OperatorType.LN]: ({ operands }) => squill.functionCall("LN", operands),
        [squill.OperatorType.LOG]: ({ operands }) => squill.functionCall("LOG", operands),
        [squill.OperatorType.LOG2]: ({ operands }) => squill.functionCall("LOG2", operands),
        [squill.OperatorType.LOG10]: ({ operands }) => squill.functionCall("LOG10", operands),
        [squill.OperatorType.PI]: () => squill.functionCall("PI", []),
        [squill.OperatorType.POWER]: ({ operands }) => squill.functionCall("POWER", operands),
        [squill.OperatorType.RADIANS]: ({ operands }) => [operands[0], "* (3.141592653589793/180.0)"],
        [squill.OperatorType.RANDOM]: ({ operands, typeHint }) => {
            if (typeHint == squill.TypeHint.DOUBLE) {
                return squill.functionCall("FRANDOM", operands);
            }
            else if (typeHint == squill.TypeHint.BIGINT_SIGNED) {
                return squill.functionCall("RANDOM", operands);
            }
            else {
                throw new Error(`RANDOM not implemented for ${typeHint}`);
            }
        },
        //[squill.OperatorType.ROUND] : ({operands}) => squill.functionCall("ROUND", operands),
        [squill.OperatorType.SIGN]: ({ operands }) => squill.functionCall("SIGN", operands),
        [squill.OperatorType.SINE]: ({ operands }) => squill.functionCall("SIN", operands),
        [squill.OperatorType.SQUARE_ROOT]: ({ operands }) => squill.functionCall("SQRT", operands),
        [squill.OperatorType.TANGENT]: ({ operands }) => squill.functionCall("TAN", operands),
        //[squill.OperatorType.TRUNCATE] : ({operands}) => squill.functionCall("TRUNCATE", operands),
        /*
            Date and Time Functions
            https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html
        */
        [squill.OperatorType.CURRENT_DATE]: () => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d"),
            squill.pascalStyleEscapeString("now")
        ]),
        [squill.OperatorType.CURRENT_TIMESTAMP_0]: () => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%S"),
            squill.pascalStyleEscapeString("now")
        ]),
        [squill.OperatorType.CURRENT_TIMESTAMP_1]: () => squill.functionCall("substr", [
            squill.functionCall("strftime", [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                squill.pascalStyleEscapeString("now")
            ]),
            "1",
            "21"
        ]),
        [squill.OperatorType.CURRENT_TIMESTAMP_2]: () => squill.functionCall("substr", [
            squill.functionCall("strftime", [
                squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                squill.pascalStyleEscapeString("now")
            ]),
            "1",
            "22"
        ]),
        [squill.OperatorType.CURRENT_TIMESTAMP_3]: () => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            squill.pascalStyleEscapeString("now")
        ]),
        [squill.OperatorType.EXTRACT_YEAR]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%Y"),
                    operands[0]
                ]),
                "AS BIGINT"
            ]
        ]),
        [squill.OperatorType.EXTRACT_MONTH]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%m"),
                    operands[0]
                ]),
                "AS BIGINT"
            ]
        ]),
        [squill.OperatorType.EXTRACT_DAY]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%d"),
                    operands[0]
                ]),
                "AS BIGINT"
            ]
        ]),
        [squill.OperatorType.EXTRACT_HOUR]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%H"),
                    operands[0]
                ]),
                "AS BIGINT"
            ]
        ]),
        [squill.OperatorType.EXTRACT_MINUTE]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%M"),
                    operands[0]
                ]),
                "AS BIGINT"
            ]
        ]),
        [squill.OperatorType.EXTRACT_INTEGER_SECOND]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%S"),
                    operands[0]
                ]),
                "AS BIGINT"
            ]
        ]),
        [squill.OperatorType.EXTRACT_FRACTIONAL_SECOND_3]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%f"),
                    operands[0]
                ]),
                "AS DOUBLE"
            ]
        ]),
        [squill.OperatorType.LAST_DAY]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d"),
            operands[0],
            squill.pascalStyleEscapeString("+1 month"),
            [
                squill.pascalStyleEscapeString("-"),
                "||",
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%d"),
                    operands[0]
                ]),
                "||",
                squill.pascalStyleEscapeString(" day")
            ]
        ]),
        [squill.OperatorType.TIMESTAMPADD_YEAR]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            operands[1],
            [
                operands[0],
                "||",
                squill.pascalStyleEscapeString(" year")
            ]
        ]),
        /**
         * @todo Just use a polyfill, rather than trying to emulate with SQLite built-ins.
         * Seriously. But, for now, this actually works, which surprises me.
         */
        [squill.OperatorType.TIMESTAMPADD_MONTH]: ({ operands }, toSql, sqlfier) => {
            /*
                The following gives SQLite's and JS' understanding of what
                "adding months" means. However, it is different from what
                MySQL understands as "adding months".

                Since the function is named for MySQL's `TIMESTAMPADD()`,
                we follow MySQL's convention, and emultate MySQL's behaviour.

                squill.functionCall(
                    "strftime",
                    [
                        squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
                        operands[1],
                        [
                            operands[0],
                            "||",
                            squill.pascalStyleEscapeString(" month")
                        ]
                    ]
                )
            */
            const rawDeltaMonth = operands[0];
            const dateTime = operands[1];
            const curYear = sqlfier.operatorSqlfier[squill.OperatorType.EXTRACT_YEAR](squill.OperatorNodeUtil.operatorNode1(squill.OperatorType.EXTRACT_YEAR, [dateTime], squill.TypeHint.DATE_TIME), toSql, sqlfier);
            const curMonth = sqlfier.operatorSqlfier[squill.OperatorType.EXTRACT_MONTH](squill.OperatorNodeUtil.operatorNode1(squill.OperatorType.EXTRACT_MONTH, [dateTime], squill.TypeHint.DATE_TIME), toSql, sqlfier);
            const curDay = sqlfier.operatorSqlfier[squill.OperatorType.EXTRACT_DAY](squill.OperatorNodeUtil.operatorNode1(squill.OperatorType.EXTRACT_DAY, [dateTime], squill.TypeHint.DATE_TIME), toSql, sqlfier);
            const curTimeComponent = squill.functionCall("strftime", [
                squill.pascalStyleEscapeString(" %H:%M:%f"),
                dateTime
            ]);
            function lastDay(year, month) {
                return squill.parentheses([
                    "CASE",
                    "WHEN", month, "= 2 THEN (CASE WHEN", year, "%4 = 0 THEN 29 ELSE 28 END)",
                    "WHEN", month, "IN(1,3,5,7,8,10,12) THEN 31",
                    "ELSE 30",
                    "END"
                ], false);
            }
            function setYearMonth(resultYear, resultMonth) {
                const lastDayOfResult = lastDay(resultYear, resultMonth);
                const lastDayOfAdd = squill.parentheses(["CASE WHEN", curDay, ">", lastDayOfResult, "THEN", lastDayOfResult, "ELSE", curDay, "END"], false);
                /**
                 * @todo Instead of `LPAD()`, use this?
                 * https://stackoverflow.com/a/9603175
                 */
                return [
                    squill.functionCall("LPAD", [squill.functionCall("CAST", [[resultYear, "AS TEXT"]]), "4", "'0'"]),
                    "|| '-' ||",
                    squill.functionCall("LPAD", [squill.functionCall("CAST", [[resultMonth, "AS TEXT"]]), "2", "'0'"]),
                    "|| '-' ||",
                    squill.functionCall("LPAD", [squill.functionCall("CAST", [[lastDayOfAdd, "AS TEXT"]]), "2", "'0'"]),
                    "||",
                    curTimeComponent
                ];
            }
            const monthsSince_0000_01 = squill.parentheses([curYear, "* 12 + (", curMonth, "-1) +", rawDeltaMonth], false);
            const resultYear = squill.functionCall("FLOOR", [[monthsSince_0000_01, "/12"]]);
            const resultMonth = squill.parentheses([monthsSince_0000_01, "%12 + 1"], false);
            return [
                "CASE",
                "WHEN", monthsSince_0000_01, "BETWEEN 0 AND 119999 THEN", setYearMonth(resultYear, resultMonth),
                "ELSE NULL",
                "END"
            ];
        },
        [squill.OperatorType.TIMESTAMPADD_DAY]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            operands[1],
            insertBetween([
                operands[0],
                squill.pascalStyleEscapeString(" day")
            ], "||")
        ]),
        [squill.OperatorType.TIMESTAMPADD_HOUR]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            operands[1],
            insertBetween([
                operands[0],
                squill.pascalStyleEscapeString(" hour")
            ], "||")
        ]),
        [squill.OperatorType.TIMESTAMPADD_MINUTE]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            operands[1],
            insertBetween([
                operands[0],
                squill.pascalStyleEscapeString(" minute")
            ], "||")
        ]),
        [squill.OperatorType.TIMESTAMPADD_SECOND]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            operands[1],
            insertBetween([
                operands[0],
                squill.pascalStyleEscapeString(" second")
            ], "||")
        ]),
        [squill.OperatorType.TIMESTAMPADD_MILLISECOND]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            operands[1],
            insertBetween([
                squill.parentheses(insertBetween([
                    operands[0],
                    "1000e0"
                ], "/"), 
                //canUnwrap
                false),
                squill.pascalStyleEscapeString(" second")
            ], "||")
        ]),
        [squill.OperatorType.TIMESTAMPDIFF_DAY]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%J"),
                    operands[1]
                ]),
                "-",
                squill.functionCall("strftime", [
                    squill.pascalStyleEscapeString("%J"),
                    operands[0]
                ]),
                "AS BIGINT"
            ]
        ]),
        [squill.OperatorType.TIMESTAMPDIFF_HOUR]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.parentheses([
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        operands[1]
                    ]),
                    "-",
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        operands[0]
                    ])
                ], false),
                "* 24 AS BIGINT"
            ]
        ]),
        [squill.OperatorType.TIMESTAMPDIFF_MINUTE]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.parentheses([
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        operands[1]
                    ]),
                    "-",
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        operands[0]
                    ])
                ], false),
                "* 24 * 60 AS BIGINT"
            ]
        ]),
        [squill.OperatorType.TIMESTAMPDIFF_SECOND]: ({ operands }) => squill.functionCall("CAST", [
            [
                squill.parentheses([
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        operands[1]
                    ]),
                    "-",
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        operands[0]
                    ])
                ], false),
                "* 24 * 60 * 60 AS BIGINT"
            ]
        ]),
        [squill.OperatorType.TIMESTAMPDIFF_MILLISECOND]: ({ operands }) => {
            /*
                This naive implementation suffers from precision problems,
                squill.functionCall(
                    "CAST",
                    [
                        [
                            squill.parentheses(
                                [
                                    squill.functionCall(
                                        "strftime",
                                        [
                                            squill.pascalStyleEscapeString("%J"),
                                            operands[1]
                                        ]
                                    ),
                                    "-",
                                    squill.functionCall(
                                        "strftime",
                                        [
                                            squill.pascalStyleEscapeString("%J"),
                                            operands[0]
                                        ]
                                    )
                                ],
                                false
                            ),
                            "* 24 * 60 * 60 * 1000 AS BIGINT"
                        ]
                    ]
                )
            */
            function castAsBigInt(x) {
                return squill.functionCall("CAST", [[x, "AS BIGINT"]]);
            }
            const diffDate = [
                squill.parentheses([
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        squill.functionCall("strftime", [
                            squill.pascalStyleEscapeString("%Y-%m-%d"),
                            operands[1]
                        ])
                    ]),
                    "-",
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%J"),
                        squill.functionCall("strftime", [
                            squill.pascalStyleEscapeString("%Y-%m-%d"),
                            operands[0]
                        ])
                    ])
                ], false),
                "* 24 * 60 * 60 * 1000"
            ];
            const diffHour = [
                squill.parentheses([
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%H"),
                        operands[1]
                    ]),
                    "-",
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%H"),
                        operands[0]
                    ])
                ], false),
                "* 60 * 60 * 1000"
            ];
            const diffMinute = [
                squill.parentheses([
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%M"),
                        operands[1]
                    ]),
                    "-",
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%M"),
                        operands[0]
                    ])
                ], false),
                "* 60 * 1000"
            ];
            const diffSecond = [
                squill.parentheses([
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%S"),
                        operands[1]
                    ]),
                    "-",
                    squill.functionCall("strftime", [
                        squill.pascalStyleEscapeString("%S"),
                        operands[0]
                    ])
                ], false),
                "* 1000"
            ];
            const diffMillisecond = [
                squill.parentheses([
                    squill.functionCall("substr", [
                        squill.functionCall("strftime", [
                            squill.pascalStyleEscapeString("%f"),
                            operands[1]
                        ]),
                        "4"
                    ]),
                    "-",
                    squill.functionCall("substr", [
                        squill.functionCall("strftime", [
                            squill.pascalStyleEscapeString("%f"),
                            operands[0]
                        ]),
                        "4"
                    ])
                ], false)
            ];
            return castAsBigInt(insertBetween([
                diffDate,
                diffHour,
                diffMinute,
                diffSecond,
                diffMillisecond
            ], "+"));
        },
        [squill.OperatorType.UTC_STRING_TO_TIMESTAMP_CONSTRUCTOR]: ({ operands }) => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%Y-%m-%d %H:%M:%f"),
            operands[0]
        ]),
        [squill.OperatorType.UNIX_TIMESTAMP_NOW]: () => squill.functionCall("strftime", [
            squill.pascalStyleEscapeString("%s"),
            squill.pascalStyleEscapeString("now")
        ]),
        /*
            Cast Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/cast-functions.html
        */
        [squill.OperatorType.CAST_AS_DECIMAL]: ({ operands: [arg, precision, scale] }) => squill.functionCall("decimal_ctor", [
            arg,
            precision,
            scale
        ]) /*functionCall(
            "CAST",
            [
                toSql(arg) + `AS DECIMAL(${toSql(precision)}, ${toSql(scale)})`
            ]
        )*/,
        [squill.OperatorType.CAST_AS_DOUBLE]: ({ operands }, toSql) => squill.functionCall("CAST", [`${toSql(operands)} AS DOUBLE`]),
        [squill.OperatorType.CAST_AS_BIGINT_SIGNED]: ({ operands }, toSql) => squill.functionCall("CAST", [`${toSql(operands)} AS BIGINT`]),
        [squill.OperatorType.CAST_AS_BINARY]: ({ operands }) => squill.functionCall("CAST", [[operands[0], `AS BLOB`]]),
        [squill.OperatorType.CAST_AS_VARCHAR]: ({ operands }) => squill.functionCall("CAST", [[operands[0], `AS VARCHAR`]]),
        [squill.OperatorType.CAST_AS_JSON]: ({ operands }) => squill.functionCall("CAST", [[operands[0], `AS TEXT`]]),
        /*
            Bit Functions and Operators
            https://dev.mysql.com/doc/refman/8.0/en/bit-functions.html
        */
        [squill.OperatorType.BITWISE_AND]: ({ operands }) => insertBetween(operands, "&"),
        [squill.OperatorType.BITWISE_OR]: ({ operands }) => insertBetween(operands, "|"),
        [squill.OperatorType.BITWISE_XOR]: ({ operands }) => [
            ["~", squill.parentheses(insertBetween(operands, "&"), false)],
            "&",
            squill.parentheses(insertBetween(operands, "|"), false)
        ],
        [squill.OperatorType.BITWISE_NOT]: ({ operands }) => ["~", operands],
        [squill.OperatorType.BITWISE_LEFT_SHIFT]: ({ operands }) => insertBetween(operands, "<<"),
        [squill.OperatorType.BITWISE_RIGHT_SHIFT]: ({ operands }) => insertBetween(operands, ">>"),
        /*
            Aggregate (GROUP BY) Function Descriptions
            https://dev.mysql.com/doc/refman/8.0/en/group-by-functions.html
        */
        [squill.OperatorType.AGGREGATE_COUNT_ALL]: () => squill.functionCall("COUNT", ["*"]),
        [squill.OperatorType.AGGREGATE_COUNT_EXPR]: ({ operands, operatorType }) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true) {
                    return squill.functionCall("COUNT", [["DISTINCT", expr]]);
                }
                else {
                    return squill.functionCall("COUNT", [expr]);
                }
            }
            else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_AVERAGE]: ({ operands, operatorType }) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true) {
                    return squill.functionCall("AVG", [["DISTINCT", expr]]);
                }
                else {
                    return squill.functionCall("AVG", [expr]);
                }
            }
            else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_MAX]: ({ operands }) => {
            return squill.functionCall("MAX", operands);
        },
        [squill.OperatorType.AGGREGATE_MIN]: ({ operands }) => {
            return squill.functionCall("MIN", operands);
        },
        [squill.OperatorType.AGGREGATE_SUM]: ({ operands, operatorType }) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true) {
                    return squill.functionCall("SUM", [["DISTINCT", expr]]);
                }
                else {
                    return squill.functionCall("SUM", [expr]);
                }
            }
            else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_SUM_AS_BIGINT_SIGNED]: ({ operands, operatorType }) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true) {
                    return squill.functionCall("SUM", [["DISTINCT", expr]]);
                }
                else {
                    return squill.functionCall("SUM", [expr]);
                }
            }
            else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_SUM_AS_DECIMAL]: ({ operands, operatorType }) => {
            if (operands.length == 2) {
                const [isDistinct, expr] = operands;
                if (squill.LiteralValueNodeUtil.isLiteralValueNode(isDistinct) &&
                    isDistinct.literalValue === true) {
                    return squill.functionCall("SUM", [
                        [
                            "DISTINCT",
                            //@todo
                            squill.functionCall("CAST", [
                                [expr, "AS REAL"]
                            ])
                        ]
                    ]);
                }
                else {
                    return squill.functionCall("SUM", [
                        //@todo
                        squill.functionCall("CAST", [
                            [expr, "AS REAL"]
                        ])
                    ]);
                }
            }
            else {
                throw new Error(`${operatorType} only implemented for 2 args`);
            }
        },
        [squill.OperatorType.AGGREGATE_GROUP_CONCAT_DISTINCT]: ({ operands }) => squill.functionCall("GROUP_CONCAT", [
            ["DISTINCT", operands[0]]
        ]),
        [squill.OperatorType.AGGREGATE_GROUP_CONCAT_ALL]: ({ operands }) => squill.functionCall("GROUP_CONCAT", operands),
        [squill.OperatorType.AGGREGATE_POPULATION_STANDARD_DEVIATION]: ({ operands }) => {
            return squill.functionCall("STDDEV_POP", operands);
        },
        [squill.OperatorType.AGGREGATE_SAMPLE_STANDARD_DEVIATION]: ({ operands }) => {
            return squill.functionCall("STDDEV_SAMP", operands);
        },
        [squill.OperatorType.AGGREGATE_POPULATION_VARIANCE]: ({ operands }) => {
            return squill.functionCall("VAR_POP", operands);
        },
        [squill.OperatorType.AGGREGATE_SAMPLE_VARIANCE]: ({ operands }) => {
            return squill.functionCall("VAR_SAMP", operands);
        },
        [squill.OperatorType.EXISTS]: ({ operands: [query] }, toSql) => {
            if (squill.QueryBaseUtil.isAfterFromClause(query)) {
                //EXISTS(... FROM table)
                if (squill.QueryBaseUtil.isAfterSelectClause(query)) {
                    //EXISTS(SELECT x FROM table)
                    return squill.functionCall("EXISTS", [query]);
                }
                else {
                    //EXISTS(FROM table)
                    return squill.functionCall("EXISTS", [
                        "SELECT 1 " + toSql(query)
                    ]);
                }
            }
            else {
                if (squill.QueryBaseUtil.isAfterSelectClause(query)) {
                    //EXISTS(SELECT x)
                    return squill.functionCall("EXISTS", [query]);
                }
                else {
                    throw new Error(`Query should have either FROM or SELECT clause`);
                }
            }
        },
        /*
            https://dev.mysql.com/doc/refman/5.7/en/information-functions.html

            Information Functions
        */
        [squill.OperatorType.CURRENT_SCHEMA]: () => squill.pascalStyleEscapeString(constants_1.DEFAULT_SCHEMA_NAME),
        [squill.OperatorType.CURRENT_USER]: () => "NULL",
        /*
            Custom library functions

            These functions are not standard SQL,
            but can be implemented using standard SQL.
        */
        [squill.OperatorType.THROW_IF_NULL]: ({ operands: [arg] }) => {
            return squill.functionCall("COALESCE", [
                arg,
                exports.THROW_AST
            ]);
        },
    },
    queryBaseSqlfier: (rawQuery, toSql) => {
        const sql = queryToSql(rawQuery, toSql, false);
        //console.log(sql);
        return sql;
    },
    caseValueSqlfier: (node) => {
        const result = [
            "CASE", node.value,
        ];
        for (const [compareValue, thenResult] of node.cases) {
            result.push(["WHEN", compareValue, "THEN", thenResult]);
        }
        if (node.else != undefined) {
            result.push(["ELSE", node.else]);
        }
        result.push("END");
        return result;
    },
    caseConditionSqlfier: (node) => {
        const result = [
            "CASE"
        ];
        for (const [condition, thenResult] of node.branches) {
            result.push(["WHEN", condition, "THEN", thenResult]);
        }
        if (node.else != undefined) {
            result.push(["ELSE", node.else]);
        }
        result.push("END");
        return result;
    }
};
//# sourceMappingURL=sqlfier.js.map

/***/ }),

/***/ "./dist/driver/sqlfier/update-sql-string.js":
/*!**************************************************!*\
  !*** ./dist/driver/sqlfier/update-sql-string.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const squill = __webpack_require__(/*! @squill/squill */ "./node_modules/@squill/squill/dist/index.js");
const sqlfier_1 = __webpack_require__(/*! ./sqlfier */ "./dist/driver/sqlfier/sqlfier.js");
function updateSqlString(table, whereClause, assignmentMap) {
    const mutableColumnAlias = Object.keys(assignmentMap)
        .filter(columnAlias => {
        const value = assignmentMap[columnAlias];
        return (value !== undefined &&
            table.mutableColumns.indexOf(columnAlias) >= 0);
    })
        .sort();
    if (mutableColumnAlias.length == 0) {
        //Empty assignment list...
        return undefined;
    }
    const assignmentList = mutableColumnAlias.reduce((ast, columnAlias) => {
        const value = assignmentMap[columnAlias];
        const assignment = [
            squill.escapeIdentifierWithDoubleQuotes(columnAlias),
            "=",
            squill.BuiltInExprUtil.buildAst(value)
        ];
        if (ast.length > 0) {
            ast.push(",");
        }
        ast.push(assignment);
        return ast;
    }, []);
    const ast = [
        "UPDATE",
        table.unaliasedAst,
        "SET",
        ...assignmentList,
        "WHERE",
        whereClause.ast
    ];
    const sql = squill.AstUtil.toSql(ast, sqlfier_1.sqlfier);
    return sql;
}
exports.updateSqlString = updateSqlString;
//# sourceMappingURL=update-sql-string.js.map

/***/ }),

/***/ "./dist/driver/worker.js":
/*!*******************************!*\
  !*** ./dist/driver/worker.js ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SqliteAction;
(function (SqliteAction) {
    SqliteAction["OPEN"] = "OPEN";
    SqliteAction["EXEC"] = "EXEC";
    SqliteAction["EXPORT"] = "EXPORT";
    SqliteAction["CLOSE"] = "CLOSE";
    SqliteAction["CREATE_GLOBAL_JS_FUNCTION"] = "CREATE_GLOBAL_JS_FUNCTION";
    SqliteAction["CREATE_FUNCTION"] = "CREATE_FUNCTION";
    SqliteAction["CREATE_AGGREGATE"] = "CREATE_AGGREGATE";
})(SqliteAction = exports.SqliteAction || (exports.SqliteAction = {}));
class SqliteWorker {
    constructor(rawWorker) {
        this.onResult = (data) => {
            if (this.onmessage == undefined) {
                return;
            }
            this.onmessage({ data });
        };
        this.processMessage = rawWorker.postMessage;
        rawWorker.setOnMessage(this.onResult);
    }
    postMessage(message) {
        this.processMessage(message);
    }
}
exports.SqliteWorker = SqliteWorker;
//# sourceMappingURL=worker.js.map

/***/ }),

/***/ "./test-browser/src/index.ts":
/*!***********************************!*\
  !*** ./test-browser/src/index.ts ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3 = __webpack_require__(/*! ../../dist/driver */ "./dist/driver/index.js");
const worker = new Worker("worker-browser.js");
const sqlite3Worker = new sqlite3.SqliteWorker({
    postMessage: worker.postMessage.bind(worker),
    setOnMessage: (onMessage) => {
        worker.onmessage = (event) => {
            onMessage(event.data);
            if (event.data.action == sqlite3.SqliteAction.CLOSE) {
                worker.terminate();
            }
        };
    },
});
const pool = new sqlite3.Pool(sqlite3Worker);
window.rawQuery = (sqlString) => pool.acquire(connection => connection.rawQuery(sqlString));
window.exec = (sqlString) => pool.acquire(connection => connection.exec(sqlString));
window.exportDb = () => pool.acquire(connection => connection.export());
window.importDb = (dbFile) => pool.acquire(connection => connection.open(dbFile));


/***/ })

/******/ });
//# sourceMappingURL=index.js.map