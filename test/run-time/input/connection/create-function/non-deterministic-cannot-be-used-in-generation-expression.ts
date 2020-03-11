import {poolTest} from "../../pool-test";
//import * as sql from "@squill/squill";
//import * as sqlite3 from "../../../../../dist/driver";

poolTest(__filename, async (t, pool) => {
    await pool.acquire(async (connection) => {
        await connection.createFunction(
            "non_deterministic",
            {
                isVarArg : false,
                isDeterministic : false,
            },
            () => 1
        );

        await connection.exec(`CREATE TABLE T (x INT, y INT AS (non_deterministic()))`)
            .then(() => {
                t.fail("non-deterministic functions prohibited in generated columns");
            })
            .catch((err) => {
                t.true(
                    String(err.message).includes("non-deterministic functions prohibited in generated columns")
                );
            });
    });
});
