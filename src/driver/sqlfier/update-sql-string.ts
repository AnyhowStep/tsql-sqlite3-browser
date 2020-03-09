import * as squill from "@squill/squill";
import {sqlfier} from "./sqlfier";

export function updateSqlString<TableT extends squill.ITable> (
    table : TableT,
    whereClause : squill.WhereClause,
    assignmentMap : squill.BuiltInAssignmentMap<TableT>
) : string|undefined {
    const mutableColumnAlias = Object.keys(assignmentMap)
        .filter(columnAlias => {
            const value = assignmentMap[columnAlias as keyof typeof assignmentMap];
            return (
                value !== undefined &&
                table.mutableColumns.indexOf(columnAlias) >= 0
            );
        })
        .sort();

    if (mutableColumnAlias.length == 0) {
        //Empty assignment list...
        return undefined;
    }

    const assignmentList = mutableColumnAlias.reduce<squill.Ast[]>(
        (ast, columnAlias) => {
            const value = assignmentMap[columnAlias as keyof typeof assignmentMap];
            const assignment = [
                squill.escapeIdentifierWithDoubleQuotes(columnAlias),
                "=",
                squill.BuiltInExprUtil.buildAst(value as Exclude<typeof value, undefined>)
            ];

            if (ast.length > 0) {
                ast.push(",");
            }
            ast.push(assignment);
            return ast;
        },
        []
    );

    const ast : squill.Ast[] = [
        "UPDATE",
        table.unaliasedAst,
        "SET",
        ...assignmentList,
        "WHERE",
        whereClause.ast
    ];
    const sql = squill.AstUtil.toSql(ast, sqlfier);
    return sql;
}
