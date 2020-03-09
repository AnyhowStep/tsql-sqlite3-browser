import * as tape from "tape";
import {unifiedTest, UnifiedSchema} from "@squill/squill/unified-test";
import * as tsql from "@squill/squill";
import * as sqlite3 from "../../../../dist/driver";
import * as worker from "worker_threads";

const myWorker = new worker.Worker(
    typeof BigInt(0) == "bigint" ?
    `${__dirname}/../../../../dist/worker/worker-node.js` :
    `${__dirname}/../../../../dist/worker/worker-node-force-bigint-polyfill.js`
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

unifiedTest({
    pool,
    tape,
    createTemporarySchema : async (
        connection : tsql.IConnection,
        schema : UnifiedSchema
    ) : Promise<void> => {
        for (const table of schema.tables) {
            const tableSql : string[] = [
                `CREATE TABLE ${tsql.escapeIdentifierWithDoubleQuotes(table.tableAlias)} (`
            ];

            let firstColumn = true;
            for (const column of table.columns) {
                const columnSql : string[] = [tsql.escapeIdentifierWithDoubleQuotes(column.columnAlias)];

                switch (column.dataType.typeHint) {
                    case tsql.TypeHint.BIGINT_SIGNED: {
                        /**
                         * `INT` and `INTEGER` mean different things in SQLite
                         */
                        if (
                            table.primaryKey != undefined &&
                            !table.primaryKey.multiColumn &&
                            table.primaryKey.autoIncrement &&
                            table.primaryKey.columnAlias == column.columnAlias
                        ) {
                            columnSql.push("INTEGER");
                        } else {
                            columnSql.push("INT");
                        }
                        break;
                    }
                    case tsql.TypeHint.BOOLEAN: {
                        columnSql.push("BOOLEAN");
                        break;
                    }
                    case tsql.TypeHint.BUFFER: {
                        columnSql.push("BLOB");
                        break;
                    }
                    case tsql.TypeHint.DATE_TIME: {
                        columnSql.push("DATETIME(3)");
                        break;
                    }
                    case tsql.TypeHint.DECIMAL: {
                        /**
                         * Using numeric will cause SQLite to cast DECIMAL strings
                         * into `double` and lose precision, when stored on disk.
                         *
                         * @todo Document this, when implementing "emulated DECIMAL" support proper.
                         */
                        //columnSql.push("NUMERIC");
                        columnSql.push("TEXT");
                        break;
                    }
                    case tsql.TypeHint.DOUBLE: {
                        columnSql.push("DOUBLE");
                        break;
                    }
                    case tsql.TypeHint.STRING: {
                        columnSql.push("TEXT");
                        break;
                    }
                }

                if (column.nullable !== true) {
                    columnSql.push("NOT NULL");
                }

                if (
                    table.primaryKey != undefined &&
                    !table.primaryKey.multiColumn &&
                    table.primaryKey.columnAlias == column.columnAlias
                ) {
                    if (table.primaryKey.autoIncrement) {
                        columnSql.push("PRIMARY KEY AUTOINCREMENT");
                    } else {
                        columnSql.push("PRIMARY KEY");
                    }
                }

                if (column.default != undefined) {
                    columnSql.push("DEFAULT");
                    columnSql.push(tsql.AstUtil.toSql(
                        tsql.BuiltInExprUtil.buildAst(column.default),
                        sqlite3.sqlfier
                    ));
                }

                if (!firstColumn) {
                    tableSql.push(", ");
                }
                firstColumn = false;
                tableSql.push(columnSql.join(" "));
            }

            if (
                table.primaryKey != undefined &&
                table.primaryKey.multiColumn
            ) {
                const columnAliases = table.primaryKey.columnAliases
                    .map(columnAlias => {
                        return tsql.escapeIdentifierWithDoubleQuotes(columnAlias);
                    })
                    .join(", ");
                tableSql.push(`, PRIMARY KEY (${columnAliases})`);
            }

            if (table.candidateKeys != undefined) {
                for (const candidateKey of table.candidateKeys) {
                    const keyStr = candidateKey
                        .map(columnAlias => tsql.escapeIdentifierWithDoubleQuotes(columnAlias))
                        .join(", ");
                    tableSql.push(`, UNIQUE(${keyStr})`);
                }
            }

            tableSql.push(");");

            await connection.rawQuery(`DROP TABLE IF EXISTS ${tsql.escapeIdentifierWithDoubleQuotes(table.tableAlias)}`);
            await connection.rawQuery(tableSql.join(" "));
        }
    },
    fileNameLike : process.env.FILE_NAME_LIKE,
});
