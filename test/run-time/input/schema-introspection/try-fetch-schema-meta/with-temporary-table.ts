import {poolTest} from "../../pool-test";
import * as sqlite3 from "../../../../../dist/driver";

poolTest(__filename, async (t, pool) => {
    await pool.acquire(async (connection) => {
        await connection.exec(`
            CREATE TEMPORARY TABLE T (x INT)
        `);

        t.deepEqual(
            await sqlite3.tryFetchSchemaMeta(
                connection,
                "temp"
            ),
            {
                schemaAlias : "temp",
                tables : [
                    {
                        tableAlias : "T",

                        columns : [
                            {
                                cid : BigInt(0),
                                name : "x",
                                type : "INT",
                                notnull : BigInt(0),
                                dflt_value : null,
                                pk : BigInt(0),
                                hidden : BigInt(0),

                                isAutoIncrement : false,
                                isUnique : false,
                                isPrimaryKey : false,

                                columnAlias : "x",
                                isNullable : true,
                                explicitDefaultValue : undefined,
                                generationExpression : undefined,
                            }
                        ],
                        candidateKeys : [],

                        primaryKey : undefined,
                    }
                ],
            }
        );
    });
});
