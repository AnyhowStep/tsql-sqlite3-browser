import {poolTest} from "../../pool-test";
import * as sqlite3 from "../../../../../dist/driver";

poolTest(__filename, async (t, pool) => {
    await pool.acquire(async (connection) => {
        await connection.exec(`
            CREATE TABLE A (
                z VARCHAR 'qwewe' AS (
                    MAX(CAST(x AS VARCHAR), y) || (' is a ''good'' ' || ('value ' || 'I think'))
                ) NOT NULL,
                y VARCHAR 'qwewe' AS (
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
                "y"
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
            //@todo Support generated column expression extraction
            ""
        );
    });
});
