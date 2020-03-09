import * as tm from "type-mapping";
import * as squill from "@squill/squill";

export const lastInsertRowId = squill.makeCustomOperator0<bigint>(
    "LAST_INSERT_ROWID()",
    tm.mysql.bigIntSigned()
);
