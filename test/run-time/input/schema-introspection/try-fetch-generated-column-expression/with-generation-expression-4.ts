import {poolTest} from "../../pool-test";
import * as sqlite3 from "../../../../../dist/driver";

poolTest(__filename, async (t, pool) => {
    await pool.acquire(async (connection) => {
        await connection.exec(`
            CREATE TABLE A (
                z VARCHAR 'qwewe' DEFAULT (
                    'x INT AS (67); "y""y" BLOB AS (CAST(32 AS BLOB))'
                ) NOT NULL UNIQUE,
                "y""y" VARCHAR 'qwewe' 'NOT' NOT NULL AS (
                    CAST(x AS VARCHAR) || (' is a ''good'' ' || ('value ' || 'I think'))
                ),
                x INT
            );
        `);
        t.deepEqual(
            await sqlite3.tryFetchGeneratedColumnExpression(
                connection,
                undefined,
                "A",
                "x"
            ),
            undefined
        );
        t.deepEqual(
            await sqlite3.tryFetchGeneratedColumnExpression(
                connection,
                undefined,
                "A",
                "y\"y"
            ),
            //@todo Support generated column expression extraction
            ""
        );
        t.deepEqual(
            await sqlite3.tryFetchGeneratedColumnExpression(
                connection,
                undefined,
                "A",
                "z"
            ),
            undefined
        );
    });
});
