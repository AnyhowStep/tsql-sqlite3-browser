import {poolTest} from "../../../pool-test";
import * as sql from "@squill/squill";
import * as sqlite3 from "../../../../../../dist/driver";

poolTest(__filename, async (t, pool) => {
    await pool.acquire(async (connection) => {
        const q = sql.selectValue(() => sql.double.fractionalRemainder(
            Infinity,
            Infinity
        ));
        t.deepEqual(
            sqlite3.toSqlPretty(q),
            'SELECT\n' +
            '  (\n' +
            '    CASE\n' +
            '      WHEN (1e999) = 1e999 THEN NULL\n' +
            '      WHEN (1e999) = -1e999 THEN NULL\n' +
            '      WHEN (1e999) = 1e999 THEN (1e999)\n' +
            '      WHEN (1e999) = -1e999 THEN (1e999)\n' +
            '      WHEN (1e999) >= 0 THEN (\n' +
            '        (1e999) - FLOOR((1e999) / ABS((1e999))) * ABS((1e999))\n' +
            '      )\n' +
            '      ELSE - (\n' +
            '        (- (1e999)) - FLOOR((- (1e999)) / ABS((1e999))) * ABS((1e999))\n' +
            '      )\n' +
            '    END\n' +
            '  ) AS "$aliased--value"'
        );
        t.deepEqual(
            await q.fetchValue(connection),
            null
        );
    });
});
