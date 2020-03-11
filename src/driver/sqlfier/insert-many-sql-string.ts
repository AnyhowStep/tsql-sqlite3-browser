import * as tm from "type-mapping";
import * as squill from "@squill/squill";
import {InsertableTable} from "@squill/squill";
import {sqlfier} from "./sqlfier";
import {tryFetchTableMeta} from "../schema-introspection";
import {Connection} from "../execution";
import {DEFAULT_SCHEMA_NAME} from "../constants";

export async function insertManySqlString<
    TableT extends InsertableTable
> (
    connection : Connection,
    insertType : string,
    table : TableT,
    insertRows : readonly [squill.BuiltInInsertRow<TableT>, ...squill.BuiltInInsertRow<TableT>[]]
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

    const values = insertRows.map(insertRow => {
        const ast = columnAliases
            .map(columnAlias => {
                const value = insertRow[columnAlias as unknown as keyof typeof insertRow];
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
                    return squill.BuiltInExprUtil.buildAst(
                        value
                    );
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
        ast.unshift("(");
        ast.push(")");
        return ast;
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
        ") VALUES",
        ...values,
    ];
    const sql = squill.AstUtil.toSql(ast, sqlfier);
    return sql;
}
