import * as squill from "@squill/squill";
import {DeletableTable, WhereClause} from "@squill/squill";
import {sqlfier} from "./sqlfier";

export function deleteSqlString (
    table : DeletableTable,
    whereClause : WhereClause
) : string {
    const ast : squill.Ast[] = [
        "DELETE FROM",
        table.unaliasedAst,
        "WHERE",
        whereClause.ast
    ];
    return squill.AstUtil.toSql(ast, sqlfier);
}
