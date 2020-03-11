import {poolTest} from "../../pool-test";
//import * as sql from "@squill/squill";
//import * as sqlite3 from "../../../../../dist/driver";

poolTest(__filename, async (t, pool) => {
    await pool.acquire(async (connection) => {
        await connection.createFunction(
            "deterministic",
            {
                isVarArg : false,
                isDeterministic : true,
            },
            () => 1
        );

        await connection.exec(`CREATE TABLE T (x INT, y INT AS (deterministic()))`)
            .then(() => {
                t.pass("deterministic functions allowed in generated columns");
            })
            .catch((err) => {
                t.fail(err.message + "\n" + err.stack);
            });
    });
});
