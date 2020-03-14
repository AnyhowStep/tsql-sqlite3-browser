import * as squill from "@squill/squill";

/**
 * This table is all kinds of messed up.
 *
 * This thrwos a "column not found" error... When the column clearly exists.
 * https://github.com/AnyhowStep/tsql-sqlite3-browser/issues/5
 * ```sql
 *  SELECT
 *      sqlite_master.sql
 *  FROM
 *      temp.sqlite_master;
 * ```
 */
export const sqlite_master = squill.table("sqlite_master")
    .addColumns({
        //table, index
        type : squill.dtVarChar(),
        name : squill.dtVarChar(),
        tbl_name : squill.dtVarChar(),
        rootpage : squill.dtBigIntSigned(),
        sql : squill.dtVarChar().orNull(),
    })
    .setPrimaryKey(columns => [columns.name]);
