import * as tm from "type-mapping";
import * as squill from "@squill/squill";
import {sqlfier} from "./sqlfier";
import {Connection} from "../execution";
import {DEFAULT_SCHEMA_NAME} from "../constants";
import {tryFetchTableMeta} from "../schema-introspection";

export async function insertSelectSqlString<
    QueryT extends squill.QueryBaseUtil.AfterSelectClause,
    TableT extends squill.InsertableTable
> (
    connection : Connection,
    insertType : string,
    query : QueryT,
    table : TableT,
    insertSelectRow : squill.InsertSelectRow<QueryT, TableT>
) : Promise<string> {
    const rawSchemaName = squill.TableUtil.tryGetSchemaName(table);
    const schemaName = (
        rawSchemaName == undefined ?
        DEFAULT_SCHEMA_NAME :
        rawSchemaName
    );
    /**
     * We need to fetch the `tableMeta` because SQLite does not support the
     * `DEFAULT` keyword.
     */
    const tableMeta = await tryFetchTableMeta(
        connection,
        schemaName,
        table.alias
    );
    if (tableMeta == undefined) {
        throw new Error(`Table ${squill.pascalStyleEscapeString(schemaName)}.${squill.pascalStyleEscapeString(table.alias)} does not exist`);
    }

    const structure = tableMeta.columns;
    //console.log(structure);

    const columnAliases = squill.TableUtil.columnAlias(table)
        .sort()
        .filter(columnAlias => {
            const columnDef = structure.find(columnDef => {
                return columnDef.name == columnAlias;
            });
            if (columnDef == undefined) {
                throw new Error(`Unknown column ${table.alias}.${columnAlias}`);
            }
            return columnDef.generationExpression == undefined;
        });

    const values = columnAliases
        .map(columnAlias => {
            const value = insertSelectRow[columnAlias as unknown as keyof typeof insertSelectRow];
            if (value === undefined) {
                const columnDef = structure.find(columnDef => {
                    return columnDef.name == columnAlias;
                });
                if (columnDef == undefined) {
                    throw new Error(`Unknown column ${table.alias}.${columnAlias}`);
                }
                if (columnDef.dflt_value != undefined) {
                    return columnDef.dflt_value;
                }

                if (tm.BigIntUtil.equal(columnDef.notnull, tm.BigInt(1))) {
                    if (columnDef.isAutoIncrement) {
                        return "NULL";
                    }
                    throw new Error(`${table.alias}.${columnAlias} is not nullable`);
                } else {
                    return "NULL";
                }
            } else {
                if (squill.ColumnUtil.isColumn(value)) {
                    return squill.escapeIdentifierWithDoubleQuotes(
                        `${(value as squill.IColumn).tableAlias}${squill.SEPARATOR}${(value as squill.IColumn).columnAlias}`
                    );
                } else {
                    return squill.BuiltInExprUtil.buildAst(
                        value
                    );
                }
            }
        })
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

    const ast : squill.Ast[] = [
        `${insertType} INTO`,
        /**
         * We use the `unaliasedAst` because the user may have called `setSchemaName()`
         */
        table.unaliasedAst,
        "(",
        columnAliases.map(squill.escapeIdentifierWithDoubleQuotes).join(", "),
        ")",
        "SELECT",
        ...values,
        "FROM",
        "(",
        query,
        ") AS tmp"
    ];
    const sql = squill.AstUtil.toSql(ast, sqlfier);
    return sql;
}
