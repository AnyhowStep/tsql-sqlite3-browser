import {poolTest} from "../../pool-test";
import * as sqlite3 from "../../../../../dist/driver";

poolTest(__filename, async (t, pool) => {
    await pool.acquire(async (connection) => {
        await connection.exec(`
            CREATE TABLE A (
                x INT,
                y VARCHAR AS (CAST(x AS VARCHAR) || ' is a good value')
            )
        `);
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
    });
});
