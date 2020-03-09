import * as squill from "@squill/squill";

export const sqlite_master = squill.table("sqlite_master")
    .addColumns({
        type : squill.dtVarChar(),
        name : squill.dtVarChar(),
        tbl_name : squill.dtVarChar(),
        rootpage : squill.dtBigIntSigned(),
        sql : squill.dtVarChar().orNull(),
    })
    .setPrimaryKey(columns => [columns.name]);
