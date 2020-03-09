import * as squill from "@squill/squill";
import {InsertableTable} from "@squill/squill";
import {sqlfier} from "./sqlfier";

export function insertOneSqlString<
    TableT extends InsertableTable
> (
    insertType : string,
    table : TableT,
    insertRow : squill.BuiltInInsertRow<TableT>
) : string {
    const columnAliases = squill.TableUtil.columnAlias(table)
        .filter(columnAlias => {
            return (insertRow as { [k:string]:unknown })[columnAlias] !== undefined;
        })
        .sort();

    const values = columnAliases
        .map(columnAlias => squill.BuiltInExprUtil.buildAst(
            insertRow[columnAlias as unknown as keyof typeof insertRow]
        ))
        .reduce<squill.Ast[]>(
            (values, ast) => {
                if (values.length > 0) {
                    values.push(", ");
                }
                values.push(ast);
                return values;
            },
            [] as squill.Ast[]
        );

    const ast : squill.Ast[] = values.length == 0 ?
        [
            `${insertType} INTO`,
            /**
             * We use the `unaliasedAst` because the user may have called `setSchemaName()`
             */
            table.unaliasedAst,
            "DEFAULT VALUES",
        ] :
        [
            `${insertType} INTO`,
            /**
             * We use the `unaliasedAst` because the user may have called `setSchemaName()`
             */
            table.unaliasedAst,
            "(",
            columnAliases.map(squill.escapeIdentifierWithDoubleQuotes).join(", "),
            ") VALUES (",
            ...values,
            ")",
        ];
    return squill.AstUtil.toSql(ast, sqlfier);
}
